

# Database Security Improvements: Profiles RLS Fix and Dashboard Stats RPC

## Overview

This plan addresses two database improvements requested:
1. **Restrict Profiles Access**: Update the profiles table RLS policy to ensure users can ONLY see their own profile (more restrictive than current)
2. **Add Dashboard Stats RPC**: Create a new RPC function to efficiently fetch dashboard statistics in a single call

---

## Current State Analysis

### Profiles Table RLS (Current)
The current policy in `RLS_MIGRATION.sql` (lines 543-548) allows:
- Super admins can view all profiles
- Admins can view all profiles
- Users can view their own profile

```sql
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)  -- This allows admins to see all profiles
  OR id = auth.uid()
);
```

### Dashboard Stats (Current)
The `AdminDashboard.tsx` component fetches stats using 8 separate parallel queries:
- students (count)
- courses (count)
- faculty (count)
- fee_payments (sum)
- student_fees (pending count)
- exams (scheduled count)
- books (active count)
- attendance_records (for calculating rate)

---

## Changes Required

### 1. Profiles RLS Policy Fix

**Current Issue**: Admins can view ALL profiles, not just their own  
**Requested Change**: Users should ONLY be able to see their own profile

| Role | Current Access | New Access |
|------|---------------|------------|
| super_admin | All profiles | Own profile only |
| admin | All profiles | Own profile only |
| Regular users | Own profile | Own profile only |

**New Policy**:
```sql
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
```

This is the most restrictive approach - everyone can only see their own profile.

### 2. Dashboard Stats RPC Function

Create a SECURITY DEFINER function that returns all dashboard stats in a single call.

**Note**: The user's original query references a `fees` table, but the actual table is `student_fees`. I'll use the correct table names from the existing schema.

```sql
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
  v_college_id UUID;
BEGIN
  -- Get user's college for data isolation
  v_college_id := get_user_college();
  
  SELECT json_build_object(
    'total_students', (
      SELECT COUNT(*) FROM public.students 
      WHERE status = 'active' 
      AND (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'total_courses', (
      SELECT COUNT(*) FROM public.courses 
      WHERE status = 'active'
      AND (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'total_subjects', (
      SELECT COUNT(*) FROM public.subjects
      WHERE (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'total_faculty', (
      SELECT COUNT(*) FROM public.faculty 
      WHERE status = 'active'
      AND (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'pending_fees', (
      SELECT COALESCE(SUM(balance), 0) FROM public.student_fees 
      WHERE status = 'pending'
      AND (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'pending_fees_count', (
      SELECT COUNT(*) FROM public.student_fees 
      WHERE status = 'pending'
      AND (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'active_exams', (
      SELECT COUNT(*) FROM public.exams 
      WHERE status = 'scheduled'
      AND (college_id = v_college_id OR v_college_id IS NULL)
    ),
    'library_books', (
      SELECT COUNT(*) FROM public.books 
      WHERE status = 'active'
      AND (college_id = v_college_id OR v_college_id IS NULL)
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
```

---

## Implementation Steps

### Step 1: Create Migration File
A new SQL migration will be created with:
- Drop existing `profiles_select` policy
- Create new restrictive `profiles_select` policy
- Create `get_dashboard_stats()` RPC function

### Step 2: Update AdminDashboard Component (Optional)
After the migration is applied, update `AdminDashboard.tsx` to use the new RPC function instead of 8 separate queries:

```typescript
// Before: 8 separate queries
const [studentsResult, coursesResult, ...] = await Promise.all([...]);

// After: Single RPC call
const { data: stats } = await supabase.rpc('get_dashboard_stats');
```

---

## Security Considerations

| Aspect | Implementation |
|--------|----------------|
| Data Isolation | RPC function uses `get_user_college()` to ensure multi-tenant data isolation |
| Permission Check | SECURITY DEFINER with explicit search_path prevents privilege escalation |
| RLS Bypass | Function bypasses RLS (intentionally) to aggregate counts efficiently |
| Access Control | Only authenticated users can execute the function |

---

## Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| New migration file | Create | SQL migration for RLS fix and RPC function |
| `src/components/dashboard/AdminDashboard.tsx` | Optional update | Use new RPC function for cleaner code |
| `src/integrations/supabase/types.ts` | Auto-regenerate | Will update automatically when types are regenerated |

---

## Testing Recommendations

After applying the migration:
1. Test that regular users can only view their own profile
2. Test that admins can no longer view other users' profiles
3. Test that `get_dashboard_stats()` returns correct counts
4. Verify multi-tenant isolation (college A data not visible to college B)


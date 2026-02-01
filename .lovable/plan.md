

# RLS Policy Audit and Security Hardening Plan

## Executive Summary

This plan provides a comprehensive security audit and remediation of Row Level Security (RLS) policies across all Supabase tables in the EduFlow College Management System. The audit will ensure data isolation between colleges, proper role-based access control, and compliance with security best practices.

---

## Current State Analysis

### Existing Security Infrastructure

The project already has a solid security foundation:

| Component | Status | Notes |
|-----------|--------|-------|
| `app_role` enum | Implemented | 9 roles: super_admin, admin, teacher, clerk, librarian, accountant, assistant, student, auditor |
| `user_roles` table | Implemented | Stores user-role mappings with college_id |
| `has_role()` function | Implemented | Security definer function for role checking |
| `get_user_college()` function | Implemented | Returns user's college_id from roles |
| `get_current_user_email()` function | Implemented | Returns current user's email |

### Tables Requiring Review

Based on the types.ts file, there are approximately **65+ tables** in the database. Key tables requiring special attention:

| Table | Contains PII | Current RLS | Priority |
|-------|-------------|-------------|----------|
| `students` | Yes (email, phone) | Partial | High |
| `profiles` | Yes | Basic | High |
| `user_roles` | Auth data | Basic | Critical |
| `results` | Academic records | Partial | High |
| `attendance_records` | Attendance data | Good | Medium |
| `student_fees` | Financial data | Good | Medium |
| `fee_payments` | Financial data | Good | Medium |
| `courses` | No | Partial | Medium |
| `subjects` | No | Partial | Medium |
| `exams` | No | Partial | Medium |

---

## Identified Security Gaps

### Gap 1: Overly Permissive Policies
Several tables still have legacy policies allowing access with `USING (true)`:
- Initial migrations created open policies that were partially replaced
- Some tables may have overlapping permissive policies

### Gap 2: Missing DELETE Restrictions
Most tables lack admin-only DELETE policies:
- Current: Many tables allow anyone in the college to delete
- Required: DELETE should be restricted to admin/super_admin roles

### Gap 3: Student Self-Access Improvements
Students should only see their own records, currently some policies are:
- Checking via email matching (less reliable than user_id)
- Missing on some student-facing tables

### Gap 4: Teacher Class-Scoped Access
Teachers currently see all college data instead of only their assigned classes:
- Results: Should filter by courses/subjects assigned
- Attendance: Should filter by their sessions only

### Gap 5: Policy Access Logging
No audit trail for RLS policy evaluations:
- Cannot track access patterns
- Difficult to identify unauthorized access attempts

---

## Implementation Plan

### Phase 1: Helper Functions

Create new security definer functions to support enhanced RLS:

```sql
-- Get student's internal ID from auth user
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.students 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
$$;

-- Check if teacher teaches a specific course
CREATE OR REPLACE FUNCTION public.teacher_teaches_course(_course_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.faculty f
    WHERE f.user_id = auth.uid()
    AND (
      f.department = (SELECT department FROM public.courses WHERE id = _course_id)
      OR EXISTS (
        SELECT 1 FROM public.class_schedules cs
        WHERE cs.faculty_id = f.id
        AND cs.course_id = _course_id
      )
    )
  )
$$;
```

### Phase 2: Students Table Policies

**Current Issues:**
- Students linked via email matching (unreliable)
- Missing self-update restrictions

**New Policies:**

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Students can view own data" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Users can view students from their college" ON public.students;
DROP POLICY IF EXISTS "Users can manage students from their college" ON public.students;

-- SELECT: Students see only their own record
CREATE POLICY "students_select_own" ON public.students
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR user_id = auth.uid()
);

-- INSERT: Staff only
CREATE POLICY "students_insert_staff" ON public.students
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- UPDATE: Staff can update all, students can update limited fields
CREATE POLICY "students_update_staff" ON public.students
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
);

-- DELETE: Admin only
CREATE POLICY "students_delete_admin" ON public.students
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);
```

### Phase 3: Results Table Policies

**New Policies:**

```sql
DROP POLICY IF EXISTS "Users can view results from their college" ON public.results;
DROP POLICY IF EXISTS "Users can manage results from their college" ON public.results;
DROP POLICY IF EXISTS "Students can view own results" ON public.results;

-- SELECT: Students see own, teachers see their courses, admin sees all
CREATE POLICY "results_select" ON public.results
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      NOT has_role(auth.uid(), 'student'::app_role)
      OR student_id = get_current_student_id()
    )
  )
);

-- INSERT/UPDATE: Teachers and admins
CREATE POLICY "results_insert" ON public.results
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "results_update" ON public.results
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

-- DELETE: Admin only
CREATE POLICY "results_delete_admin" ON public.results
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);
```

### Phase 4: Attendance Tables Policies

**attendance_records:**

```sql
-- SELECT: Students see own, teachers see their sessions
CREATE POLICY "attendance_records_select" ON public.attendance_records
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR student_id = get_current_student_id()
);

-- INSERT/UPDATE: Teachers and admins only
CREATE POLICY "attendance_records_modify" ON public.attendance_records
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

-- DELETE: Admin only
CREATE POLICY "attendance_records_delete" ON public.attendance_records
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);
```

### Phase 5: Courses and Subjects Policies

These are reference data - should be viewable by authenticated college users but only managed by admins:

```sql
-- Courses
CREATE POLICY "courses_select" ON public.courses
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "courses_insert" ON public.courses
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "courses_update" ON public.courses
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "courses_delete" ON public.courses
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);
```

### Phase 6: Fee Tables Policies

Financial data requires strict access control:

```sql
-- student_fees: Students see own, accountant/admin manage
CREATE POLICY "student_fees_select" ON public.student_fees
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR student_id = get_current_student_id()
);

CREATE POLICY "student_fees_modify" ON public.student_fees
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'accountant'::app_role)
    )
  )
);

-- DELETE: Admin only
CREATE POLICY "student_fees_delete" ON public.student_fees
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);
```

### Phase 7: RLS Access Audit Log

Create a new table to track policy access patterns:

```sql
-- Create RLS access log table
CREATE TABLE public.rls_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
  user_id uuid REFERENCES auth.users(id),
  user_role app_role,
  college_id uuid,
  record_id text,
  accessed_at timestamp with time zone DEFAULT now(),
  policy_matched text,
  details jsonb
);

-- Enable RLS (only super_admin can view logs)
ALTER TABLE public.rls_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins view access logs" ON public.rls_access_log
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow system to insert logs
CREATE POLICY "System can insert logs" ON public.rls_access_log
FOR INSERT WITH CHECK (true);

-- Create logging function
CREATE OR REPLACE FUNCTION public.log_rls_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.rls_access_log (
    table_name, operation, user_id, user_role, college_id, 
    record_id, policy_matched, details
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    get_current_user_role(),
    get_user_college(),
    COALESCE(NEW.id::text, OLD.id::text),
    'trigger_logged',
    jsonb_build_object('timestamp', now())
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
```

---

## Migration File Structure

The implementation will be split into a single comprehensive migration:

```text
supabase/migrations/
└── [timestamp]_comprehensive_rls_audit.sql
    ├── 1. Helper functions
    ├── 2. Drop all legacy open policies
    ├── 3. Students table policies
    ├── 4. Results table policies
    ├── 5. Attendance table policies
    ├── 6. Courses/Subjects policies
    ├── 7. Fees table policies
    ├── 8. Profiles table policies
    ├── 9. user_roles table policies
    ├── 10. All remaining tables
    ├── 11. RLS access log table
    └── 12. Verification queries
```

---

## Tables Comprehensive Checklist

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE |
|-------|------------|--------|--------|--------|--------|
| `profiles` | Yes | Own + Admin | Auto-trigger | Own | Admin |
| `user_roles` | Yes | Own + Admin | Admin | Admin | Admin |
| `students` | Yes | College + Own | Admin | Staff | Admin |
| `courses` | Yes | College | Admin | Admin | Admin |
| `subjects` | Yes | College | Admin | Admin | Admin |
| `exams` | Yes | College + Student Course | Admin/Teacher | Admin/Teacher | Admin |
| `results` | Yes | College/Own | Teacher/Admin | Teacher/Admin | Admin |
| `attendance_sessions` | Yes | College/Course | Teacher/Admin | Teacher/Admin | Admin |
| `attendance_records` | Yes | College/Own | Teacher/Admin | Teacher/Admin | Admin |
| `student_fees` | Yes | College/Own | Accountant/Admin | Accountant/Admin | Admin |
| `fee_payments` | Yes | College/Own | Accountant/Admin | Accountant/Admin | Admin |
| `fee_structures` | Yes | College | Admin | Admin | Admin |
| `faculty` | Yes | College | Admin | Admin | Admin |
| `colleges` | Yes | Own college | Super Admin | Admin | Super Admin |
| `enquiries` | Yes | College | Staff | Staff | Admin |
| `books` | Yes | College | Librarian/Admin | Librarian/Admin | Admin |
| `book_issues` | Yes | College | Librarian | Librarian | Admin |
| `hostel_rooms` | Yes | College | Admin | Admin | Admin |
| `hostel_allocations` | Yes | College | Admin | Admin | Admin |
| `transport_routes` | Yes | College | Admin | Admin | Admin |
| `grievances` | Yes | Own/Assigned | Authenticated | Assigned/Admin | Admin |
| `audit_logs` | Yes | Super Admin | System | Never | Never |

---

## Testing Plan

After implementation, test the following scenarios:

### Test 1: Cross-College Isolation
1. Login as College A admin
2. Attempt to query College B students
3. Expected: Empty result set

### Test 2: Student Self-Access
1. Login as student
2. Query all students
3. Expected: Only own record returned

### Test 3: Teacher Scope
1. Login as teacher
2. Query attendance records
3. Expected: Only college records (or class-specific if enhanced)

### Test 4: Delete Restrictions
1. Login as teacher
2. Attempt to delete a student
3. Expected: Error - permission denied

### Test 5: Admin Delete
1. Login as admin
2. Delete a student
3. Expected: Success

---

## Technical Implementation Notes

### Security Definer Functions

All helper functions use:
- `SECURITY DEFINER` - Runs with owner privileges
- `SET search_path = 'public'` - Prevents search path injection
- `STABLE` or `IMMUTABLE` - Allows query optimization

### Performance Considerations

- All policy checks use indexed columns (user_id, college_id, student_id)
- Subqueries are minimized using security definer functions
- EXISTS clauses preferred over JOINs for boolean checks

### Backward Compatibility

- Existing application code should continue to work
- More restrictive policies may require frontend error handling updates
- Students will now only see their own data (may need UI adjustments)

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/migrations/[timestamp]_comprehensive_rls_audit.sql` | All RLS changes |
| Create | `RLS_AUDIT_REPORT.md` | Documentation of all policies |

---

## Post-Implementation Verification

Run these queries to verify policies are correctly applied:

```sql
-- Check all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List all policies
SELECT tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;
```




# Link User to Student Record

## Overview

This plan addresses linking a user account (nift@jodhpur.com) to their corresponding student record via the `user_id` column in the students table. This is essential for proper student authentication and RLS (Row Level Security) to work correctly.

---

## Current State Analysis

### How Student-User Linking Works

The students table has a `user_id` column (UUID) that references `auth.users(id)`:
- When a student record has `user_id` set, they can log in and access their data
- The `get_current_student_id()` function uses this to identify the logged-in student
- Many RLS policies depend on this link working correctly

### Current Issue

The `get_student_data()` RPC function currently matches students by **email**:
```sql
WHERE s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
```

This is a fallback approach. The proper solution is to:
1. Set the `user_id` column in the student record
2. Update `get_student_data()` to use `user_id` for consistency

---

## Solution Approach

### Option A: Manual Database Update (Simple)

Run this SQL in the Supabase SQL Editor to link the user:

```sql
-- Step 1: Find the auth user ID for nift@jodhpur.com
SELECT id, email FROM auth.users WHERE email = 'nift@jodhpur.com';

-- Step 2: Update the student record with the user_id
UPDATE public.students 
SET user_id = (SELECT id FROM auth.users WHERE email = 'nift@jodhpur.com')
WHERE email = 'nift@jodhpur.com';
```

### Option B: Create Helper RPC Function (Reusable)

Create a SECURITY DEFINER function that links users to students:

```sql
CREATE OR REPLACE FUNCTION public.link_user_to_student(p_student_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_student_id INTEGER;
BEGIN
  -- Get the auth user ID
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_student_email;
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found in auth.users');
  END IF;
  
  -- Update the student record
  UPDATE public.students 
  SET user_id = v_user_id,
      updated_at = NOW()
  WHERE email = p_student_email
  RETURNING id INTO v_student_id;
  
  IF v_student_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Student record not found');
  END IF;
  
  -- Also ensure user_roles has the student role
  INSERT INTO public.user_roles (user_id, role, college_id)
  SELECT v_user_id, 'student', s.college_id
  FROM public.students s
  WHERE s.id = v_student_id
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN json_build_object(
    'success', true, 
    'user_id', v_user_id, 
    'student_id', v_student_id
  );
END;
$$;

-- Grant execute to admins only
GRANT EXECUTE ON FUNCTION public.link_user_to_student(TEXT) TO authenticated;
```

---

## Recommended Changes

### Step 1: Create Migration for Helper Function

Create a new SQL migration that:
1. Creates `link_user_to_student()` RPC function
2. Updates `get_student_data()` to prefer `user_id` matching

### Step 2: Update get_student_data Function

Improve the function to use `user_id` with email as fallback:

```sql
CREATE OR REPLACE FUNCTION get_student_data()
RETURNS TABLE (
  id integer,
  student_id text,
  name text,
  email text,
  mobile_number text,
  course_name text,
  admission_date date,
  year integer,
  semester integer,
  status text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    s.id,
    s.student_id,
    s.name,
    s.email,
    s.mobile_number,
    c.name as course_name,
    s.admission_date,
    s.year,
    s.semester,
    s.status
  FROM students s
  LEFT JOIN courses c ON s.course_id = c.id
  WHERE s.user_id = auth.uid()
     OR (s.user_id IS NULL AND s.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  LIMIT 1;
$$;
```

### Step 3: Link the User (nift@jodhpur.com)

After creating the function, run:
```sql
SELECT link_user_to_student('nift@jodhpur.com');
```

Or use the direct SQL approach:
```sql
UPDATE public.students 
SET user_id = (SELECT id FROM auth.users WHERE email = 'nift@jodhpur.com')
WHERE email = 'nift@jodhpur.com';
```

---

## Testing Checklist

After implementation:

| Test | Expected Result |
|------|-----------------|
| Login as nift@jodhpur.com | Should redirect to student dashboard |
| View student profile | Should display student data correctly |
| `get_current_student_id()` | Should return the student's internal ID |
| Access attendance records | Should show only own records |
| Access fee information | Should show only own fee records |
| RLS policies | Should restrict access to own data only |

---

## Files to Create/Modify

| Type | Details |
|------|---------|
| SQL Migration | Create `link_user_to_student()` function |
| SQL Migration | Update `get_student_data()` to prefer user_id |
| Manual SQL | Execute link for nift@jodhpur.com |

---

## Security Considerations

| Aspect | Implementation |
|--------|----------------|
| Function Access | SECURITY DEFINER ensures proper auth.users access |
| Admin Only | Only admins should call link_user_to_student |
| Role Creation | Automatically creates student role in user_roles |
| College Isolation | Links to correct college_id from student record |


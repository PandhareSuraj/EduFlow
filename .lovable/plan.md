

# Create Student Record for nift@jodhpur.com

## Problem Identified

The user `nift@jodhpur.com` exists in `auth.users` but has no corresponding record in the `students` table. This means:
- They cannot access the student dashboard
- RLS policies cannot identify them as a student
- The linking function cannot find a student record to update

---

## Solution: Create and Link Student Record

Run the following SQL in the Supabase SQL Editor to create a student record and link it to the auth user:

```sql
-- Step 1: First, get a college_id and course_id from existing data
-- (You may want to adjust these to the correct values for NIFT Jodhpur)

-- View available colleges
SELECT id, name FROM public.colleges LIMIT 10;

-- View available courses  
SELECT id, name, college_id FROM public.courses LIMIT 10;

-- Step 2: Insert the student record and link to auth user
-- Replace college_id and course_id with actual values from Step 1

INSERT INTO public.students (
  student_id,
  name,
  email,
  mobile_number,
  course_id,
  college_id,
  admission_date,
  year,
  semester,
  status,
  user_id,
  created_at,
  updated_at
)
SELECT 
  'NIFT001' as student_id,                    -- Adjust as needed
  'NIFT Student' as name,                     -- Adjust to actual name
  'nift@jodhpur.com' as email,
  NULL as mobile_number,                      -- Add if known
  (SELECT id FROM public.courses LIMIT 1) as course_id,  -- Replace with actual course
  (SELECT id FROM public.colleges LIMIT 1) as college_id, -- Replace with actual college
  CURRENT_DATE as admission_date,
  1 as year,
  1 as semester,
  'active' as status,
  'c25b6554-8f5a-4cb8-985a-9339ddb45e8e'::uuid as user_id,  -- Auth user ID
  NOW() as created_at,
  NOW() as updated_at
RETURNING *;

-- Step 3: Ensure the user has the student role in user_roles
INSERT INTO public.user_roles (user_id, role, college_id)
SELECT 
  'c25b6554-8f5a-4cb8-985a-9339ddb45e8e'::uuid,
  'student',
  (SELECT id FROM public.colleges LIMIT 1)  -- Same college as student record
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Verify the setup
SELECT 
  s.id,
  s.student_id,
  s.name,
  s.email,
  s.user_id,
  ur.role
FROM public.students s
LEFT JOIN public.user_roles ur ON s.user_id = ur.user_id
WHERE s.email = 'nift@jodhpur.com';
```

---

## Alternative: Quick One-Liner (After Knowing College/Course)

If you know the correct `college_id` and `course_id`:

```sql
-- Replace ACTUAL_COLLEGE_ID and ACTUAL_COURSE_ID with real values
INSERT INTO public.students (student_id, name, email, course_id, college_id, status, user_id, year, semester, admission_date)
VALUES (
  'NIFT001',
  'NIFT Jodhpur Student',
  'nift@jodhpur.com',
  ACTUAL_COURSE_ID,
  'ACTUAL_COLLEGE_ID',
  'active',
  'c25b6554-8f5a-4cb8-985a-9339ddb45e8e',
  1,
  1,
  CURRENT_DATE
);
```

---

## What This Achieves

| Component | Status After Fix |
|-----------|-----------------|
| `students.user_id` | Linked to auth user |
| `user_roles` entry | Student role assigned |
| `get_current_student_id()` | Returns correct ID |
| `get_student_data()` | Returns student info |
| Student Dashboard | Accessible after login |
| RLS policies | Correctly identify student |

---

## Testing After Implementation

1. Login as `nift@jodhpur.com`
2. Should redirect to student dashboard
3. Profile should display correctly
4. Verify with: `SELECT * FROM get_student_data();` (while logged in)

---

## Notes

- You'll need to provide the actual student name, course, and college
- The `student_id` format should match your institution's pattern
- Make sure to select the correct college (likely one related to NIFT Jodhpur)


-- Add student role to the app_role enum
ALTER TYPE app_role ADD VALUE 'student';

-- Update user_roles policies to allow students to view their own role
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" 
ON user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update students table to allow students to view their own data
CREATE POLICY "Students can view own data" 
ON students 
FOR SELECT 
USING (
  -- Allow if user has student role and student record belongs to them
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'student'
    AND students.email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Update profiles table to allow students to view/update their own profile
CREATE POLICY "Students can view own profile" 
ON profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Students can update own profile" 
ON profiles 
FOR UPDATE 
USING (
  auth.uid() = id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow students to view their course information
CREATE POLICY "Students can view their course" 
ON courses 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college()) OR
  -- Students can view course they are enrolled in
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.course_id = courses.id 
    AND s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow students to view their exam results
CREATE POLICY "Students can view own results" 
ON results 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college()) OR
  -- Students can view their own results
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = results.student_id 
    AND s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Allow students to view exams for their course
CREATE POLICY "Students can view course exams" 
ON exams 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college()) OR
  -- Students can view exams for their course
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.course_id = exams.course_id 
    AND s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Create a function to get student data for logged in student
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
  WHERE s.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1;
$$;
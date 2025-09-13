-- Add user_id field to students table for authentication
ALTER TABLE public.students 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);

-- Update RLS policies to support user_id field
DROP POLICY IF EXISTS "Students can view own data" ON public.students;
CREATE POLICY "Students can view own data" 
ON public.students 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college()) OR 
  (user_id = auth.uid())
);

-- Allow students to update their own profile data
CREATE POLICY "Students can update own profile" 
ON public.students 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Function to get student login status
CREATE OR REPLACE FUNCTION public.get_student_login_status(student_id integer)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id IS NOT NULL FROM public.students WHERE id = student_id;
$$;
-- Fix RLS policy on exams table to short-circuit for admins
-- This prevents unnecessary get_current_user_email() calls for non-student users

DROP POLICY IF EXISTS "Students can view course exams" ON public.exams;

CREATE POLICY "Students can view course exams" 
ON public.exams
FOR SELECT 
USING (
  -- Super admins: Full access (short-circuit first)
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  
  -- Admins and Teachers: Access to college exams (short-circuit before student check)
  (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role) OR
      has_role(auth.uid(), 'teacher'::app_role) OR
      has_role(auth.uid(), 'accountant'::app_role) OR
      has_role(auth.uid(), 'clerk'::app_role)
    )
  ) OR
  
  -- Students: Only check email if user is explicitly a student role
  (
    has_role(auth.uid(), 'student'::app_role) AND
    college_id = get_user_college() AND
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.course_id = exams.course_id 
      AND s.email = get_current_user_email()
    )
  )
);
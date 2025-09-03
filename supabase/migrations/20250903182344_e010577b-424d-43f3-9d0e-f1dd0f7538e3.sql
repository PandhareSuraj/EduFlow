-- Update RLS policies for departments to allow teachers to view departments
DROP POLICY IF EXISTS "Users can view departments from their college" ON public.departments;
CREATE POLICY "Users can view departments from their college" 
ON public.departments 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

-- Update RLS policies for departments to allow more roles to manage
DROP POLICY IF EXISTS "Admins can manage departments in their college" ON public.departments;
CREATE POLICY "Users can manage departments in their college" 
ON public.departments 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (
    college_id = get_user_college() AND 
    (
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'teacher'::app_role)
    )
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (
    college_id = get_user_college() AND 
    (
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

-- Create triggers to auto-populate college_id for departments
CREATE OR REPLACE TRIGGER auto_fill_departments_college_id
  BEFORE INSERT ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

-- Create triggers to auto-populate college_id for subjects  
CREATE OR REPLACE TRIGGER auto_fill_subjects_college_id
  BEFORE INSERT ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();
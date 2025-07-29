-- Get the college ID and update existing data
DO $$
DECLARE
  college_uuid UUID;
BEGIN
  SELECT id INTO college_uuid FROM public.colleges WHERE code = 'KKPPC';
  
  -- Update all existing records to belong to KK Patil College
  UPDATE public.students SET college_id = college_uuid WHERE college_id IS NULL;
  UPDATE public.courses SET college_id = college_uuid WHERE college_id IS NULL;
  UPDATE public.subjects SET college_id = college_uuid WHERE college_id IS NULL;
  UPDATE public.exams SET college_id = college_uuid WHERE college_id IS NULL;
  UPDATE public.results SET college_id = college_uuid WHERE college_id IS NULL;
  UPDATE public.student_documents SET college_id = college_uuid WHERE college_id IS NULL;
  UPDATE public.user_roles SET college_id = college_uuid WHERE college_id IS NULL;
END $$;

-- Update RLS policies for all tables to include college_id filtering
-- Students policies
DROP POLICY IF EXISTS "Students are viewable by everyone" ON public.students;
DROP POLICY IF EXISTS "Students can be managed by authenticated users" ON public.students;
DROP POLICY IF EXISTS "Users can view students from their college" ON public.students;
DROP POLICY IF EXISTS "Users can manage students from their college" ON public.students;

CREATE POLICY "Users can view students from their college" 
ON public.students 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can manage students from their college" 
ON public.students 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

-- Courses policies
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Courses can be managed by authenticated users" ON public.courses;
DROP POLICY IF EXISTS "Users can view courses from their college" ON public.courses;
DROP POLICY IF EXISTS "Users can manage courses from their college" ON public.courses;

CREATE POLICY "Users can view courses from their college" 
ON public.courses 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can manage courses from their college" 
ON public.courses 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);
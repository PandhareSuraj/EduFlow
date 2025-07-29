-- Complete the remaining RLS policies for other tables
-- Subjects policies  
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
DROP POLICY IF EXISTS "Subjects can be managed by authenticated users" ON public.subjects;

CREATE POLICY "Users can view subjects from their college" 
ON public.subjects 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can manage subjects from their college" 
ON public.subjects 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

-- Exams policies
DROP POLICY IF EXISTS "Exams are viewable by everyone" ON public.exams;
DROP POLICY IF EXISTS "Exams can be managed by authenticated users" ON public.exams;

CREATE POLICY "Users can view exams from their college" 
ON public.exams 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can manage exams from their college" 
ON public.exams 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

-- Results policies
DROP POLICY IF EXISTS "Results are viewable by everyone" ON public.results;
DROP POLICY IF EXISTS "Results can be managed by authenticated users" ON public.results;

CREATE POLICY "Users can view results from their college" 
ON public.results 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can manage results from their college" 
ON public.results 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

-- Student documents policies
DROP POLICY IF EXISTS "Student documents are viewable by everyone" ON public.student_documents;
DROP POLICY IF EXISTS "Student documents can be managed by authenticated users" ON public.student_documents;

CREATE POLICY "Users can view student documents from their college" 
ON public.student_documents 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can manage student documents from their college" 
ON public.student_documents 
FOR ALL 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);
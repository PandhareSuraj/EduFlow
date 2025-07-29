-- First, update the app_role enum to include super_admin
ALTER TYPE public.app_role ADD VALUE 'super_admin';

-- Create colleges table for multi-tenancy
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on colleges table
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

-- Create policies for colleges table
CREATE POLICY "Super admins can manage all colleges" 
ON public.colleges 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view their college" 
ON public.colleges 
FOR SELECT 
USING (
  id IN (
    SELECT college_id FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin'::app_role, 'teacher'::app_role, 'clerk'::app_role, 'librarian'::app_role, 'accountant'::app_role, 'assistant'::app_role)
  )
);

-- Add college_id to user_roles table for multi-tenancy
ALTER TABLE public.user_roles ADD COLUMN college_id UUID REFERENCES public.colleges(id);

-- Add college_id to all existing tables for multi-tenancy
ALTER TABLE public.students ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.courses ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.subjects ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.exams ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.results ADD COLUMN college_id UUID REFERENCES public.colleges(id);
ALTER TABLE public.student_documents ADD COLUMN college_id UUID REFERENCES public.colleges(id);

-- Create trigger for colleges updated_at
CREATE TRIGGER update_colleges_updated_at
BEFORE UPDATE ON public.colleges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user's college
CREATE OR REPLACE FUNCTION public.get_user_college()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT college_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Update RLS policies for all tables to include college_id filtering
DROP POLICY IF EXISTS "Students are viewable by everyone" ON public.students;
DROP POLICY IF EXISTS "Students can be managed by authenticated users" ON public.students;

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

-- Update courses policies
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Courses can be managed by authenticated users" ON public.courses;

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

-- Update subjects policies
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

-- Update exams policies
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

-- Update results policies
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

-- Update student_documents policies
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

-- Create default college (KK Patil College)
INSERT INTO public.colleges (name, code, address, phone, email, website) 
VALUES (
  'KK Patil Paramedical College',
  'KKPPC',
  'Pune, Maharashtra',
  '+91-9876543210',
  'admin@kkpatilcollege.edu.in',
  'https://kkpatilcollege.edu.in'
);

-- Get the college ID for updating existing data
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
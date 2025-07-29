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
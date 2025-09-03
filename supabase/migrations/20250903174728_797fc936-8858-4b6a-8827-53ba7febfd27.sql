-- Create departments table for dynamic department management
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text,
  description text,
  college_id uuid REFERENCES public.colleges(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(name, college_id)
);

-- Enable RLS on departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Users can view departments from their college" 
ON public.departments 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Admins can manage departments in their college" 
ON public.departments 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)));

-- Insert default departments for existing colleges
INSERT INTO public.departments (name, code, college_id, description)
SELECT 'Radiology', 'RAD', id, 'Radiology and Imaging Technology Department' 
FROM public.colleges 
WHERE status = 'active'
ON CONFLICT (name, college_id) DO NOTHING;

INSERT INTO public.departments (name, code, college_id, description)
SELECT 'Laboratory Technology', 'LAB', id, 'Medical Laboratory Technology Department' 
FROM public.colleges 
WHERE status = 'active'
ON CONFLICT (name, college_id) DO NOTHING;

INSERT INTO public.departments (name, code, college_id, description)
SELECT 'Hospital Management', 'HM', id, 'Hospital Management and Administration Department' 
FROM public.colleges 
WHERE status = 'active'
ON CONFLICT (name, college_id) DO NOTHING;

INSERT INTO public.departments (name, code, college_id, description)
SELECT 'General Studies', 'GS', id, 'General Studies and Basic Sciences Department' 
FROM public.colleges 
WHERE status = 'active'
ON CONFLICT (name, college_id) DO NOTHING;

INSERT INTO public.departments (name, code, college_id, description)
SELECT 'Computer Engineering', 'CE', id, 'Computer Engineering Department' 
FROM public.colleges 
WHERE status = 'active'
ON CONFLICT (name, college_id) DO NOTHING;

-- Create trigger for updating updated_at column
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
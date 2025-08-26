-- Create faculty table
CREATE TABLE public.faculty (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  designation text NOT NULL,
  department text NOT NULL,
  experience text,
  qualification text,
  subjects text[], -- Array of subjects taught
  address text,
  status text NOT NULL DEFAULT 'active',
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Create policies for faculty access
CREATE POLICY "Users can view faculty from their college" 
ON public.faculty 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Users can manage faculty from their college" 
ON public.faculty 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faculty_updated_at
BEFORE UPDATE ON public.faculty
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_faculty_college_id ON public.faculty(college_id);
CREATE INDEX idx_faculty_department ON public.faculty(department);
CREATE INDEX idx_faculty_status ON public.faculty(status);
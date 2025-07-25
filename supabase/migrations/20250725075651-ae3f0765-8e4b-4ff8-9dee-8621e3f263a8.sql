-- Create courses table first
CREATE TABLE public.courses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_months INTEGER NOT NULL DEFAULT 24,
  fees_per_semester DECIMAL(10,2),
  total_semesters INTEGER DEFAULT 4,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses table
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

CREATE POLICY "Courses can be managed by authenticated users" 
ON public.courses 
FOR ALL 
USING (true);

-- Create trigger for timestamps on courses
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample courses
INSERT INTO public.courses (name, code, description, duration_months, fees_per_semester, total_semesters, department) VALUES
('Radiologic Technology', 'RT', 'Medical imaging and radiologic technology program', 24, 25000.00, 4, 'Medical Technology'),
('Medical Laboratory Technology', 'MLT', 'Laboratory diagnostics and medical testing program', 24, 22000.00, 4, 'Medical Technology'),
('Pharmacy Technology', 'PT', 'Pharmaceutical sciences and technology program', 36, 30000.00, 6, 'Pharmacy'),
('Nursing', 'BSN', 'Bachelor of Science in Nursing program', 48, 35000.00, 8, 'Nursing');
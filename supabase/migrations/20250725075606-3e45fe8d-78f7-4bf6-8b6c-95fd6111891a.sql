-- Create students table with comprehensive fields
CREATE TABLE public.students (
  id SERIAL PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL DEFAULT 'STU' || LPAD(nextval('students_id_seq')::TEXT, 6, '0'),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile_number TEXT NOT NULL,
  course_id INTEGER REFERENCES public.courses(id),
  class TEXT,
  semester INTEGER CHECK (semester IN (1, 2, 3, 4, 5, 6, 7, 8)),
  year INTEGER CHECK (year IN (1, 2, 3, 4)),
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_documents table for file uploads
CREATE TABLE public.student_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('aadhar', 'marksheet', 'photo', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for student documents
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', false);

-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Enable RLS on student_documents table  
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Students are viewable by everyone" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Students can be managed by authenticated users" 
ON public.students 
FOR ALL 
USING (true);

-- Create policies for student_documents table
CREATE POLICY "Student documents are viewable by everyone" 
ON public.student_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Student documents can be managed by authenticated users" 
ON public.student_documents 
FOR ALL 
USING (true);

-- Create storage policies for student documents
CREATE POLICY "Student documents are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'student-documents');

CREATE POLICY "Anyone can upload student documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'student-documents');

CREATE POLICY "Anyone can update student documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'student-documents');

CREATE POLICY "Anyone can delete student documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'student-documents');

-- Create trigger for timestamps on students
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for timestamps on student_documents
CREATE TRIGGER update_student_documents_updated_at
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
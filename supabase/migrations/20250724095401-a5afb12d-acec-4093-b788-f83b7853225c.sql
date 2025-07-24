-- Create subjects table (course-specific)
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  credits INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, code)
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  total_marks INTEGER NOT NULL DEFAULT 100,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id INTEGER NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks_obtained DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_marks > 0 THEN (marks_obtained / total_marks) * 100
      ELSE 0
    END
  ) STORED,
  grade TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (marks_obtained / total_marks) * 100 >= 90 THEN 'A+'
      WHEN (marks_obtained / total_marks) * 100 >= 80 THEN 'A'
      WHEN (marks_obtained / total_marks) * 100 >= 70 THEN 'B+'
      WHEN (marks_obtained / total_marks) * 100 >= 60 THEN 'B'
      WHEN (marks_obtained / total_marks) * 100 >= 50 THEN 'C+'
      WHEN (marks_obtained / total_marks) * 100 >= 40 THEN 'C'
      ELSE 'F'
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, exam_id, subject_id)
);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create policies for subjects
CREATE POLICY "Subjects are viewable by everyone" 
ON public.subjects 
FOR SELECT 
USING (true);

CREATE POLICY "Subjects can be managed by authenticated users" 
ON public.subjects 
FOR ALL 
USING (true);

-- Create policies for exams
CREATE POLICY "Exams are viewable by everyone" 
ON public.exams 
FOR SELECT 
USING (true);

CREATE POLICY "Exams can be managed by authenticated users" 
ON public.exams 
FOR ALL 
USING (true);

-- Create policies for results
CREATE POLICY "Results are viewable by everyone" 
ON public.results 
FOR SELECT 
USING (true);

CREATE POLICY "Results can be managed by authenticated users" 
ON public.results 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at
BEFORE UPDATE ON public.results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_subjects_course_id ON public.subjects(course_id);
CREATE INDEX idx_exams_course_id ON public.exams(course_id);
CREATE INDEX idx_results_student_id ON public.results(student_id);
CREATE INDEX idx_results_exam_id ON public.results(exam_id);
CREATE INDEX idx_results_subject_id ON public.results(subject_id);
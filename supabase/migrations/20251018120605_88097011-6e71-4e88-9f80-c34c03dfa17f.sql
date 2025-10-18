-- Add academic_year_id column to students table
ALTER TABLE public.students 
ADD COLUMN academic_year_id uuid REFERENCES public.academic_years(id);

-- Add index for performance
CREATE INDEX idx_students_academic_year ON public.students(academic_year_id);

-- Set default to current academic year for existing records
UPDATE public.students 
SET academic_year_id = (
  SELECT id FROM public.academic_years WHERE is_current = true LIMIT 1
)
WHERE academic_year_id IS NULL;
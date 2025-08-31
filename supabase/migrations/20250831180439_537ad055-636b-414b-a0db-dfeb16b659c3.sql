-- Add missing foreign key constraints for results table
ALTER TABLE public.results 
ADD CONSTRAINT fk_results_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT fk_results_exam_id 
FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

ALTER TABLE public.results 
ADD CONSTRAINT fk_results_subject_id 
FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;
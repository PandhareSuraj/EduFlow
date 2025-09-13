-- Add unique constraint to prevent duplicate question numbers within the same exam
ALTER TABLE public.mcq_questions 
ADD CONSTRAINT unique_question_number_per_exam 
UNIQUE (exam_id, question_number);

-- Clean up any existing duplicate questions by keeping only the latest one
DELETE FROM public.mcq_questions q1 
WHERE EXISTS (
  SELECT 1 FROM public.mcq_questions q2 
  WHERE q2.exam_id = q1.exam_id 
  AND q2.question_number = q1.question_number 
  AND q2.created_at > q1.created_at
);
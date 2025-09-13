-- First, clean up duplicate questions by keeping only the latest one for each exam_id + question_number combination
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY exam_id, question_number ORDER BY created_at DESC) as rn
  FROM public.mcq_questions
)
DELETE FROM public.mcq_questions 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Now add the unique constraint
ALTER TABLE public.mcq_questions 
ADD CONSTRAINT unique_question_number_per_exam 
UNIQUE (exam_id, question_number);
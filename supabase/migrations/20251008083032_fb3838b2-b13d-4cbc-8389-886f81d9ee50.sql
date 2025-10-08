-- Fix student_fees follow_up_status constraint to include 'completed'
-- Drop the old constraint
ALTER TABLE public.student_fees 
DROP CONSTRAINT IF EXISTS student_fees_follow_up_status_check;

-- Add new constraint with 'completed' included
ALTER TABLE public.student_fees 
ADD CONSTRAINT student_fees_follow_up_status_check 
CHECK (follow_up_status = ANY (ARRAY['pending'::text, 'contacted'::text, 'promised'::text, 'escalated'::text, 'no_response'::text, 'completed'::text]));
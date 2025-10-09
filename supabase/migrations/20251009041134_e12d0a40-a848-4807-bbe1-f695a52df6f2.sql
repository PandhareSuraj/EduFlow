-- Add contacted_via column to custom_followups table
ALTER TABLE public.custom_followups 
ADD COLUMN contacted_via text;

-- Add check constraint for valid contact methods
ALTER TABLE public.custom_followups 
ADD CONSTRAINT custom_followups_contacted_via_check 
CHECK (contacted_via = ANY (ARRAY['phone'::text, 'whatsapp'::text, 'email'::text, 'in_person'::text, 'other'::text]));
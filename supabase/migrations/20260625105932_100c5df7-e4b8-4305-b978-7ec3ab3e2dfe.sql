ALTER TABLE public.certificate_students
  ADD COLUMN IF NOT EXISTS mother_tongue text,
  ADD COLUMN IF NOT EXISTS sub_caste text,
  ADD COLUMN IF NOT EXISTS previous_school text,
  ADD COLUMN IF NOT EXISTS study_progress text,
  ADD COLUMN IF NOT EXISTS leaving_reason text,
  ADD COLUMN IF NOT EXISTS studying_since text,
  ADD COLUMN IF NOT EXISTS general_register_no text;
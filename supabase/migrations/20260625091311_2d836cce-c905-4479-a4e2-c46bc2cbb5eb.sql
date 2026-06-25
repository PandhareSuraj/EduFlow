ALTER TABLE public.certificate_students
  ADD COLUMN IF NOT EXISTS domicile_no text,
  ADD COLUMN IF NOT EXISTS taluka text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS state text DEFAULT 'Maharashtra',
  ADD COLUMN IF NOT EXISTS residence_years text;
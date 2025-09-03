
-- 1) Ensure we have a sequence for unique membership-number suffixes
CREATE SEQUENCE IF NOT EXISTS public.library_membership_seq;

-- 2) Replace the generator to use sequence + timestamp (per-row uniqueness)
CREATE OR REPLACE FUNCTION public.generate_membership_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.membership_number IS NULL OR NEW.membership_number = '' THEN
    NEW.membership_number := 'LIB' ||
      to_char(now(), 'YYYYMMDDHH24MISS') ||
      lpad(nextval('public.library_membership_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$function$;

-- 3) Add BEFORE INSERT trigger to always populate membership_number
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_generate_library_membership_number'
  ) THEN
    CREATE TRIGGER trg_generate_library_membership_number
      BEFORE INSERT ON public.library_members
      FOR EACH ROW
      EXECUTE FUNCTION public.generate_membership_number();
  END IF;
END
$do$;

-- 4) Ensure unique index exists (safety)
CREATE UNIQUE INDEX IF NOT EXISTS idx_library_members_membership_number
  ON public.library_members (membership_number);

-- 5) Also auto-fill college_id for library_members (consistency with other tables)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'auto_fill_library_members_college_id'
  ) THEN
    CREATE TRIGGER auto_fill_library_members_college_id
      BEFORE INSERT ON public.library_members
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_fill_college_id();
  END IF;
END
$do$;

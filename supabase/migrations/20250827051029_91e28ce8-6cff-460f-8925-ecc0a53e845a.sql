
-- 1) Add missing foreign keys (conditional to avoid duplication)

DO $$
BEGIN
  -- students.course_id -> courses.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_course_id_fkey'
  ) THEN
    ALTER TABLE public.students
    ADD CONSTRAINT students_course_id_fkey
    FOREIGN KEY (course_id)
    REFERENCES public.courses(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;

  -- student_fees.student_id -> students.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_fees_student_id_fkey'
  ) THEN
    ALTER TABLE public.student_fees
    ADD CONSTRAINT student_fees_student_id_fkey
    FOREIGN KEY (student_id)
    REFERENCES public.students(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  -- student_fees.fee_structure_id -> fee_structures.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_fees_fee_structure_id_fkey'
  ) THEN
    ALTER TABLE public.student_fees
    ADD CONSTRAINT student_fees_fee_structure_id_fkey
    FOREIGN KEY (fee_structure_id)
    REFERENCES public.fee_structures(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
  END IF;

  -- fee_payments.student_fee_id -> student_fees.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fee_payments_student_fee_id_fkey'
  ) THEN
    ALTER TABLE public.fee_payments
    ADD CONSTRAINT fee_payments_student_fee_id_fkey
    FOREIGN KEY (student_fee_id)
    REFERENCES public.student_fees(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;

  -- fee_payments.student_id -> students.id
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fee_payments_student_id_fkey'
  ) THEN
    ALTER TABLE public.fee_payments
    ADD CONSTRAINT fee_payments_student_id_fkey
    FOREIGN KEY (student_id)
    REFERENCES public.students(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2) Helpful indexes (no-ops if they already exist)
CREATE INDEX IF NOT EXISTS idx_students_course_id ON public.students (course_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees (student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_fee_structure_id ON public.student_fees (fee_structure_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_fee_id ON public.fee_payments (student_fee_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON public.fee_payments (student_id);

-- 3) Triggers to keep data consistent and features working

-- Auto-create student_fees after a student is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auto_create_student_fees'
  ) THEN
    CREATE TRIGGER trg_auto_create_student_fees
    AFTER INSERT ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_student_fees();
  END IF;
END $$;

-- Auto-generate receipt numbers before inserting a fee payment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_generate_receipt_number'
  ) THEN
    CREATE TRIGGER trg_generate_receipt_number
    BEFORE INSERT ON public.fee_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_receipt_number();
  END IF;
END $$;

-- Update student_fees balances after insert/update of fee_payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_student_fee_balance'
  ) THEN
    CREATE TRIGGER trg_update_student_fee_balance
    AFTER INSERT OR UPDATE ON public.fee_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_student_fee_balance();
  END IF;
END $$;

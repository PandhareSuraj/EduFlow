-- Tighten student_fees visibility for users who are also students in another college
DROP POLICY IF EXISTS "Students can view own fees" ON public.student_fees;
CREATE POLICY "Students can view own fees"
ON public.student_fees
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_fees.student_id
      AND s.email = get_current_user_email()
      AND student_fees.college_id = get_user_college()
  )
);

-- Tighten fee_payments visibility too
DROP POLICY IF EXISTS "Students can view own payments" ON public.fee_payments;
CREATE POLICY "Students can view own payments"
ON public.fee_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = fee_payments.student_id
      AND s.email = get_current_user_email()
      AND fee_payments.college_id = get_user_college()
  )
);

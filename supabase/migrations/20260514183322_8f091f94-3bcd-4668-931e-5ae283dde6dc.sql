-- Lock down otp_verifications: remove USING(true) policy and restrict to super_admin reads.
-- Edge functions (send-sms-otp / verify-sms-otp) use the service role and bypass RLS, so writes still work.
DROP POLICY IF EXISTS "Users can manage OTP verifications" ON public.otp_verifications;

CREATE POLICY "Super admins can read OTP verifications"
ON public.otp_verifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- No INSERT/UPDATE/DELETE policies for clients: only the service role (used by edge functions) may write.

-- Make student_fee_ledger view enforce the querying user's RLS via security_invoker.
-- This ensures the underlying student_fees / fee_payments / students RLS policies are applied
-- when an authenticated user queries this view, so users only see rows their role permits.
ALTER VIEW public.student_fee_ledger SET (security_invoker = true);
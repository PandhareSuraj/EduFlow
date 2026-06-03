-- 1. Make remaining views run with the querying user's RLS instead of the creator's privileges.
ALTER VIEW public.student_fee_summary SET (security_invoker = true);
ALTER VIEW public.student_payment_ledger SET (security_invoker = true);

-- 2. Replace the permissive notifications INSERT policy.
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Privileged roles can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'teacher'::app_role)
);

-- 3. Pin search_path on functions flagged by the linter.
ALTER FUNCTION public.update_id_card_templates_updated_at()    SET search_path = public;
ALTER FUNCTION public.update_book_availability()               SET search_path = public;
ALTER FUNCTION public.update_inventory_stock()                 SET search_path = public;
ALTER FUNCTION public.calculate_overdue_fines()                SET search_path = public;
ALTER FUNCTION public.calculate_exam_session_results()         SET search_path = public;
ALTER FUNCTION public.auto_grade_student_answer()              SET search_path = public;
ALTER FUNCTION public.update_exam_statuses()                   SET search_path = public;
ALTER FUNCTION public.generate_membership_number()             SET search_path = public;
ALTER FUNCTION public.update_follow_up_dates()                 SET search_path = public;
ALTER FUNCTION public.generate_amc_receipt_number()            SET search_path = public;
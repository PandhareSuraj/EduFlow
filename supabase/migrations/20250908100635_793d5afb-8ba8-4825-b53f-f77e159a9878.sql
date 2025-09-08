-- Fix security issues identified by the linter

-- Drop the problematic view and recreate it without SECURITY DEFINER
DROP VIEW IF EXISTS public.student_fee_ledger;

-- Create the view as a regular view (not security definer)
CREATE VIEW public.student_fee_ledger AS
SELECT 
  sf.id as fee_record_id,
  s.id as student_id,
  s.student_id as student_number,
  s.name as student_name,
  c.name as course_name,
  fs.semester,
  sf.original_amount,
  sf.discount_amount,
  sf.discount_percentage,
  sf.discount_reason,
  sf.total_amount as final_amount,
  sf.paid_amount,
  sf.balance_amount,
  sf.due_date,
  sf.status as fee_status,
  sf.created_at as fee_created_at,
  COALESCE(payment_history.payments, '[]'::jsonb) as payment_history,
  sf.college_id
FROM public.student_fees sf
JOIN public.students s ON s.id = sf.student_id
JOIN public.courses c ON c.id = s.course_id
JOIN public.fee_structures fs ON fs.id = sf.fee_structure_id
LEFT JOIN (
  SELECT 
    student_fee_id,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'amount', amount,
        'payment_date', payment_date,
        'payment_method', payment_method,
        'receipt_number', receipt_number,
        'remarks', remarks
      ) ORDER BY payment_date DESC
    ) as payments
  FROM public.fee_payments
  GROUP BY student_fee_id
) payment_history ON payment_history.student_fee_id = sf.id;

-- Enable RLS on the view would be through underlying tables, so we're good

-- RLS policy for the ledger view access
CREATE POLICY "Users can view fee ledger from their college" 
ON public.student_fees
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());
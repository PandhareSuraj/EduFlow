
-- Make fee_structure_id nullable for ad-hoc fees
ALTER TABLE public.student_fees ALTER COLUMN fee_structure_id DROP NOT NULL;

-- Add fee_category and fee_description columns
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS fee_category text NOT NULL DEFAULT 'tuition';
ALTER TABLE public.student_fees ADD COLUMN IF NOT EXISTS fee_description text;

-- Recreate student_fee_ledger view to include fee_category
DROP VIEW IF EXISTS public.student_fee_ledger;
CREATE VIEW public.student_fee_ledger AS
SELECT sf.id AS fee_record_id,
    sf.student_id,
    s.semester,
    sf.original_amount,
    sf.discount_amount,
    sf.discount_percentage,
    sf.total_amount AS final_amount,
    sf.paid_amount,
    sf.balance_amount,
    sf.due_date,
    sf.created_at AS fee_created_at,
    sf.college_id,
    sf.fee_category,
    sf.fee_description,
    jsonb_agg(
        CASE
            WHEN (fp.id IS NOT NULL) THEN jsonb_build_object('payment_id', fp.id, 'amount', fp.amount, 'payment_date', fp.payment_date, 'payment_method', fp.payment_method, 'receipt_number', fp.receipt_number)
            ELSE NULL::jsonb
        END) FILTER (WHERE (fp.id IS NOT NULL)) AS payment_history,
    s.student_id AS student_number,
    s.name AS student_name,
    c.name AS course_name,
    sf.status AS fee_status,
    sf.discount_reason
   FROM (((student_fees sf
     LEFT JOIN students s ON ((s.id = sf.student_id)))
     LEFT JOIN courses c ON ((c.id = s.course_id)))
     LEFT JOIN fee_payments fp ON ((fp.student_fee_id = sf.id)))
  GROUP BY sf.id, sf.student_id, s.semester, sf.original_amount, sf.discount_amount, sf.discount_percentage, sf.total_amount, sf.paid_amount, sf.balance_amount, sf.due_date, sf.created_at, sf.college_id, sf.fee_category, sf.fee_description, s.student_id, s.name, c.name, sf.status, sf.discount_reason;

-- Recreate student_fee_summary view to include fee_category
DROP VIEW IF EXISTS public.student_fee_summary;
CREATE VIEW public.student_fee_summary AS
SELECT sf.id AS fee_record_id,
    sf.student_id,
    s.semester,
    s.year,
    sf.original_amount,
    sf.discount_amount,
    sf.discount_percentage,
    sf.total_amount,
    sf.paid_amount,
    sf.balance_amount,
    sf.due_date,
    sf.created_at AS fee_created_at,
    sf.college_id,
    sf.fee_category,
    sf.fee_description,
    count(fp.id) AS payment_count,
    max(fp.payment_date) AS last_payment_date,
    max(fp.amount) AS last_payment_amount,
    s.student_id AS student_number,
    s.name AS student_name,
    s.email,
    s.mobile_number,
    c.name AS course_name,
    c.code AS course_code,
    sf.discount_reason,
    sf.status AS fee_status,
    max(fp.payment_method) AS last_payment_method,
        CASE
            WHEN (count(fp.id) > 0) THEN 'Active'::text
            ELSE 'No Payments'::text
        END AS payment_status
   FROM (((student_fees sf
     LEFT JOIN students s ON ((s.id = sf.student_id)))
     LEFT JOIN courses c ON ((c.id = s.course_id)))
     LEFT JOIN fee_payments fp ON ((fp.student_fee_id = sf.id)))
  GROUP BY sf.id, sf.student_id, s.semester, s.year, sf.original_amount, sf.discount_amount, sf.discount_percentage, sf.total_amount, sf.paid_amount, sf.balance_amount, sf.due_date, sf.created_at, sf.college_id, sf.fee_category, sf.fee_description, s.student_id, s.name, s.email, s.mobile_number, c.name, c.code, sf.discount_reason, sf.status;

-- Recreate student_payment_ledger view to include fee_category
DROP VIEW IF EXISTS public.student_payment_ledger;
CREATE VIEW public.student_payment_ledger AS
SELECT s.id AS student_id,
    s.student_id AS student_number,
    s.name AS student_name,
    c.name AS course_name,
    sf.id AS fee_record_id,
    sf.original_amount,
    sf.discount_amount,
    sf.discount_percentage,
    sf.discount_reason,
    sf.total_amount,
    sf.due_date,
    sf.created_at AS fee_created_at,
    sf.fee_category,
    sf.fee_description,
    fp.id AS payment_id,
    fp.payment_date,
    fp.amount AS payment_amount,
    fp.payment_method,
    fp.receipt_number,
    fp.transaction_id,
    fp.cheque_number,
    fp.bank_name,
    fp.remarks,
    sum(fp.amount) OVER (PARTITION BY sf.id ORDER BY fp.payment_date, fp.created_at ROWS UNBOUNDED PRECEDING) AS cumulative_paid,
    (sf.total_amount - COALESCE(sum(fp.amount) OVER (PARTITION BY sf.id ORDER BY fp.payment_date, fp.created_at ROWS UNBOUNDED PRECEDING), (0)::numeric)) AS running_balance,
    row_number() OVER (PARTITION BY sf.id ORDER BY fp.payment_date, fp.created_at) AS payment_sequence,
    sf.status AS fee_status
   FROM (((students s
     JOIN student_fees sf ON ((s.id = sf.student_id)))
     LEFT JOIN fee_payments fp ON ((sf.id = fp.student_fee_id)))
     LEFT JOIN courses c ON ((s.course_id = c.id)))
  WHERE (s.status = 'active'::text)
  ORDER BY s.id, sf.created_at, fp.payment_date;

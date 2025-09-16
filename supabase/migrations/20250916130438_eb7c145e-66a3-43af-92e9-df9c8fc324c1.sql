-- Update student_fee_ledger view to include college_id for proper isolation
DROP VIEW IF EXISTS student_fee_ledger;

CREATE VIEW student_fee_ledger AS
SELECT 
    sf.id as fee_record_id,
    sf.student_id,
    s.semester,
    sf.original_amount,
    sf.discount_amount,
    sf.discount_percentage,
    sf.total_amount as final_amount,
    sf.paid_amount,
    sf.balance_amount,
    sf.due_date,
    sf.created_at as fee_created_at,
    sf.college_id,  -- CRITICAL: Include college_id for proper isolation
    jsonb_agg(
        CASE 
            WHEN fp.id IS NOT NULL THEN
                jsonb_build_object(
                    'payment_id', fp.id,
                    'amount', fp.amount,
                    'payment_date', fp.payment_date,
                    'payment_method', fp.payment_method,
                    'receipt_number', fp.receipt_number
                )
            ELSE NULL
        END
    ) FILTER (WHERE fp.id IS NOT NULL) as payment_history,
    s.student_id as student_number,
    s.name as student_name,
    c.name as course_name,
    sf.status as fee_status,
    sf.discount_reason
FROM student_fees sf
LEFT JOIN students s ON s.id = sf.student_id
LEFT JOIN courses c ON c.id = s.course_id
LEFT JOIN fee_payments fp ON fp.student_fee_id = sf.id
GROUP BY sf.id, sf.student_id, s.semester, sf.original_amount, 
         sf.discount_amount, sf.discount_percentage, sf.total_amount, 
         sf.paid_amount, sf.balance_amount, sf.due_date, sf.created_at,
         sf.college_id, s.student_id, s.name, c.name, sf.status, sf.discount_reason;
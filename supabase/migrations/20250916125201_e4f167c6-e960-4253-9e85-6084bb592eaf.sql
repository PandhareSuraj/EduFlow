-- Update student_fee_summary view to include college_id for proper data isolation
CREATE OR REPLACE VIEW student_fee_summary AS
SELECT 
    sf.id as fee_record_id,
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
    sf.created_at as fee_created_at,
    sf.college_id,  -- CRITICAL: Adding college_id for proper isolation
    COUNT(fp.id) as payment_count,
    MAX(fp.payment_date) as last_payment_date,
    MAX(fp.amount) as last_payment_amount,
    s.student_id as student_number,
    s.name as student_name,
    s.email,
    s.mobile_number,
    c.name as course_name,
    c.code as course_code,
    sf.discount_reason,
    sf.status as fee_status,
    MAX(fp.payment_method) as last_payment_method,
    CASE 
        WHEN COUNT(fp.id) > 0 THEN 'Active'
        ELSE 'No Payments'
    END as payment_status
FROM student_fees sf
LEFT JOIN students s ON s.id = sf.student_id
LEFT JOIN courses c ON c.id = s.course_id
LEFT JOIN fee_payments fp ON fp.student_fee_id = sf.id
GROUP BY sf.id, sf.student_id, s.semester, s.year, sf.original_amount, 
         sf.discount_amount, sf.discount_percentage, sf.total_amount, 
         sf.paid_amount, sf.balance_amount, sf.due_date, sf.created_at,
         sf.college_id, s.student_id, s.name, s.email, s.mobile_number,
         c.name, c.code, sf.discount_reason, sf.status;
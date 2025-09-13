-- Fix duplicate fee creation issue and enhance payment ledger system

-- 1. Remove duplicate trigger (keep the more descriptive one)
DROP TRIGGER IF EXISTS trigger_auto_create_student_fees ON students;

-- 2. Clean up existing duplicate fee records 
-- Keep only the most recent fee record per student/semester combination
WITH duplicates AS (
  SELECT id, 
         student_id,
         ROW_NUMBER() OVER (
           PARTITION BY student_id, 
           COALESCE((SELECT semester FROM students WHERE id = student_fees.student_id), 1)
           ORDER BY created_at DESC
         ) as rn
  FROM student_fees
)
DELETE FROM student_fees 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Create enhanced payment ledger view with running balances
CREATE OR REPLACE VIEW student_payment_ledger AS 
SELECT 
  s.id as student_id,
  s.student_id as student_number,
  s.name as student_name,
  c.name as course_name,
  sf.id as fee_record_id,
  sf.original_amount,
  sf.discount_amount,
  sf.discount_percentage,
  sf.discount_reason,
  sf.total_amount,
  sf.due_date,
  sf.created_at as fee_created_at,
  fp.id as payment_id,
  fp.payment_date,
  fp.amount as payment_amount,
  fp.payment_method,
  fp.receipt_number,
  fp.transaction_id,
  fp.cheque_number,
  fp.bank_name,
  fp.remarks,
  -- Running balance calculation
  SUM(fp.amount) OVER (
    PARTITION BY sf.id 
    ORDER BY fp.payment_date, fp.created_at
    ROWS UNBOUNDED PRECEDING
  ) as cumulative_paid,
  sf.total_amount - COALESCE(SUM(fp.amount) OVER (
    PARTITION BY sf.id 
    ORDER BY fp.payment_date, fp.created_at
    ROWS UNBOUNDED PRECEDING
  ), 0) as running_balance,
  -- Payment sequence number for each student
  ROW_NUMBER() OVER (
    PARTITION BY sf.id 
    ORDER BY fp.payment_date, fp.created_at
  ) as payment_sequence,
  sf.status as fee_status
FROM students s
JOIN student_fees sf ON s.id = sf.student_id
LEFT JOIN fee_payments fp ON sf.id = fp.student_fee_id
LEFT JOIN courses c ON s.course_id = c.id
WHERE s.status = 'active'
ORDER BY s.id, sf.created_at, fp.payment_date;

-- 4. Create function to prevent duplicate fee creation
CREATE OR REPLACE FUNCTION prevent_duplicate_student_fees()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if fee record already exists for this student and semester
  IF EXISTS (
    SELECT 1 FROM student_fees 
    WHERE student_id = NEW.id 
    AND EXISTS (
      SELECT 1 FROM fee_structures fs 
      WHERE fs.course_id = NEW.course_id 
      AND fs.semester = COALESCE(NEW.semester, 1)
      AND fs.id IN (SELECT fee_structure_id FROM student_fees WHERE student_id = NEW.id)
    )
  ) THEN
    -- Fee already exists, skip creation
    RETURN NEW;
  END IF;
  
  -- Otherwise, proceed with normal fee creation
  PERFORM auto_create_student_fees_with_discount(NEW.id, 0, 0, NULL);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Update the existing trigger to use the new prevention function
DROP TRIGGER IF EXISTS trg_auto_create_student_fees ON students;
CREATE TRIGGER trg_prevent_duplicate_student_fees
  AFTER INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_student_fees();

-- 6. Create comprehensive student fee summary view
CREATE OR REPLACE VIEW student_fee_summary AS
SELECT 
  s.id as student_id,
  s.student_id as student_number,
  s.name as student_name,
  s.email,
  s.mobile_number,
  c.name as course_name,
  c.code as course_code,
  s.semester,
  s.year,
  sf.id as fee_record_id,
  sf.original_amount,
  sf.discount_amount,
  sf.discount_percentage,
  sf.discount_reason,
  sf.total_amount,
  sf.paid_amount,
  sf.balance_amount,
  sf.due_date,
  sf.status as fee_status,
  sf.created_at as fee_created_at,
  -- Payment statistics
  COALESCE(payment_stats.payment_count, 0) as payment_count,
  COALESCE(payment_stats.last_payment_date, NULL) as last_payment_date,
  COALESCE(payment_stats.last_payment_amount, 0) as last_payment_amount,
  COALESCE(payment_stats.last_payment_method, NULL) as last_payment_method,
  -- Status indicators
  CASE 
    WHEN sf.balance_amount = 0 THEN 'Fully Paid'
    WHEN sf.due_date < CURRENT_DATE AND sf.balance_amount > 0 THEN 'Overdue'
    WHEN sf.due_date <= CURRENT_DATE + INTERVAL '7 days' AND sf.balance_amount > 0 THEN 'Due Soon'
    ELSE 'Active'
  END as payment_status
FROM students s
JOIN student_fees sf ON s.id = sf.student_id
LEFT JOIN courses c ON s.course_id = c.id
LEFT JOIN (
  SELECT 
    student_fee_id,
    COUNT(*) as payment_count,
    MAX(payment_date) as last_payment_date,
    (SELECT amount FROM fee_payments fp2 WHERE fp2.student_fee_id = fp1.student_fee_id ORDER BY payment_date DESC, created_at DESC LIMIT 1) as last_payment_amount,
    (SELECT payment_method FROM fee_payments fp2 WHERE fp2.student_fee_id = fp1.student_fee_id ORDER BY payment_date DESC, created_at DESC LIMIT 1) as last_payment_method
  FROM fee_payments fp1
  GROUP BY student_fee_id
) payment_stats ON sf.id = payment_stats.student_fee_id
WHERE s.status = 'active'
ORDER BY s.name, sf.created_at;

-- 7. Add unique constraint to prevent future duplicates
ALTER TABLE student_fees 
ADD CONSTRAINT unique_student_semester_fee 
UNIQUE (student_id, fee_structure_id);

-- 8. Update auto_create_student_fees_with_discount to handle duplicates gracefully
CREATE OR REPLACE FUNCTION auto_create_student_fees_with_discount(
  p_student_id integer, 
  p_discount_amount numeric DEFAULT 0, 
  p_discount_percentage numeric DEFAULT 0, 
  p_discount_reason text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_fee_structure_id uuid;
    v_total_fee numeric;
    v_due_date date;
    v_college_id uuid;
    v_course_id integer;
    v_semester integer;
    v_final_amount numeric;
    v_student_fee_id uuid;
    v_existing_fee_id uuid;
BEGIN
    -- Get student details
    SELECT course_id, semester, college_id
    INTO v_course_id, v_semester, v_college_id
    FROM public.students 
    WHERE id = p_student_id;
    
    -- Find the fee structure for the student's course and current semester
    SELECT id, total_fee, due_date 
    INTO v_fee_structure_id, v_total_fee, v_due_date
    FROM public.fee_structures 
    WHERE course_id = v_course_id 
    AND semester = COALESCE(v_semester, 1)
    AND college_id = v_college_id
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Check if fee record already exists
    SELECT id INTO v_existing_fee_id
    FROM public.student_fees
    WHERE student_id = p_student_id 
    AND fee_structure_id = v_fee_structure_id;
    
    -- If fee already exists, return existing ID
    IF v_existing_fee_id IS NOT NULL THEN
        RETURN v_existing_fee_id;
    END IF;
    
    -- If fee structure exists and no duplicate found, create student fee record
    IF v_fee_structure_id IS NOT NULL THEN
        -- Calculate final amount after discount
        IF p_discount_percentage > 0 THEN
            v_final_amount := v_total_fee - (v_total_fee * p_discount_percentage / 100);
        ELSE
            v_final_amount := v_total_fee - COALESCE(p_discount_amount, 0);
        END IF;
        
        -- Ensure final amount is not negative
        v_final_amount := GREATEST(v_final_amount, 0);
        
        INSERT INTO public.student_fees (
            student_id, 
            fee_structure_id, 
            original_amount,
            discount_amount,
            discount_percentage,
            discount_reason,
            total_amount, 
            paid_amount, 
            balance_amount, 
            due_date, 
            college_id, 
            status
        ) VALUES (
            p_student_id, 
            v_fee_structure_id, 
            v_total_fee,
            COALESCE(p_discount_amount, 0),
            COALESCE(p_discount_percentage, 0),
            p_discount_reason,
            v_final_amount, 
            0, 
            v_final_amount, 
            v_due_date, 
            v_college_id, 
            'pending'
        ) RETURNING id INTO v_student_fee_id;
        
        RETURN v_student_fee_id;
    END IF;
    
    RETURN NULL;
END;
$function$;
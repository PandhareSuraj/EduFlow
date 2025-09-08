-- Add discount and original amount fields to student_fees table
ALTER TABLE public.student_fees 
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_reason text,
ADD COLUMN IF NOT EXISTS original_amount numeric DEFAULT 0;

-- Update existing records to set original_amount = total_amount where original_amount is 0
UPDATE public.student_fees 
SET original_amount = total_amount 
WHERE original_amount = 0 OR original_amount IS NULL;

-- Create a view for student fee ledger
CREATE OR REPLACE VIEW public.student_fee_ledger AS
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

-- Update the auto_create_student_fees function to handle discounts
CREATE OR REPLACE FUNCTION public.auto_create_student_fees_with_discount(
  p_student_id integer,
  p_discount_amount numeric DEFAULT 0,
  p_discount_percentage numeric DEFAULT 0,
  p_discount_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_fee_structure_id uuid;
    v_total_fee numeric;
    v_due_date date;
    v_college_id uuid;
    v_course_id integer;
    v_semester integer;
    v_final_amount numeric;
    v_student_fee_id uuid;
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
    
    -- If fee structure exists, create student fee record
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
$$;
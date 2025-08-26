-- Fix security warnings for function search paths
CREATE OR REPLACE FUNCTION public.auto_create_student_fees()
RETURNS TRIGGER AS $$
DECLARE
    v_fee_structure_id uuid;
    v_total_fee numeric;
    v_due_date date;
BEGIN
    -- Find the fee structure for the student's course and current semester
    SELECT id, total_fee, due_date 
    INTO v_fee_structure_id, v_total_fee, v_due_date
    FROM public.fee_structures 
    WHERE course_id = NEW.course_id 
    AND semester = COALESCE(NEW.semester, 1)
    AND college_id = NEW.college_id
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If fee structure exists, create student fee record
    IF v_fee_structure_id IS NOT NULL THEN
        INSERT INTO public.student_fees (
            student_id, 
            fee_structure_id, 
            total_amount, 
            paid_amount, 
            balance_amount, 
            due_date, 
            college_id, 
            status
        ) VALUES (
            NEW.id, 
            v_fee_structure_id, 
            v_total_fee, 
            0, 
            v_total_fee, 
            v_due_date, 
            NEW.college_id, 
            'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number = 'RCP' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public';
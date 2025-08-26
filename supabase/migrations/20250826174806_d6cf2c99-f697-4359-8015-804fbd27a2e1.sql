-- Create demo sample data for comprehensive payment functionality testing

-- First, ensure we have demo students with proper course enrollment
DO $$
DECLARE
    v_college_id uuid;
    v_course_dmlt_id integer;
    v_course_drt_id integer;
    v_course_dott_id integer;
    v_student_1_id integer;
    v_student_2_id integer;
    v_student_3_id integer;
    v_student_4_id integer;
    v_student_5_id integer;
    v_fee_structure_1_id uuid;
    v_fee_structure_2_id uuid;
    v_fee_structure_3_id uuid;
    v_student_fee_1_id uuid;
    v_student_fee_2_id uuid;
    v_student_fee_3_id uuid;
    v_student_fee_4_id uuid;
    v_student_fee_5_id uuid;
BEGIN
    -- Get college ID
    SELECT id INTO v_college_id FROM colleges WHERE code = 'KKPPC' LIMIT 1;
    
    -- Get course IDs
    SELECT id INTO v_course_dmlt_id FROM courses WHERE code = 'DMLT' AND college_id = v_college_id LIMIT 1;
    SELECT id INTO v_course_drt_id FROM courses WHERE code = 'DRT' AND college_id = v_college_id LIMIT 1;
    SELECT id INTO v_course_dott_id FROM courses WHERE code = 'DOTT' AND college_id = v_college_id LIMIT 1;
    
    -- Insert demo students
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    VALUES 
        ('Arjun Sharma', 'arjun.sharma@email.com', '+91-9876543001', v_course_dmlt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DMLT-2024-A'),
        ('Priya Patel', 'priya.patel@email.com', '+91-9876543002', v_course_dmlt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DMLT-2024-A'),
        ('Rohit Kumar', 'rohit.kumar@email.com', '+91-9876543003', v_course_drt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DRT-2024-A'),
        ('Sneha Gupta', 'sneha.gupta@email.com', '+91-9876543004', v_course_drt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DRT-2024-A'),
        ('Vikram Singh', 'vikram.singh@email.com', '+91-9876543005', v_course_dott_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DOTT-2024-A')
    ON CONFLICT (email) DO NOTHING;
    
    -- Get student IDs
    SELECT id INTO v_student_1_id FROM students WHERE email = 'arjun.sharma@email.com' LIMIT 1;
    SELECT id INTO v_student_2_id FROM students WHERE email = 'priya.patel@email.com' LIMIT 1;
    SELECT id INTO v_student_3_id FROM students WHERE email = 'rohit.kumar@email.com' LIMIT 1;
    SELECT id INTO v_student_4_id FROM students WHERE email = 'sneha.gupta@email.com' LIMIT 1;
    SELECT id INTO v_student_5_id FROM students WHERE email = 'vikram.singh@email.com' LIMIT 1;
    
    -- Create fee structures for each course
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    VALUES 
        (v_course_dmlt_id, 1, 45000, 5000, 30000, 5000, 2000, 3000, '2024-12-31', v_college_id),
        (v_course_drt_id, 1, 50000, 6000, 35000, 6000, 2000, 1000, '2024-12-31', v_college_id),
        (v_course_dott_id, 1, 40000, 4000, 28000, 5000, 2000, 1000, '2024-12-31', v_college_id)
    ON CONFLICT (course_id, semester) DO NOTHING;
    
    -- Get fee structure IDs
    SELECT id INTO v_fee_structure_1_id FROM fee_structures WHERE course_id = v_course_dmlt_id AND semester = 1 LIMIT 1;
    SELECT id INTO v_fee_structure_2_id FROM fee_structures WHERE course_id = v_course_drt_id AND semester = 1 LIMIT 1;
    SELECT id INTO v_fee_structure_3_id FROM fee_structures WHERE course_id = v_course_dott_id AND semester = 1 LIMIT 1;
    
    -- Create student fee records
    INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
    VALUES 
        (v_student_1_id, v_fee_structure_1_id, 45000, 15000, 30000, '2024-12-31', v_college_id, 'partial'),
        (v_student_2_id, v_fee_structure_1_id, 45000, 45000, 0, '2024-12-31', v_college_id, 'paid'),
        (v_student_3_id, v_fee_structure_2_id, 50000, 0, 50000, '2024-12-31', v_college_id, 'pending'),
        (v_student_4_id, v_fee_structure_2_id, 50000, 25000, 25000, '2024-12-31', v_college_id, 'partial'),
        (v_student_5_id, v_fee_structure_3_id, 40000, 0, 40000, '2024-11-30', v_college_id, 'overdue')
    ON CONFLICT DO NOTHING;
    
    -- Get student fee IDs
    SELECT id INTO v_student_fee_1_id FROM student_fees WHERE student_id = v_student_1_id LIMIT 1;
    SELECT id INTO v_student_fee_2_id FROM student_fees WHERE student_id = v_student_2_id LIMIT 1;
    SELECT id INTO v_student_fee_3_id FROM student_fees WHERE student_id = v_student_3_id LIMIT 1;
    SELECT id INTO v_student_fee_4_id FROM student_fees WHERE student_id = v_student_4_id LIMIT 1;
    SELECT id INTO v_student_fee_5_id FROM student_fees WHERE student_id = v_student_5_id LIMIT 1;
    
    -- Create sample payment records
    INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_date, payment_method, transaction_id, receipt_number, college_id, remarks)
    VALUES 
        (v_student_fee_1_id, v_student_1_id, 15000, '2024-08-15', 'online', 'TXN123456789', 'RCP001', v_college_id, 'First installment payment'),
        (v_student_fee_2_id, v_student_2_id, 25000, '2024-08-10', 'cash', null, 'RCP002', v_college_id, 'Partial payment'),
        (v_student_fee_2_id, v_student_2_id, 20000, '2024-09-05', 'cheque', null, 'RCP003', v_college_id, 'Final payment'),
        (v_student_fee_4_id, v_student_4_id, 25000, '2024-08-20', 'online', 'TXN987654321', 'RCP004', v_college_id, 'Partial payment via UPI')
    ON CONFLICT DO NOTHING;
END $$;

-- Create function to automatically generate student fee records when students are enrolled
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate fee records for new students
DROP TRIGGER IF EXISTS trigger_auto_create_student_fees ON public.students;
CREATE TRIGGER trigger_auto_create_student_fees
    AFTER INSERT ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_student_fees();

-- Create function to generate receipt numbers automatically
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-generate receipt number if not provided
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number = 'RCP' || LPAD(nextval('fee_payments_id_seq')::text, 8, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating receipt numbers
DROP TRIGGER IF EXISTS trigger_generate_receipt_number ON public.fee_payments;
CREATE TRIGGER trigger_generate_receipt_number
    BEFORE INSERT ON public.fee_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_receipt_number();

-- Create sequence for receipt numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS fee_payments_id_seq;
-- Complete the payment functionality setup with sample data using existing courses
DO $$
DECLARE
    v_college_id uuid;
    v_course_mlt_id integer;
    v_course_rt_id integer;
    v_course_pt_id integer;
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
    -- Get college and existing course IDs
    SELECT id INTO v_college_id FROM colleges WHERE code = 'KKPPC' LIMIT 1;
    SELECT id INTO v_course_mlt_id FROM courses WHERE code = 'MLT' LIMIT 1;
    SELECT id INTO v_course_rt_id FROM courses WHERE code = 'RT' LIMIT 1;
    SELECT id INTO v_course_pt_id FROM courses WHERE code = 'PT' LIMIT 1;
    
    -- Create sample students using existing courses
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Arjun Sharma', 'arjun.sharma@email.com', '+91-9876543001', v_course_mlt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'MLT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'arjun.sharma@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Priya Patel', 'priya.patel@email.com', '+91-9876543002', v_course_mlt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'MLT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'priya.patel@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Rohit Kumar', 'rohit.kumar@email.com', '+91-9876543003', v_course_rt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'RT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'rohit.kumar@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Sneha Gupta', 'sneha.gupta@email.com', '+91-9876543004', v_course_rt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'RT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'sneha.gupta@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Vikram Singh', 'vikram.singh@email.com', '+91-9876543005', v_course_pt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'PT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'vikram.singh@email.com');
    
    -- Get student IDs
    SELECT id INTO v_student_1_id FROM students WHERE email = 'arjun.sharma@email.com' LIMIT 1;
    SELECT id INTO v_student_2_id FROM students WHERE email = 'priya.patel@email.com' LIMIT 1;
    SELECT id INTO v_student_3_id FROM students WHERE email = 'rohit.kumar@email.com' LIMIT 1;
    SELECT id INTO v_student_4_id FROM students WHERE email = 'sneha.gupta@email.com' LIMIT 1;
    SELECT id INTO v_student_5_id FROM students WHERE email = 'vikram.singh@email.com' LIMIT 1;
    
    -- Create fee structures for existing courses
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_mlt_id, 1, 45000, 5000, 30000, 5000, 2000, 3000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_mlt_id AND semester = 1);
    
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_rt_id, 1, 50000, 6000, 35000, 6000, 2000, 1000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_rt_id AND semester = 1);
    
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_pt_id, 1, 40000, 4000, 28000, 5000, 2000, 1000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_pt_id AND semester = 1);
    
    -- Get fee structure IDs
    SELECT id INTO v_fee_structure_1_id FROM fee_structures WHERE course_id = v_course_mlt_id AND semester = 1 LIMIT 1;
    SELECT id INTO v_fee_structure_2_id FROM fee_structures WHERE course_id = v_course_rt_id AND semester = 1 LIMIT 1;
    SELECT id INTO v_fee_structure_3_id FROM fee_structures WHERE course_id = v_course_pt_id AND semester = 1 LIMIT 1;
    
    -- Create student fee records
    INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
    SELECT v_student_1_id, v_fee_structure_1_id, 45000, 15000, 30000, '2024-12-31', v_college_id, 'partial'
    WHERE NOT EXISTS (SELECT 1 FROM student_fees WHERE student_id = v_student_1_id);
    
    INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
    SELECT v_student_2_id, v_fee_structure_1_id, 45000, 45000, 0, '2024-12-31', v_college_id, 'paid'
    WHERE NOT EXISTS (SELECT 1 FROM student_fees WHERE student_id = v_student_2_id);
    
    INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
    SELECT v_student_3_id, v_fee_structure_2_id, 50000, 0, 50000, '2024-12-31', v_college_id, 'pending'
    WHERE NOT EXISTS (SELECT 1 FROM student_fees WHERE student_id = v_student_3_id);
    
    INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
    SELECT v_student_4_id, v_fee_structure_2_id, 50000, 25000, 25000, '2024-12-31', v_college_id, 'partial'
    WHERE NOT EXISTS (SELECT 1 FROM student_fees WHERE student_id = v_student_4_id);
    
    INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
    SELECT v_student_5_id, v_fee_structure_3_id, 40000, 0, 40000, '2024-11-30', v_college_id, 'overdue'
    WHERE NOT EXISTS (SELECT 1 FROM student_fees WHERE student_id = v_student_5_id);
    
    -- Get student fee IDs for creating payments
    SELECT id INTO v_student_fee_1_id FROM student_fees WHERE student_id = v_student_1_id LIMIT 1;
    SELECT id INTO v_student_fee_2_id FROM student_fees WHERE student_id = v_student_2_id LIMIT 1;
    SELECT id INTO v_student_fee_3_id FROM student_fees WHERE student_id = v_student_3_id LIMIT 1;
    SELECT id INTO v_student_fee_4_id FROM student_fees WHERE student_id = v_student_4_id LIMIT 1;
    SELECT id INTO v_student_fee_5_id FROM student_fees WHERE student_id = v_student_5_id LIMIT 1;
    
    -- Create sample payment records
    INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_date, payment_method, transaction_id, receipt_number, college_id, remarks)
    SELECT v_student_fee_1_id, v_student_1_id, 15000, '2024-08-15', 'online', 'TXN123456789', 'RCP001', v_college_id, 'First installment payment'
    WHERE NOT EXISTS (SELECT 1 FROM fee_payments WHERE receipt_number = 'RCP001');
    
    INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_date, payment_method, transaction_id, receipt_number, college_id, remarks)
    SELECT v_student_fee_2_id, v_student_2_id, 25000, '2024-08-10', 'cash', null, 'RCP002', v_college_id, 'Partial payment'
    WHERE NOT EXISTS (SELECT 1 FROM fee_payments WHERE receipt_number = 'RCP002');
    
    INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_date, payment_method, transaction_id, receipt_number, college_id, remarks)
    SELECT v_student_fee_2_id, v_student_2_id, 20000, '2024-09-05', 'cheque', null, 'RCP003', v_college_id, 'Final payment'
    WHERE NOT EXISTS (SELECT 1 FROM fee_payments WHERE receipt_number = 'RCP003');
    
    INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_date, payment_method, transaction_id, receipt_number, college_id, remarks)
    SELECT v_student_fee_4_id, v_student_4_id, 25000, '2024-08-20', 'online', 'TXN987654321', 'RCP004', v_college_id, 'Partial payment via UPI'
    WHERE NOT EXISTS (SELECT 1 FROM fee_payments WHERE receipt_number = 'RCP004');
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

-- Create function to auto-generate receipt numbers
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number = 'RCP' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0');
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
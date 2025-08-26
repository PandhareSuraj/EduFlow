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
    
    -- Insert demo students only if they don't exist
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Arjun Sharma', 'arjun.sharma@email.com', '+91-9876543001', v_course_dmlt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DMLT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'arjun.sharma@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Priya Patel', 'priya.patel@email.com', '+91-9876543002', v_course_dmlt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DMLT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'priya.patel@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Rohit Kumar', 'rohit.kumar@email.com', '+91-9876543003', v_course_drt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DRT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'rohit.kumar@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Sneha Gupta', 'sneha.gupta@email.com', '+91-9876543004', v_course_drt_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DRT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'sneha.gupta@email.com');
    
    INSERT INTO students (name, email, mobile_number, course_id, admission_date, year, semester, college_id, status, class)
    SELECT 'Vikram Singh', 'vikram.singh@email.com', '+91-9876543005', v_course_dott_id, '2024-07-15', 1, 1, v_college_id, 'active', 'DOTT-2024-A'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE email = 'vikram.singh@email.com');
    
    -- Get student IDs
    SELECT id INTO v_student_1_id FROM students WHERE email = 'arjun.sharma@email.com' LIMIT 1;
    SELECT id INTO v_student_2_id FROM students WHERE email = 'priya.patel@email.com' LIMIT 1;
    SELECT id INTO v_student_3_id FROM students WHERE email = 'rohit.kumar@email.com' LIMIT 1;
    SELECT id INTO v_student_4_id FROM students WHERE email = 'sneha.gupta@email.com' LIMIT 1;
    SELECT id INTO v_student_5_id FROM students WHERE email = 'vikram.singh@email.com' LIMIT 1;
    
    -- Create fee structures for each course if they don't exist
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_dmlt_id, 1, 45000, 5000, 30000, 5000, 2000, 3000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_dmlt_id AND semester = 1);
    
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_drt_id, 1, 50000, 6000, 35000, 6000, 2000, 1000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_drt_id AND semester = 1);
    
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_dott_id, 1, 40000, 4000, 28000, 5000, 2000, 1000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_dott_id AND semester = 1);
    
    -- Get fee structure IDs
    SELECT id INTO v_fee_structure_1_id FROM fee_structures WHERE course_id = v_course_dmlt_id AND semester = 1 LIMIT 1;
    SELECT id INTO v_fee_structure_2_id FROM fee_structures WHERE course_id = v_course_drt_id AND semester = 1 LIMIT 1;
    SELECT id INTO v_fee_structure_3_id FROM fee_structures WHERE course_id = v_course_dott_id AND semester = 1 LIMIT 1;
    
    -- Create student fee records only if they don't exist
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
    
    -- Create sample payment records only if they don't exist
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
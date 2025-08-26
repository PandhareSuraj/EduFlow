-- First ensure we have basic college and course data before creating fee structures
DO $$
DECLARE
    v_college_id uuid;
    v_course_dmlt_id integer;
    v_course_drt_id integer;
    v_course_dott_id integer;
BEGIN
    -- Ensure college exists
    SELECT id INTO v_college_id FROM colleges WHERE code = 'KKPPC' LIMIT 1;
    
    IF v_college_id IS NULL THEN
        INSERT INTO colleges (name, code, email, phone, address, status)
        VALUES ('KK Patil Paramedical College', 'KKPPC', 'admin@kkpatilcollege.edu.in', '+91-9876543210', 'Mumbai, Maharashtra, India', 'active')
        RETURNING id INTO v_college_id;
    END IF;
    
    -- Ensure courses exist
    SELECT id INTO v_course_dmlt_id FROM courses WHERE code = 'DMLT' LIMIT 1;
    IF v_course_dmlt_id IS NULL THEN
        INSERT INTO courses (name, code, duration_months, college_id, description, department)
        VALUES ('Diploma in Medical Laboratory Technology', 'DMLT', 24, v_college_id, 'Two-year diploma program in medical laboratory technology', 'Medical Laboratory')
        RETURNING id INTO v_course_dmlt_id;
    END IF;
    
    SELECT id INTO v_course_drt_id FROM courses WHERE code = 'DRT' LIMIT 1;
    IF v_course_drt_id IS NULL THEN
        INSERT INTO courses (name, code, duration_months, college_id, description, department)
        VALUES ('Diploma in Radiology Technology', 'DRT', 24, v_college_id, 'Two-year diploma program in radiology technology', 'Radiology')
        RETURNING id INTO v_course_drt_id;
    END IF;
    
    SELECT id INTO v_course_dott_id FROM courses WHERE code = 'DOTT' LIMIT 1;
    IF v_course_dott_id IS NULL THEN
        INSERT INTO courses (name, code, duration_months, college_id, description, department)
        VALUES ('Diploma in Operation Theatre Technology', 'DOTT', 18, v_college_id, 'Eighteen-month diploma program in operation theatre technology', 'Operation Theatre')
        RETURNING id INTO v_course_dott_id;
    END IF;
    
    -- Now create sample students
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
    
    -- Create fee structures  
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_dmlt_id, 1, 45000, 5000, 30000, 5000, 2000, 3000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_dmlt_id AND semester = 1);
    
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_drt_id, 1, 50000, 6000, 35000, 6000, 2000, 1000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_drt_id AND semester = 1);
    
    INSERT INTO fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
    SELECT v_course_dott_id, 1, 40000, 4000, 28000, 5000, 2000, 1000, '2024-12-31', v_college_id
    WHERE NOT EXISTS (SELECT 1 FROM fee_structures WHERE course_id = v_course_dott_id AND semester = 1);
    
END $$;
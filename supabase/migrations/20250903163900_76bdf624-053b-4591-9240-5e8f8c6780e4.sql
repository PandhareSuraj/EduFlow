-- First, let's ensure the current user is associated with a college and create sample data
DO $$
DECLARE
    current_user_id uuid := auth.uid();
    demo_college_id uuid;
    demo_course_id integer;
    demo_subject_id uuid;
    demo_faculty_id uuid;
    demo_student_id integer;
    demo_fee_structure_id uuid;
BEGIN
    -- Check if we have any colleges, if not create one
    SELECT id INTO demo_college_id FROM colleges LIMIT 1;
    
    IF demo_college_id IS NULL THEN
        INSERT INTO colleges (name, code, email, phone, address, status)
        VALUES ('Demo College', 'DEMO', 'admin@demo.edu', '+91-1234567890', 'Demo Address', 'active')
        RETURNING id INTO demo_college_id;
    END IF;
    
    -- Ensure current user has super_admin role and is associated with the college
    IF current_user_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role, college_id)
        VALUES (current_user_id, 'super_admin', demo_college_id)
        ON CONFLICT (user_id) DO UPDATE SET 
            role = 'super_admin',
            college_id = demo_college_id;
    END IF;
    
    -- Create a demo course if none exists
    SELECT id INTO demo_course_id FROM courses WHERE college_id = demo_college_id LIMIT 1;
    
    IF demo_course_id IS NULL THEN
        INSERT INTO courses (name, code, duration_months, college_id, department, status)
        VALUES ('Computer Science', 'CS101', 24, demo_college_id, 'Engineering', 'active')
        RETURNING id INTO demo_course_id;
    END IF;
    
    -- Create a demo subject
    SELECT id INTO demo_subject_id FROM subjects WHERE course_id = demo_course_id LIMIT 1;
    
    IF demo_subject_id IS NULL THEN
        INSERT INTO subjects (name, code, course_id, college_id, credits)
        VALUES ('Programming Fundamentals', 'CS101A', demo_course_id, demo_college_id, 3)
        RETURNING id INTO demo_subject_id;
    END IF;
    
    -- Create demo faculty
    SELECT id INTO demo_faculty_id FROM faculty WHERE college_id = demo_college_id LIMIT 1;
    
    IF demo_faculty_id IS NULL THEN
        INSERT INTO faculty (name, email, phone, designation, department, college_id, status)
        VALUES ('Dr. John Smith', 'john.smith@demo.edu', '+91-9876543210', 'Professor', 'Computer Science', demo_college_id, 'active')
        RETURNING id INTO demo_faculty_id;
    END IF;
    
    -- Create demo students
    FOR i IN 1..5 LOOP
        INSERT INTO students (name, email, mobile_number, course_id, college_id, admission_date, year, semester, status)
        VALUES (
            'Student ' || i,
            'student' || i || '@demo.edu',
            '+91-98765432' || LPAD(i::text, 2, '0'),
            demo_course_id,
            demo_college_id,
            CURRENT_DATE - INTERVAL '30 days',
            1,
            1,
            'active'
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
    
    -- Get a student ID for further operations
    SELECT id INTO demo_student_id FROM students WHERE college_id = demo_college_id LIMIT 1;
    
    -- Create fee structure
    SELECT id INTO demo_fee_structure_id FROM fee_structures WHERE course_id = demo_course_id LIMIT 1;
    
    IF demo_fee_structure_id IS NULL THEN
        INSERT INTO fee_structures (course_id, semester, total_fee, tuition_fee, lab_fee, library_fee, college_id, due_date)
        VALUES (demo_course_id, 1, 50000, 35000, 8000, 2000, demo_college_id, CURRENT_DATE + INTERVAL '30 days')
        RETURNING id INTO demo_fee_structure_id;
    END IF;
    
    -- Create student fees
    IF demo_student_id IS NOT NULL AND demo_fee_structure_id IS NOT NULL THEN
        INSERT INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, college_id, status, due_date)
        SELECT 
            s.id,
            demo_fee_structure_id,
            50000,
            CASE WHEN random() > 0.5 THEN 25000 ELSE 0 END,
            CASE WHEN random() > 0.5 THEN 25000 ELSE 50000 END,
            demo_college_id,
            CASE WHEN random() > 0.5 THEN 'partial' ELSE 'pending' END,
            CURRENT_DATE + INTERVAL '30 days'
        FROM students s 
        WHERE s.college_id = demo_college_id
        ON CONFLICT DO NOTHING;
        
        -- Create some fee payments
        INSERT INTO fee_payments (student_fee_id, student_id, amount, payment_date, college_id, payment_method, receipt_number)
        SELECT 
            sf.id,
            sf.student_id,
            25000,
            CURRENT_DATE - INTERVAL '10 days',
            demo_college_id,
            'cash',
            'RCP' || LPAD(sf.student_id::text, 10, '0')
        FROM student_fees sf 
        WHERE sf.college_id = demo_college_id AND sf.paid_amount > 0
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Create attendance sessions
    INSERT INTO attendance_sessions (
        course_id, subject_id, faculty_id, session_date, start_time, end_time,
        class_name, college_id, status, total_students, present_count, absent_count, attendance_percentage
    ) VALUES 
    (demo_course_id, demo_subject_id, demo_faculty_id, CURRENT_DATE, 
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 hour',
     'CS101 - Morning Batch', demo_college_id, 'completed', 5, 4, 1, 80.0),
    (demo_course_id, demo_subject_id, demo_faculty_id, CURRENT_DATE - INTERVAL '1 day', 
     CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '1 hour',
     'CS101 - Evening Batch', demo_college_id, 'completed', 5, 3, 2, 60.0)
    ON CONFLICT DO NOTHING;
    
    -- Create attendance records
    INSERT INTO attendance_records (session_id, student_id, status, college_id, marked_at, marked_by)
    SELECT 
        ats.id,
        s.id,
        CASE WHEN random() > 0.2 THEN 'present' ELSE 'absent' END,
        demo_college_id,
        ats.start_time,
        current_user_id
    FROM attendance_sessions ats
    CROSS JOIN students s
    WHERE ats.college_id = demo_college_id AND s.college_id = demo_college_id
    ON CONFLICT DO NOTHING;
    
    -- Create some exams
    INSERT INTO exams (name, course_id, exam_date, total_marks, college_id, status, description)
    VALUES 
    ('Mid Semester Exam', demo_course_id, CURRENT_DATE + INTERVAL '5 days', 100, demo_college_id, 'scheduled', 'Mid semester examination'),
    ('Final Exam', demo_course_id, CURRENT_DATE + INTERVAL '15 days', 100, demo_college_id, 'scheduled', 'Final examination')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Demo data created successfully with college_id: %', demo_college_id;
END $$;
-- Fix security warnings by adding proper search_path to functions

-- Update analyze_college_data function
CREATE OR REPLACE FUNCTION public.analyze_college_data(college_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    result jsonb := '{}';
    student_count integer;
    faculty_count integer;
    course_count integer;
    exam_count integer;
    attendance_count integer;
    fee_count integer;
    library_count integer;
    inventory_count integer;
    enquiry_count integer;
BEGIN
    -- Only super_admin can analyze data
    IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
        RAISE EXCEPTION 'Access denied. Super admin role required.';
    END IF;

    -- Count students
    SELECT COUNT(*) INTO student_count FROM students WHERE college_id = college_uuid;
    
    -- Count faculty
    SELECT COUNT(*) INTO faculty_count FROM faculty WHERE college_id = college_uuid;
    
    -- Count courses
    SELECT COUNT(*) INTO course_count FROM courses WHERE college_id = college_uuid;
    
    -- Count exams
    SELECT COUNT(*) INTO exam_count FROM exams WHERE college_id = college_uuid;
    
    -- Count attendance records
    SELECT COUNT(*) INTO attendance_count FROM attendance_records WHERE college_id = college_uuid;
    
    -- Count fee records
    SELECT COUNT(*) INTO fee_count FROM fee_payments WHERE college_id = college_uuid;
    
    -- Count library records
    SELECT COUNT(*) INTO library_count FROM books WHERE college_id = college_uuid;
    
    -- Count inventory items
    SELECT COUNT(*) INTO inventory_count FROM inventory_items WHERE college_id = college_uuid;
    
    -- Count enquiries
    SELECT COUNT(*) INTO enquiry_count FROM enquiries WHERE college_id = college_uuid;

    result := jsonb_build_object(
        'students', student_count,
        'faculty', faculty_count,
        'courses', course_count,
        'exams', exam_count,
        'attendance_records', attendance_count,
        'fee_records', fee_count,
        'library_books', library_count,
        'inventory_items', inventory_count,
        'enquiries', enquiry_count,
        'total_records', student_count + faculty_count + course_count + exam_count + attendance_count + fee_count + library_count + inventory_count + enquiry_count
    );

    RETURN result;
END;
$$;

-- Update export_college_data function
CREATE OR REPLACE FUNCTION public.export_college_data(college_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    result jsonb := '{}';
    college_info jsonb;
    students_data jsonb;
    faculty_data jsonb;
    courses_data jsonb;
BEGIN
    -- Only super_admin can export data
    IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
        RAISE EXCEPTION 'Access denied. Super admin role required.';
    END IF;

    -- Get college info
    SELECT to_jsonb(c) INTO college_info FROM colleges c WHERE id = college_uuid;
    
    -- Get students data
    SELECT jsonb_agg(to_jsonb(s)) INTO students_data FROM students s WHERE college_id = college_uuid;
    
    -- Get faculty data
    SELECT jsonb_agg(to_jsonb(f)) INTO faculty_data FROM faculty f WHERE college_id = college_uuid;
    
    -- Get courses data
    SELECT jsonb_agg(to_jsonb(c)) INTO courses_data FROM courses c WHERE college_id = college_uuid;

    result := jsonb_build_object(
        'college', college_info,
        'students', COALESCE(students_data, '[]'::jsonb),
        'faculty', COALESCE(faculty_data, '[]'::jsonb),
        'courses', COALESCE(courses_data, '[]'::jsonb),
        'exported_at', now(),
        'exported_by', auth.uid()
    );

    RETURN result;
END;
$$;

-- Update clean_college_data function
CREATE OR REPLACE FUNCTION public.clean_college_data(
    college_uuid uuid,
    modules text[] DEFAULT ARRAY['all'],
    preserve_structure boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result jsonb := '{}';
    deleted_counts jsonb := '{}';
    college_name text;
    deleted_students integer := 0;
    deleted_faculty integer := 0;
    deleted_courses integer := 0;
    deleted_exams integer := 0;
    deleted_attendance integer := 0;
    deleted_fees integer := 0;
    deleted_library integer := 0;
    deleted_inventory integer := 0;
    deleted_enquiries integer := 0;
BEGIN
    -- Only super_admin can clean data
    IF NOT has_role(auth.uid(), 'super_admin'::app_role) THEN
        RAISE EXCEPTION 'Access denied. Super admin role required.';
    END IF;

    -- Get college name for logging
    SELECT name INTO college_name FROM colleges WHERE id = college_uuid;
    
    IF college_name IS NULL THEN
        RAISE EXCEPTION 'College not found';
    END IF;

    -- Start transaction for atomic operation
    BEGIN
        -- Clean in proper order to respect foreign key constraints
        
        -- 1. Clean attendance records first
        IF 'all' = ANY(modules) OR 'attendance' = ANY(modules) THEN
            DELETE FROM attendance_records WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_attendance = ROW_COUNT;
            
            DELETE FROM attendance_sessions WHERE college_id = college_uuid;
        END IF;

        -- 2. Clean exam results
        IF 'all' = ANY(modules) OR 'exams' = ANY(modules) THEN
            DELETE FROM results WHERE college_id = college_uuid;
            
            DELETE FROM exams WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_exams = ROW_COUNT;
        END IF;

        -- 3. Clean fee records
        IF 'all' = ANY(modules) OR 'fees' = ANY(modules) THEN
            DELETE FROM fee_payments WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_fees = ROW_COUNT;
            
            DELETE FROM student_fees WHERE college_id = college_uuid;
            DELETE FROM fee_installments WHERE college_id = college_uuid;
            DELETE FROM fee_structures WHERE college_id = college_uuid;
        END IF;

        -- 4. Clean library records
        IF 'all' = ANY(modules) OR 'library' = ANY(modules) THEN
            DELETE FROM library_fines WHERE college_id = college_uuid;
            DELETE FROM book_issues WHERE college_id = college_uuid;
            DELETE FROM library_members WHERE college_id = college_uuid;
            
            DELETE FROM books WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_library = ROW_COUNT;
            
            DELETE FROM book_categories WHERE college_id = college_uuid;
            DELETE FROM library_settings WHERE college_id = college_uuid;
        END IF;

        -- 5. Clean inventory records
        IF 'all' = ANY(modules) OR 'inventory' = ANY(modules) THEN
            DELETE FROM inventory_transactions WHERE college_id = college_uuid;
            
            DELETE FROM inventory_items WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_inventory = ROW_COUNT;
            
            DELETE FROM suppliers WHERE college_id = college_uuid;
        END IF;

        -- 6. Clean student documents
        IF 'all' = ANY(modules) OR 'students' = ANY(modules) THEN
            DELETE FROM student_documents WHERE college_id = college_uuid;
        END IF;

        -- 7. Clean students
        IF 'all' = ANY(modules) OR 'students' = ANY(modules) THEN
            DELETE FROM students WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_students = ROW_COUNT;
        END IF;

        -- 8. Clean faculty (but preserve user accounts)
        IF 'all' = ANY(modules) OR 'faculty' = ANY(modules) THEN
            -- Clean class schedules first
            DELETE FROM class_schedules WHERE college_id = college_uuid;
            
            -- Update faculty to remove user_id link but keep user accounts
            UPDATE faculty SET user_id = NULL WHERE college_id = college_uuid;
            
            DELETE FROM faculty WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_faculty = ROW_COUNT;
        END IF;

        -- 9. Clean subjects and courses last
        IF 'all' = ANY(modules) OR 'courses' = ANY(modules) THEN
            DELETE FROM subjects WHERE college_id = college_uuid;
            
            DELETE FROM courses WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_courses = ROW_COUNT;
        END IF;

        -- 10. Clean enquiries
        IF 'all' = ANY(modules) OR 'enquiries' = ANY(modules) THEN
            DELETE FROM enquiries WHERE college_id = college_uuid;
            GET DIAGNOSTICS deleted_enquiries = ROW_COUNT;
        END IF;

        -- Build result
        deleted_counts := jsonb_build_object(
            'students', deleted_students,
            'faculty', deleted_faculty,
            'courses', deleted_courses,
            'exams', deleted_exams,
            'attendance_records', deleted_attendance,
            'fee_records', deleted_fees,
            'library_books', deleted_library,
            'inventory_items', deleted_inventory,
            'enquiries', deleted_enquiries
        );

        result := jsonb_build_object(
            'success', true,
            'college_id', college_uuid,
            'college_name', college_name,
            'deleted_counts', deleted_counts,
            'modules_cleaned', modules,
            'cleaned_at', now(),
            'cleaned_by', auth.uid()
        );

        -- Log the operation
        INSERT INTO activity_logs (
            user_id,
            action,
            details,
            college_id
        ) VALUES (
            auth.uid(),
            'COLLEGE_DATA_CLEANED',
            result,
            college_uuid
        );

        RETURN result;

    EXCEPTION WHEN OTHERS THEN
        -- Rollback transaction on error
        RAISE EXCEPTION 'Error cleaning college data: %', SQLERRM;
    END;
END;
$$;
-- Fix timezone conversion in exam notification functions
-- All times should be displayed in IST (Asia/Kolkata) for students

-- Update the notify_students_on_exam_change function to use IST
CREATE OR REPLACE FUNCTION public.notify_students_on_exam_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    student_record RECORD;
    notification_title TEXT;
    notification_message TEXT;
    time_display TEXT;
BEGIN
    -- Only process for scheduled/ongoing exams
    IF NEW.status NOT IN ('scheduled', 'ongoing') THEN
        RETURN NEW;
    END IF;

    -- Format time display with proper UTC to IST conversion
    time_display := CASE 
        WHEN NEW.start_time IS NOT NULL 
        THEN ' at ' || to_char(NEW.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM') || ' IST'
        ELSE ''
    END;

    -- Determine notification type based on operation
    IF TG_OP = 'INSERT' THEN
        notification_title := 'New Exam Scheduled 📝';
        notification_message := NEW.name || ' on ' || to_char(NEW.exam_date, 'DD Mon YYYY') || time_display;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check if exam was rescheduled
        IF OLD.exam_date != NEW.exam_date OR OLD.start_time != NEW.start_time OR OLD.end_time != NEW.end_time THEN
            notification_title := 'Exam Rescheduled ⏰';
            notification_message := NEW.name || ' moved to ' || to_char(NEW.exam_date, 'DD Mon YYYY') || time_display;
        ELSE
            notification_title := 'Exam Updated 📋';
            notification_message := NEW.name || ' has been updated';
        END IF;
    END IF;

    -- Create notifications for all students enrolled in the course
    FOR student_record IN 
        SELECT s.id as student_id, ur.user_id
        FROM students s
        JOIN auth.users u ON u.email = s.email
        JOIN user_roles ur ON ur.user_id = u.id
        WHERE s.course_id = NEW.course_id
        AND s.status = 'active'
        AND ur.role = 'student'
    LOOP
        INSERT INTO notifications (
            user_id,
            college_id,
            title,
            message,
            type,
            action_url,
            expires_at
        ) VALUES (
            student_record.user_id,
            NEW.college_id,
            notification_title,
            notification_message,
            'info',
            '/student-tests',
            NEW.exam_date + INTERVAL '1 day'
        )
        ON CONFLICT DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$function$;

-- Update generate_role_based_notifications to use IST for all exam time displays
CREATE OR REPLACE FUNCTION public.generate_role_based_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_record record;
    notification_data record;
    college_data record;
    exam_record record;
BEGIN
    -- Clean up expired notifications
    DELETE FROM public.notifications 
    WHERE expires_at IS NOT NULL AND expires_at < now();
    
    -- Generate notifications for each user based on their role
    FOR user_record IN 
        SELECT ur.user_id, ur.role, ur.college_id 
        FROM public.user_roles ur
        WHERE ur.role IS NOT NULL
    LOOP
        -- Super Admin Notifications
        IF user_record.role = 'super_admin' THEN
            -- Inactive colleges notification
            SELECT COUNT(*) as count INTO notification_data
            FROM public.colleges 
            WHERE status = 'inactive';
            
            IF notification_data.count > 0 THEN
                INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                VALUES (
                    user_record.user_id, 
                    NULL,
                    'Inactive Colleges', 
                    'colleges require attention',
                    'warning',
                    notification_data.count,
                    '/dashboard'
                )
                ON CONFLICT DO NOTHING;
            END IF;
            
        -- Admin/Accountant - Follow-up Notifications  
        ELSIF user_record.role IN ('admin', 'accountant') AND user_record.college_id IS NOT NULL THEN
            
            -- Overdue follow-ups notification
            SELECT COUNT(*) as count INTO notification_data
            FROM (
                SELECT id FROM public.enquiries 
                WHERE college_id = user_record.college_id 
                AND next_follow_up_date < CURRENT_DATE
                AND status NOT IN ('converted', 'cancelled')
                UNION ALL
                SELECT id FROM public.student_fees
                WHERE college_id = user_record.college_id
                AND next_follow_up_date < CURRENT_DATE
                AND status IN ('pending', 'partial')
                UNION ALL
                SELECT id FROM public.custom_followups
                WHERE college_id = user_record.college_id
                AND follow_up_date < CURRENT_DATE
                AND status NOT IN ('completed', 'cancelled')
            ) AS overdue_followups;
            
            IF notification_data.count > 0 THEN
                INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                VALUES (
                    user_record.user_id,
                    user_record.college_id,
                    'Overdue Follow-ups',
                    'follow-ups are overdue',
                    'error',
                    notification_data.count,
                    '/followups'
                )
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- Today's follow-ups notification
            SELECT COUNT(*) as count INTO notification_data
            FROM (
                SELECT id FROM public.enquiries 
                WHERE college_id = user_record.college_id 
                AND next_follow_up_date = CURRENT_DATE
                AND status NOT IN ('converted', 'cancelled')
                UNION ALL
                SELECT id FROM public.student_fees
                WHERE college_id = user_record.college_id
                AND next_follow_up_date = CURRENT_DATE
                AND status IN ('pending', 'partial')
                UNION ALL
                SELECT id FROM public.custom_followups
                WHERE college_id = user_record.college_id
                AND follow_up_date = CURRENT_DATE
                AND status NOT IN ('completed', 'cancelled')
            ) AS today_followups;
            
            IF notification_data.count > 0 THEN
                INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                VALUES (
                    user_record.user_id,
                    user_record.college_id,
                    'Today''s Follow-ups',
                    'follow-ups are scheduled for today',
                    'info',
                    notification_data.count,
                    '/followups'
                )
                ON CONFLICT DO NOTHING;
            END IF;
            
        -- Teacher Notifications
        ELSIF user_record.role = 'teacher' AND user_record.college_id IS NOT NULL THEN
            
            -- Low attendance notification
            SELECT COUNT(DISTINCT s.id) as count INTO notification_data
            FROM public.students s
            LEFT JOIN public.attendance_records ar ON ar.student_id = s.id
            WHERE s.college_id = user_record.college_id
            GROUP BY s.id
            HAVING COUNT(CASE WHEN ar.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(ar.id), 0) < 75;
            
            IF notification_data.count > 0 THEN
                INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                VALUES (
                    user_record.user_id,
                    user_record.college_id,
                    'Low Attendance',
                    'students below 75% attendance',
                    'error',
                    notification_data.count,
                    '/attendance'
                )
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- Upcoming exams notification
            SELECT COUNT(*) as count INTO notification_data
            FROM public.exams e
            WHERE e.college_id = user_record.college_id
            AND e.exam_date >= CURRENT_DATE 
            AND e.exam_date <= CURRENT_DATE + INTERVAL '7 days'
            AND e.status = 'scheduled';
            
            IF notification_data.count > 0 THEN
                INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                VALUES (
                    user_record.user_id,
                    user_record.college_id,
                    'Upcoming Exams',
                    'exams scheduled in next 7 days',
                    'info',
                    notification_data.count,
                    '/exams'
                )
                ON CONFLICT DO NOTHING;
            END IF;
            
        -- ENHANCED STUDENT NOTIFICATIONS WITH IST TIMEZONE
        ELSIF user_record.role = 'student' THEN
            -- Get student data
            SELECT s.* INTO college_data 
            FROM public.students s
            JOIN auth.users u ON u.email = s.email
            WHERE u.id = user_record.user_id
            LIMIT 1;
            
            IF college_data IS NOT NULL THEN
                -- 1. TODAY'S EXAMS (Highest Priority - ERROR level) with IST time
                FOR exam_record IN 
                    SELECT e.id, e.name, e.start_time, e.end_time
                    FROM public.exams e
                    WHERE e.course_id = college_data.course_id
                    AND e.exam_date = CURRENT_DATE
                    AND e.status = 'scheduled'
                LOOP
                    INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url, expires_at)
                    VALUES (
                        user_record.user_id,
                        college_data.college_id,
                        'Exam Today! 🎓',
                        exam_record.name || 
                        CASE 
                            WHEN exam_record.start_time IS NOT NULL 
                            THEN ' at ' || to_char(exam_record.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM') || ' IST'
                            ELSE ' - Check schedule'
                        END,
                        'error',
                        1,
                        '/student-tests',
                        CURRENT_DATE + INTERVAL '1 day'
                    )
                    ON CONFLICT DO NOTHING;
                END LOOP;
                
                -- 2. TOMORROW'S EXAMS (MEDIUM Priority - WARNING level) with IST time
                SELECT COUNT(*) as count INTO notification_data
                FROM public.exams e
                WHERE e.course_id = college_data.course_id
                AND e.exam_date = CURRENT_DATE + INTERVAL '1 day'
                AND e.status = 'scheduled';
                
                IF notification_data.count > 0 THEN
                    SELECT e.name, e.start_time INTO exam_record
                    FROM public.exams e
                    WHERE e.course_id = college_data.course_id
                    AND e.exam_date = CURRENT_DATE + INTERVAL '1 day'
                    AND e.status = 'scheduled'
                    LIMIT 1;
                    
                    INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url, expires_at)
                    VALUES (
                        user_record.user_id,
                        college_data.college_id,
                        'Exam Tomorrow! 📅',
                        CASE 
                            WHEN notification_data.count = 1 THEN exam_record.name
                            ELSE notification_data.count || ' exams scheduled'
                        END ||
                        CASE 
                            WHEN exam_record.start_time IS NOT NULL 
                            THEN ' at ' || to_char(exam_record.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM') || ' IST'
                            ELSE ''
                        END,
                        'warning',
                        notification_data.count,
                        '/student-tests',
                        CURRENT_DATE + INTERVAL '2 days'
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
                
                -- 3. NEXT 7 DAYS EXAMS (LOW Priority - INFO level)
                SELECT COUNT(*) as count INTO notification_data
                FROM public.exams e
                WHERE e.course_id = college_data.course_id
                AND e.exam_date > CURRENT_DATE + INTERVAL '1 day'
                AND e.exam_date <= CURRENT_DATE + INTERVAL '7 days'
                AND e.status = 'scheduled';
                
                IF notification_data.count > 0 THEN
                    INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url, expires_at)
                    VALUES (
                        user_record.user_id,
                        college_data.college_id,
                        'Upcoming Exams 📚',
                        notification_data.count || ' exams scheduled in next week',
                        'info',
                        notification_data.count,
                        '/student-tests',
                        CURRENT_DATE + INTERVAL '7 days'
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
                
                -- Personal fee reminders
                SELECT COUNT(*) as count INTO notification_data
                FROM public.student_fees sf
                WHERE sf.student_id = college_data.id 
                AND sf.status IN ('pending', 'partial')
                AND sf.due_date <= CURRENT_DATE + INTERVAL '7 days';
                
                IF notification_data.count > 0 THEN
                    INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                    VALUES (
                        user_record.user_id,
                        college_data.college_id,
                        'Fee Payment Due',
                        'fee payments due soon',
                        'warning',
                        notification_data.count,
                        '/student-dashboard'
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
                
                -- Personal attendance warning
                SELECT 
                    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(ar.id), 0) as percentage
                INTO notification_data
                FROM public.attendance_records ar
                WHERE ar.student_id = college_data.id;
                
                IF notification_data.percentage IS NOT NULL AND notification_data.percentage < 75 THEN
                    INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                    VALUES (
                        user_record.user_id,
                        college_data.college_id,
                        'Low Attendance Warning',
                        'Your attendance is below 75%',
                        'error',
                        1,
                        '/student-dashboard'
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
            END IF;
        END IF;
    END LOOP;
END;
$function$;
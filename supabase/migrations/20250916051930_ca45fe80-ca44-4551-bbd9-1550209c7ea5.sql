-- Create notifications table for user-specific notifications
CREATE TABLE public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    college_id uuid NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'info',
    count integer DEFAULT 1,
    action_url text NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NULL
);

-- Add indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_college_id ON public.notifications(college_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Super admins can view all notifications"
ON public.notifications
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notifications based on user role and data
CREATE OR REPLACE FUNCTION public.generate_role_based_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record record;
    notification_data record;
    college_data record;
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
            
        -- Admin/Teacher Notifications  
        ELSIF user_record.role IN ('admin', 'teacher') AND user_record.college_id IS NOT NULL THEN
            
            -- Pending fees notification
            SELECT COUNT(*) as count INTO notification_data
            FROM public.student_fees sf
            WHERE sf.college_id = user_record.college_id 
            AND sf.status = 'pending';
            
            IF notification_data.count > 0 THEN
                INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                VALUES (
                    user_record.user_id,
                    user_record.college_id,
                    'Fee Reminders',
                    'students have pending fees',
                    'warning',
                    notification_data.count,
                    '/fees'
                )
                ON CONFLICT DO NOTHING;
            END IF;
            
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
            
        -- Student Notifications
        ELSIF user_record.role = 'student' THEN
            -- Get student data
            SELECT s.* INTO college_data 
            FROM public.students s
            JOIN auth.users u ON u.email = s.email
            WHERE u.id = user_record.user_id
            LIMIT 1;
            
            IF college_data IS NOT NULL THEN
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
                
                -- Upcoming exams for student
                SELECT COUNT(*) as count INTO notification_data
                FROM public.exams e
                WHERE e.course_id = college_data.course_id
                AND e.exam_date >= CURRENT_DATE 
                AND e.exam_date <= CURRENT_DATE + INTERVAL '7 days'
                AND e.status = 'scheduled';
                
                IF notification_data.count > 0 THEN
                    INSERT INTO public.notifications (user_id, college_id, title, message, type, count, action_url)
                    VALUES (
                        user_record.user_id,
                        college_data.college_id,
                        'Upcoming Exams',
                        'exams scheduled in next 7 days',
                        'info',
                        notification_data.count,
                        '/student-tests'
                    )
                    ON CONFLICT DO NOTHING;
                END IF;
            END IF;
        END IF;
    END LOOP;
END;
$$;
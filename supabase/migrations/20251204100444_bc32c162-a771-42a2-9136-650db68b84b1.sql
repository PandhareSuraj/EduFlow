-- Fix notify_students_on_exam_change function to display times in IST
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
  notification_type TEXT;
  time_display TEXT;
BEGIN
  -- Only process for MCQ exams with scheduled status
  IF NEW.exam_type != 'mcq' OR NEW.status != 'scheduled' THEN
    RETURN NEW;
  END IF;

  -- Build time display string with IST conversion
  time_display := CASE 
    WHEN NEW.start_time IS NOT NULL THEN ' at ' || to_char(NEW.start_time AT TIME ZONE 'Asia/Kolkata', 'HH12:MI AM') || ' IST'
    ELSE ''
  END;

  -- Determine notification type based on trigger operation
  IF TG_OP = 'INSERT' THEN
    notification_title := 'New Exam Scheduled 📝';
    notification_message := NEW.name || ' on ' || to_char(NEW.exam_date, 'DD Mon YYYY') || time_display;
    notification_type := 'info';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check if exam date or time changed
    IF OLD.exam_date != NEW.exam_date OR OLD.start_time != NEW.start_time OR OLD.end_time != NEW.end_time THEN
      notification_title := 'Exam Rescheduled ⏰';
      notification_message := NEW.name || ' moved to ' || to_char(NEW.exam_date, 'DD Mon YYYY') || time_display;
      notification_type := 'warning';
    ELSE
      -- No significant change, skip notification
      RETURN NEW;
    END IF;
  END IF;

  -- Delete old notifications for this exam to avoid duplicates
  DELETE FROM public.notifications 
  WHERE action_url = '/student-tests' 
  AND message LIKE '%' || NEW.name || '%';

  -- Create notifications for all students in the course
  FOR student_record IN 
    SELECT s.id as student_id, ur.user_id, s.college_id
    FROM public.students s
    JOIN auth.users u ON u.email = s.email
    JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE s.course_id = NEW.course_id
    AND ur.role = 'student'
  LOOP
    INSERT INTO public.notifications (
      user_id, 
      college_id, 
      title, 
      message, 
      type, 
      count, 
      action_url,
      expires_at
    ) VALUES (
      student_record.user_id,
      student_record.college_id,
      notification_title,
      notification_message,
      notification_type,
      1,
      '/student-tests',
      NEW.exam_date + INTERVAL '1 day'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Clean up old notifications with incorrect time format (without IST suffix)
DELETE FROM public.notifications 
WHERE action_url = '/student-tests' 
AND message LIKE '%AM%' 
AND message NOT LIKE '%IST%';

DELETE FROM public.notifications 
WHERE action_url = '/student-tests' 
AND message LIKE '%PM%' 
AND message NOT LIKE '%IST%';
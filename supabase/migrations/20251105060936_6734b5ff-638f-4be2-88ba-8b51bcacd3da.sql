-- Secure exam notification triggers: re-create with SECURITY DEFINER and constrained search_path
-- This ensures functions can read auth.users while being safe for trigger execution

-- 1) Notify students on exam create/update (schedule/reschedule)
CREATE OR REPLACE FUNCTION public.notify_students_on_exam_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  student_record RECORD;
  time_display TEXT;
BEGIN
  -- Only act for scheduled future/ongoing exams; adjust as needed for your trigger events
  IF NEW.status = 'scheduled' AND NEW.exam_date IS NOT NULL THEN
    time_display := CASE 
      WHEN NEW.start_time IS NOT NULL THEN ' at ' || to_char(NEW.start_time, 'HH:MI AM')
      ELSE ''
    END;

    FOR student_record IN 
      SELECT s.id, u.id AS user_id, s.college_id
      FROM public.students s
      JOIN auth.users u ON u.email = s.email
      WHERE s.course_id = NEW.course_id
        AND s.college_id = NEW.college_id
    LOOP
      INSERT INTO public.notifications (
        user_id, college_id, title, message, type, count, action_url, expires_at
      ) VALUES (
        student_record.user_id,
        student_record.college_id,
        CASE 
          WHEN NEW.exam_date = CURRENT_DATE THEN 'Exam Today! 🎓'
          WHEN NEW.exam_date = CURRENT_DATE + INTERVAL '1 day' THEN 'Exam Tomorrow! 📅'
          ELSE 'New Exam Scheduled 📚'
        END,
        NEW.name || ' on ' || to_char(NEW.exam_date, 'DD Mon YYYY') || time_display,
        CASE 
          WHEN NEW.exam_date = CURRENT_DATE THEN 'error'
          WHEN NEW.exam_date <= CURRENT_DATE + INTERVAL '2 days' THEN 'warning'
          ELSE 'info'
        END,
        1,
        '/student-tests',
        (NEW.exam_date + INTERVAL '1 day')::timestamptz
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Notify students when results are published
CREATE OR REPLACE FUNCTION public.notify_students_on_results()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  student_record RECORD;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    FOR student_record IN
      SELECT DISTINCT s.id, u.id AS user_id, s.college_id
      FROM public.students s
      JOIN auth.users u ON u.email = s.email
      WHERE s.course_id = NEW.course_id
        AND s.college_id = NEW.college_id
    LOOP
      INSERT INTO public.notifications (
        user_id, college_id, title, message, type, count, action_url, expires_at
      )
      VALUES (
        student_record.user_id,
        student_record.college_id,
        'Results Published! 🎉',
        'Results for ' || NEW.name || ' are now available',
        'info',
        1,
        '/student-tests',
        now() + INTERVAL '7 days'
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Optional: explicit grants (triggers run as table owner; this is for clarity/hygiene)
GRANT EXECUTE ON FUNCTION public.notify_students_on_exam_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_students_on_results() TO authenticated;
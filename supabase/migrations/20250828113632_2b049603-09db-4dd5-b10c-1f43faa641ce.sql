-- Fix security issue: Function search path for update_session_stats function
CREATE OR REPLACE FUNCTION public.update_session_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.attendance_sessions 
  SET 
    present_count = (
      SELECT COUNT(*) 
      FROM public.attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status = 'present'
    ),
    absent_count = (
      SELECT COUNT(*) 
      FROM public.attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id) 
      AND status IN ('absent', 'late')
    ),
    total_students = (
      SELECT COUNT(*) 
      FROM public.attendance_records 
      WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);

  -- Update attendance percentage
  UPDATE public.attendance_sessions 
  SET attendance_percentage = CASE 
    WHEN total_students > 0 THEN ROUND((present_count::numeric / total_students::numeric) * 100, 2)
    ELSE 0
  END
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;
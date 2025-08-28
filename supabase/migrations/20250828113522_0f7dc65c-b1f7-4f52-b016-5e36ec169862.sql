-- Create attendance management tables for efficient daily operations

-- Class schedules table for timetable management
CREATE TABLE public.class_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id integer NOT NULL,
  subject_id uuid NOT NULL,
  faculty_id uuid NOT NULL,
  class_name text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room_number text,
  semester integer DEFAULT 1,
  college_id uuid,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Attendance sessions table for individual class instances
CREATE TABLE public.attendance_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id uuid NOT NULL,
  course_id integer NOT NULL,
  subject_id uuid NOT NULL,
  faculty_id uuid NOT NULL,
  class_name text NOT NULL,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  total_students integer DEFAULT 0,
  present_count integer DEFAULT 0,
  absent_count integer DEFAULT 0,
  attendance_percentage numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled', -- scheduled, ongoing, completed
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Individual student attendance records
CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL,
  student_id integer NOT NULL,
  status text NOT NULL DEFAULT 'present', -- present, absent, late
  marked_at timestamp with time zone DEFAULT now(),
  marked_by uuid,
  remarks text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for class_schedules
CREATE POLICY "Users can manage class schedules from their college"
ON public.class_schedules
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view class schedules from their college"
ON public.class_schedules
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for attendance_sessions
CREATE POLICY "Users can manage attendance sessions from their college"
ON public.attendance_sessions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view attendance sessions from their college"
ON public.attendance_sessions
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view their attendance sessions"
ON public.attendance_sessions
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.course_id = attendance_sessions.course_id 
    AND s.email = get_current_user_email()
  )
);

-- RLS Policies for attendance_records
CREATE POLICY "Users can manage attendance records from their college"
ON public.attendance_records
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view attendance records from their college"
ON public.attendance_records
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view own attendance records"
ON public.attendance_records
FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = attendance_records.student_id 
    AND s.email = get_current_user_email()
  )
);

-- Indexes for better performance
CREATE INDEX idx_class_schedules_course_day ON public.class_schedules(course_id, day_of_week);
CREATE INDEX idx_class_schedules_college ON public.class_schedules(college_id);
CREATE INDEX idx_attendance_sessions_date ON public.attendance_sessions(session_date, college_id);
CREATE INDEX idx_attendance_sessions_course ON public.attendance_sessions(course_id, session_date);
CREATE INDEX idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON public.attendance_records(student_id);

-- Auto-fill college_id triggers
CREATE TRIGGER auto_fill_class_schedules_college_id
  BEFORE INSERT ON public.class_schedules
  FOR EACH ROW EXECUTE FUNCTION auto_fill_college_id();

CREATE TRIGGER auto_fill_attendance_sessions_college_id
  BEFORE INSERT ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION auto_fill_college_id();

CREATE TRIGGER auto_fill_attendance_records_college_id
  BEFORE INSERT ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION auto_fill_college_id();

-- Update timestamp triggers
CREATE TRIGGER update_class_schedules_updated_at
  BEFORE UPDATE ON public.class_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_sessions_updated_at
  BEFORE UPDATE ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update attendance session statistics
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to auto-update session statistics
CREATE TRIGGER update_attendance_session_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION update_session_stats();
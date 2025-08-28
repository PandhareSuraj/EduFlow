-- Make schedule_id optional for attendance_sessions since we're creating ad-hoc sessions
ALTER TABLE public.attendance_sessions ALTER COLUMN schedule_id DROP NOT NULL;
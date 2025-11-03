-- Function to auto-update exam status based on time
CREATE OR REPLACE FUNCTION update_exam_statuses()
RETURNS void AS $$
BEGIN
  -- Update scheduled exams to 'ongoing' if start time has passed
  UPDATE exams
  SET status = 'ongoing'
  WHERE status = 'scheduled'
    AND (
      (start_time IS NOT NULL AND start_time <= NOW())
      OR (start_time IS NULL AND exam_date <= CURRENT_DATE)
    );

  -- Update ongoing/scheduled exams to 'completed' if end time has passed
  UPDATE exams
  SET status = 'completed'
  WHERE status IN ('scheduled', 'ongoing')
    AND (
      (end_time IS NOT NULL AND end_time < NOW())
      OR (
        end_time IS NULL 
        AND start_time IS NOT NULL 
        AND (start_time + (COALESCE(duration_minutes, 60) * INTERVAL '1 minute')) < NOW()
      )
      OR (
        end_time IS NULL 
        AND start_time IS NULL 
        AND exam_date < CURRENT_DATE
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_exam_statuses() TO authenticated;
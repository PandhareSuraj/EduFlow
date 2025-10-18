-- Fix security warning: Add search_path to calculate_next_year_semester function

CREATE OR REPLACE FUNCTION public.calculate_next_year_semester(
  current_year INTEGER,
  current_semester INTEGER,
  course_duration_months INTEGER
)
RETURNS TABLE(next_year INTEGER, next_semester INTEGER, is_graduating BOOLEAN)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_years INTEGER;
  max_semesters INTEGER;
BEGIN
  -- Calculate maximum years and semesters based on course duration
  max_years := CEIL(course_duration_months / 12.0);
  max_semesters := CEIL(course_duration_months / 6.0);
  
  -- Semester-based progression
  IF current_semester = 1 THEN
    -- Move to semester 2 of same year
    next_year := current_year;
    next_semester := 2;
    is_graduating := false;
  ELSE
    -- Move to semester 1 of next year
    next_year := current_year + 1;
    next_semester := 1;
    
    -- Check if graduating
    is_graduating := (next_year > max_years);
  END IF;
  
  RETURN NEXT;
END;
$$;
-- Fix function search path for security
-- Update the auto_fill_college_id function to have proper search_path
CREATE OR REPLACE FUNCTION public.auto_fill_college_id()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If college_id is not set, try to get it from user's college
  IF NEW.college_id IS NULL THEN
    NEW.college_id = get_user_college();
  END IF;
  
  RETURN NEW;
END;
$$;
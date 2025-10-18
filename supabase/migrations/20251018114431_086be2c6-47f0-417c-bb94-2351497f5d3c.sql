-- Add trigger to automatically fill college_id for academic_years table
CREATE TRIGGER auto_fill_college_id_academic_years
  BEFORE INSERT ON public.academic_years
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();
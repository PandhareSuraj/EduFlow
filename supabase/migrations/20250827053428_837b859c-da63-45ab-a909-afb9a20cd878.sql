-- Fix the has_role function parameter order and add proper RLS policies
-- The current has_role function expects (_user_id, _role) but we were calling it with wrong order

-- Update RLS policies to use correct parameter order and add missing policies
DROP POLICY IF EXISTS "Users can manage faculty from their college" ON public.faculty;
DROP POLICY IF EXISTS "Users can view faculty from their college" ON public.faculty;

-- Create comprehensive RLS policies for faculty table
CREATE POLICY "Users can view faculty from their college" ON public.faculty
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Users can insert faculty in their college" ON public.faculty
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Users can update faculty in their college" ON public.faculty
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Users can delete faculty in their college" ON public.faculty
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

-- Create a trigger to auto-fill college_id when inserting faculty if not provided
CREATE OR REPLACE FUNCTION public.auto_fill_college_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If college_id is not set, try to get it from user's college
  IF NEW.college_id IS NULL THEN
    NEW.college_id = get_user_college();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to faculty table
DROP TRIGGER IF EXISTS auto_fill_faculty_college_id ON public.faculty;
CREATE TRIGGER auto_fill_faculty_college_id
  BEFORE INSERT ON public.faculty
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

-- Apply trigger to other tables that need college_id
DROP TRIGGER IF EXISTS auto_fill_student_fees_college_id ON public.student_fees;
CREATE TRIGGER auto_fill_student_fees_college_id
  BEFORE INSERT ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

DROP TRIGGER IF EXISTS auto_fill_fee_payments_college_id ON public.fee_payments;
CREATE TRIGGER auto_fill_fee_payments_college_id
  BEFORE INSERT ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

-- Update courses RLS policies to include WITH CHECK clauses
DROP POLICY IF EXISTS "Users can manage courses from their college" ON public.courses;
CREATE POLICY "Users can insert courses in their college" ON public.courses
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Users can update courses in their college" ON public.courses
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Users can delete courses in their college" ON public.courses
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);
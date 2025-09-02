-- Add user_id column to faculty table to link with user accounts
ALTER TABLE public.faculty ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_faculty_user_id ON public.faculty(user_id);

-- Create function to check if faculty member has a user account
CREATE OR REPLACE FUNCTION public.get_faculty_login_status(faculty_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id IS NOT NULL FROM public.faculty WHERE id = faculty_id;
$$;
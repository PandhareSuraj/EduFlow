-- Fix user_roles RLS policies to prevent recursion
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their college" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create simple, non-recursive policy
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Update get_current_user_role function to prioritize roles and use security definer
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'teacher' THEN 3
      WHEN 'accountant' THEN 4
      WHEN 'librarian' THEN 5
      WHEN 'clerk' THEN 6
      WHEN 'assistant' THEN 7
      WHEN 'student' THEN 8
      ELSE 9
    END
  LIMIT 1
$$;
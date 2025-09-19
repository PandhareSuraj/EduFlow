-- Drop existing recursive RLS policies on user_roles
DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their college" ON public.user_roles;

-- Create simple non-recursive RLS policy
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create secure RPC function to get current user role with priority
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

-- Create secure RPC function to get role counts for a college
CREATE OR REPLACE FUNCTION public.get_role_counts_for_college(college_uuid uuid)
RETURNS TABLE(role app_role, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role, COUNT(*)
  FROM public.user_roles ur
  WHERE ur.college_id = college_uuid
  GROUP BY ur.role
$$;

-- Create secure RPC function to get global role counts (for super admin)
CREATE OR REPLACE FUNCTION public.get_role_counts_global()
RETURNS TABLE(role app_role, count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role, COUNT(*)
  FROM public.user_roles ur
  GROUP BY ur.role
$$;
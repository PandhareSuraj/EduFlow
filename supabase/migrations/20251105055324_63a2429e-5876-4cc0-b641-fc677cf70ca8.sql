-- Fix get_current_user_email function permissions
-- Ensure the function has proper grants for authenticated users

-- Recreate the function with explicit grants
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

-- Grant execute permissions explicitly
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_user_email() TO anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_current_user_email() IS 'Returns the email of the currently authenticated user. Used by RLS policies.';
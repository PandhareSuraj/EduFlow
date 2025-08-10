-- Add policy to allow demo user creation by checking if any users exist
-- This allows college creation when the system is being set up
CREATE POLICY "Allow college creation during setup" 
ON public.colleges 
FOR INSERT 
WITH CHECK (
  -- Allow if no users exist yet (initial setup) or if user is super admin
  NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) OR 
  has_role(auth.uid(), 'super_admin')
);

-- Add policy to allow reading colleges during setup
CREATE POLICY "Allow college reading during setup" 
ON public.colleges 
FOR SELECT 
USING (
  -- Allow if no users exist yet (initial setup) or existing policies
  NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) OR 
  has_role(auth.uid(), 'super_admin') OR
  id IN (
    SELECT user_roles.college_id
    FROM user_roles
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = ANY (ARRAY['admin'::app_role, 'teacher'::app_role, 'clerk'::app_role, 'librarian'::app_role, 'accountant'::app_role, 'assistant'::app_role])
  )
);
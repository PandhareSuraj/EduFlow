-- Update the super admin user's role from assistant to super_admin
UPDATE public.user_roles 
SET role = 'super_admin'::app_role 
WHERE user_id = '673c4bc0-1877-4071-85a3-2c4d33ed5d9e';
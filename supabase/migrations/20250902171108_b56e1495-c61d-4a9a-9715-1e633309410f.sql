-- Add unique constraint to prevent duplicate roles per user
ALTER TABLE public.user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id, role);

-- Update the handle_new_user trigger to not assign default role
-- This prevents conflicts when we manually assign roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  
  -- Remove automatic role assignment - roles will be assigned manually
  -- This prevents conflicts when creating faculty accounts
  
  RETURN new;
END;
$function$;
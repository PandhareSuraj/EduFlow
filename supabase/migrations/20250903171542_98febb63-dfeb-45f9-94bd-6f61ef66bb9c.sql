-- Fix the get_user_college function to prioritize roles with non-null college_id
-- and use consistent ordering to prevent random results

CREATE OR REPLACE FUNCTION public.get_user_college()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT college_id 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
    AND college_id IS NOT NULL
  ORDER BY 
    -- Prioritize higher privilege roles
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
    END,
    -- Then by most recent
    created_at DESC
  LIMIT 1
$function$;
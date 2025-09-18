-- Create a helper function to execute SQL queries (temporary until types are updated)
CREATE OR REPLACE FUNCTION public.exec_sql(query text, params text[] DEFAULT '{}')
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- This is a placeholder function - we'll use direct table access instead
  RAISE EXCEPTION 'This function should not be used directly';
END;
$$;
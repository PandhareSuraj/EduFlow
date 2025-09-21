-- Fix the audit trigger function to handle different table structures
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    old_data jsonb;
    new_data jsonb;
    excluded_columns text[] := ARRAY['updated_at', 'created_at'];
    record_id_value text;
BEGIN
    -- Skip if this is the audit_logs table itself to prevent recursion
    IF TG_TABLE_NAME = 'audit_logs' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Prepare old and new data, excluding timestamp columns
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    END IF;

    -- Remove excluded columns from old_data
    IF old_data IS NOT NULL THEN
        SELECT jsonb_object_agg(key, value)
        INTO old_data
        FROM jsonb_each(old_data)
        WHERE key != ALL(excluded_columns);
    END IF;

    -- Remove excluded columns from new_data
    IF new_data IS NOT NULL THEN
        SELECT jsonb_object_agg(key, value)
        INTO new_data
        FROM jsonb_each(new_data)
        WHERE key != ALL(excluded_columns);
    END IF;

    -- Determine record ID based on table structure
    IF TG_TABLE_NAME = 'students' THEN
        record_id_value := COALESCE((NEW.student_id)::text, (OLD.student_id)::text, (NEW.id)::text, (OLD.id)::text);
    ELSE
        record_id_value := COALESCE((NEW.id)::text, (OLD.id)::text);
    END IF;

    -- Insert audit log record
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id,
        college_id
    ) VALUES (
        TG_TABLE_NAME,
        record_id_value,
        TG_OP,
        old_data,
        new_data,
        auth.uid(),
        COALESCE(
            NEW.college_id,
            OLD.college_id,
            get_user_college()
        )
    );

    RETURN COALESCE(NEW, OLD);
END;
$$;
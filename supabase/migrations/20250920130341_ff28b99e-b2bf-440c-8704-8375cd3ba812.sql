-- Create audit logging function
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
        COALESCE(
            (NEW.id)::text,
            (OLD.id)::text,
            COALESCE((NEW.student_id)::text, (OLD.student_id)::text)
        ),
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

-- Create audit triggers for key tables
CREATE TRIGGER audit_students_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_faculty_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.faculty
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_courses_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_fee_payments_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_student_fees_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.student_fees
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_exams_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_attendance_records_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_attendance_sessions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_books_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_book_issues_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.book_issues
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_inventory_items_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_inventory_transactions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_enquiries_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.enquiries
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Add indexes for better performance on audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_college_id ON public.audit_logs(college_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
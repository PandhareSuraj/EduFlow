-- Add audit columns to tables that don't have them
-- Add created_by and updated_by to track user actions

-- Add audit columns to major tables
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.faculty 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.attendance_sessions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.fee_structures 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.student_fees 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.fee_payments 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.book_categories 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.library_members 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.book_issues 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.inventory_transactions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.mcq_questions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.student_exam_sessions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE public.student_answers 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create universal audit trigger function
CREATE OR REPLACE FUNCTION public.handle_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Set created_by on INSERT
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by = COALESCE(NEW.updated_by, auth.uid());
    RETURN NEW;
  END IF;
  
  -- Set updated_by on UPDATE
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
    -- Preserve original created_by
    NEW.created_by = OLD.created_by;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply triggers to all tables with audit columns
CREATE TRIGGER audit_students BEFORE INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_faculty BEFORE INSERT OR UPDATE ON public.faculty
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_courses BEFORE INSERT OR UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_subjects BEFORE INSERT OR UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_departments BEFORE INSERT OR UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_exams BEFORE INSERT OR UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_results BEFORE INSERT OR UPDATE ON public.results
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_attendance_sessions BEFORE INSERT OR UPDATE ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_attendance_records BEFORE INSERT OR UPDATE ON public.attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_fee_structures BEFORE INSERT OR UPDATE ON public.fee_structures
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_student_fees BEFORE INSERT OR UPDATE ON public.student_fees
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_fee_payments BEFORE INSERT OR UPDATE ON public.fee_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_books BEFORE INSERT OR UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_book_categories BEFORE INSERT OR UPDATE ON public.book_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_library_members BEFORE INSERT OR UPDATE ON public.library_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_book_issues BEFORE INSERT OR UPDATE ON public.book_issues
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_inventory_items BEFORE INSERT OR UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_inventory_transactions BEFORE INSERT OR UPDATE ON public.inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_suppliers BEFORE INSERT OR UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_enquiries BEFORE INSERT OR UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_mcq_questions BEFORE INSERT OR UPDATE ON public.mcq_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_student_exam_sessions BEFORE INSERT OR UPDATE ON public.student_exam_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER audit_student_answers BEFORE INSERT OR UPDATE ON public.student_answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

-- Create audit log table for detailed tracking
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  college_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins and super_admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    (has_role(auth.uid(), 'admin'::app_role) AND college_id = get_user_college())
  );

-- Function to get user email for audit display
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
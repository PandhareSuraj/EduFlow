-- Create fee management tables with proper RLS policies

-- Fee structures for different courses and semesters
CREATE TABLE public.fee_structures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id integer NOT NULL,
  semester integer NOT NULL,
  total_fee numeric NOT NULL DEFAULT 0,
  registration_fee numeric DEFAULT 0,
  tuition_fee numeric DEFAULT 0,
  lab_fee numeric DEFAULT 0,
  library_fee numeric DEFAULT 0,
  other_fees numeric DEFAULT 0,
  due_date date,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(course_id, semester, college_id)
);

-- Student fee records - tracks what each student owes
CREATE TABLE public.student_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id integer NOT NULL,
  fee_structure_id uuid NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric NOT NULL DEFAULT 0,
  balance_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'partial', 'paid', 'overdue'))
);

-- Fee payments - individual payment transactions
CREATE TABLE public.fee_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_fee_id uuid NOT NULL,
  student_id integer NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'cash',
  transaction_id text,
  cheque_number text,
  bank_name text,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  remarks text,
  receipt_number text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'online', 'card'))
);

-- Fee installments - for students paying in installments
CREATE TABLE public.fee_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_fee_id uuid NOT NULL,
  installment_number integer NOT NULL,
  amount numeric NOT NULL,
  due_date date NOT NULL,
  paid_amount numeric DEFAULT 0,
  paid_date date,
  status text NOT NULL DEFAULT 'pending',
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_installment_status CHECK (status IN ('pending', 'paid', 'overdue'))
);

-- Enable RLS on all fee tables
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_installments ENABLE ROW LEVEL SECURITY;

-- RLS policies for fee_structures
CREATE POLICY "Users can view fee structures from their college" ON public.fee_structures
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage fee structures from their college" ON public.fee_structures
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS policies for student_fees
CREATE POLICY "Users can view student fees from their college" ON public.student_fees
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage student fees from their college" ON public.student_fees
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view own fees" ON public.student_fees
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR 
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = student_fees.student_id 
    AND s.email = get_current_user_email()
  )
);

-- RLS policies for fee_payments
CREATE POLICY "Users can view fee payments from their college" ON public.fee_payments
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage fee payments from their college" ON public.fee_payments
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view own payments" ON public.fee_payments
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR 
  EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = fee_payments.student_id 
    AND s.email = get_current_user_email()
  )
);

-- RLS policies for fee_installments
CREATE POLICY "Users can view fee installments from their college" ON public.fee_installments
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage fee installments from their college" ON public.fee_installments
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- Add triggers for updated_at columns
CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at
  BEFORE UPDATE ON public.student_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at
  BEFORE UPDATE ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_installments_updated_at
  BEFORE UPDATE ON public.fee_installments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically update student fee balance
CREATE OR REPLACE FUNCTION public.update_student_fee_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.student_fees 
    SET 
      paid_amount = COALESCE((
        SELECT SUM(amount) 
        FROM public.fee_payments 
        WHERE student_fee_id = NEW.student_fee_id
      ), 0),
      balance_amount = total_amount - COALESCE((
        SELECT SUM(amount) 
        FROM public.fee_payments 
        WHERE student_fee_id = NEW.student_fee_id
      ), 0),
      status = CASE 
        WHEN COALESCE((
          SELECT SUM(amount) 
          FROM public.fee_payments 
          WHERE student_fee_id = NEW.student_fee_id
        ), 0) >= total_amount THEN 'paid'
        WHEN COALESCE((
          SELECT SUM(amount) 
          FROM public.fee_payments 
          WHERE student_fee_id = NEW.student_fee_id
        ), 0) > 0 THEN 'partial'
        ELSE 'pending'
      END,
      updated_at = now()
    WHERE id = NEW.student_fee_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update student fee balance when payments are made
CREATE TRIGGER update_student_fee_balance_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_fee_balance();
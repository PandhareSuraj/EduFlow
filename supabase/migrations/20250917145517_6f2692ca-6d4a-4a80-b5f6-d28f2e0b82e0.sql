-- Create AMC payments table for tracking AMC payments from colleges
CREATE TABLE public.amc_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  payment_period_start DATE NOT NULL,
  payment_period_end DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  transaction_reference TEXT,
  invoice_number TEXT,
  receipt_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  notes TEXT,
  student_count INTEGER NOT NULL DEFAULT 0,
  user_count INTEGER NOT NULL DEFAULT 0,
  base_fee NUMERIC NOT NULL DEFAULT 0,
  per_student_fee NUMERIC NOT NULL DEFAULT 0,
  per_user_fee NUMERIC NOT NULL DEFAULT 0,
  calculated_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.amc_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for amc_payments
CREATE POLICY "Super admins can manage all AMC payments"
ON public.amc_payments
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create system_analytics table for storing analytics data
CREATE TABLE public.system_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metric_data JSONB DEFAULT '{}',
  college_id UUID, -- NULL for system-wide metrics
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system_analytics
CREATE POLICY "Super admins can manage all system analytics"
ON public.system_analytics
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_amc_payments_college_id ON public.amc_payments(college_id);
CREATE INDEX idx_amc_payments_status ON public.amc_payments(status);
CREATE INDEX idx_amc_payments_payment_date ON public.amc_payments(payment_date);
CREATE INDEX idx_system_analytics_metric_name ON public.system_analytics(metric_name);
CREATE INDEX idx_system_analytics_college_id ON public.system_analytics(college_id);
CREATE INDEX idx_system_analytics_period ON public.system_analytics(period_start, period_end);

-- Create triggers for updated_at
CREATE TRIGGER update_amc_payments_updated_at
  BEFORE UPDATE ON public.amc_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_analytics_updated_at
  BEFORE UPDATE ON public.system_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate auto receipt number for AMC payments
CREATE OR REPLACE FUNCTION public.generate_amc_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number = 'AMC' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_amc_receipt_number_trigger
  BEFORE INSERT ON public.amc_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_amc_receipt_number();
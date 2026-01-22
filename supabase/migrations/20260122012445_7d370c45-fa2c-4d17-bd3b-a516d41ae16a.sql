-- Create audit triggers for financial tables

-- Drop existing triggers if they exist (to avoid duplicates)
DROP TRIGGER IF EXISTS audit_trigger_fee_payments ON public.fee_payments;
DROP TRIGGER IF EXISTS audit_trigger_student_fees ON public.student_fees;
DROP TRIGGER IF EXISTS audit_trigger_fee_structures ON public.fee_structures;
DROP TRIGGER IF EXISTS audit_trigger_fee_installments ON public.fee_installments;

-- Create audit trigger for fee_payments table
CREATE TRIGGER audit_trigger_fee_payments
    AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create audit trigger for student_fees table
CREATE TRIGGER audit_trigger_student_fees
    AFTER INSERT OR UPDATE OR DELETE ON public.student_fees
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create audit trigger for fee_structures table
CREATE TRIGGER audit_trigger_fee_structures
    AFTER INSERT OR UPDATE OR DELETE ON public.fee_structures
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Create audit trigger for fee_installments table
CREATE TRIGGER audit_trigger_fee_installments
    AFTER INSERT OR UPDATE OR DELETE ON public.fee_installments
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Add comment to document the financial audit trail
COMMENT ON TRIGGER audit_trigger_fee_payments ON public.fee_payments IS 'Audit trail for all fee payment transactions';
COMMENT ON TRIGGER audit_trigger_student_fees ON public.student_fees IS 'Audit trail for student fee records';
COMMENT ON TRIGGER audit_trigger_fee_structures ON public.fee_structures IS 'Audit trail for fee structure changes';
COMMENT ON TRIGGER audit_trigger_fee_installments ON public.fee_installments IS 'Audit trail for fee installment changes';
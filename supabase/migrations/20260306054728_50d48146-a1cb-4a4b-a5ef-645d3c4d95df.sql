
-- Create function to recalculate balance when student_fees is updated directly
CREATE OR REPLACE FUNCTION public.recalc_student_fee_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Recalculate balance_amount whenever total_amount or paid_amount changes
  IF NEW.total_amount IS DISTINCT FROM OLD.total_amount 
     OR NEW.paid_amount IS DISTINCT FROM OLD.paid_amount
     OR NEW.discount_amount IS DISTINCT FROM OLD.discount_amount
     OR NEW.original_amount IS DISTINCT FROM OLD.original_amount
  THEN
    NEW.balance_amount := NEW.total_amount - NEW.paid_amount;
    
    -- Update status based on new balance
    IF NEW.balance_amount <= 0 THEN
      NEW.status := 'paid';
      NEW.balance_amount := GREATEST(NEW.balance_amount, 0);
    ELSIF NEW.paid_amount > 0 THEN
      NEW.status := 'partial';
    ELSE
      NEW.status := 'pending';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on student_fees BEFORE UPDATE
CREATE TRIGGER recalc_balance_on_fee_update
BEFORE UPDATE ON public.student_fees
FOR EACH ROW
EXECUTE FUNCTION public.recalc_student_fee_balance();

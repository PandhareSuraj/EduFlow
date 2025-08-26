-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_student_fee_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;
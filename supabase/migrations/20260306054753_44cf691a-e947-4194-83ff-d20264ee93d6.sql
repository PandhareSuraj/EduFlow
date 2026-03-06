
-- Fix existing records where balance_amount doesn't match total_amount - paid_amount
-- This corrects the 2 affected records (students 347 and 345) immediately
UPDATE public.student_fees 
SET balance_amount = total_amount - paid_amount,
    status = CASE 
      WHEN (total_amount - paid_amount) <= 0 THEN 'paid'
      WHEN paid_amount > 0 THEN 'partial'
      ELSE 'pending'
    END
WHERE balance_amount != (total_amount - paid_amount);

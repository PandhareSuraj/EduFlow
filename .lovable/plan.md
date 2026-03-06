

# Fix: Incorrect Balance Amount for Discounted Fee Records

## Problem
Two student fee records (students 347 and 345) show `balance_amount = 25000` when it should be `0`. The `total_amount` is correctly `22000` (after ₹3,000 discount) and `paid_amount` is `22000`, but `balance_amount` was never updated to reflect the discount.

## Root Cause
When discounts were applied to existing records, the `balance_amount` column was not recalculated. The `update_student_fee_balance` trigger only fires on `fee_payments` INSERT/UPDATE, not when `student_fees.total_amount` changes.

## Fix (Two Parts)

### 1. Data Fix — Correct existing wrong balances
Run an UPDATE to fix all records where `balance_amount != total_amount - paid_amount`:
```sql
UPDATE student_fees 
SET balance_amount = total_amount - paid_amount
WHERE balance_amount != (total_amount - paid_amount);
```
This fixes the 2 affected records immediately.

### 2. Prevent Future Occurrences — Add trigger on student_fees UPDATE
Create a trigger on `student_fees` itself that recalculates `balance_amount` whenever `total_amount`, `discount_amount`, or `original_amount` changes. This ensures that editing a fee record (applying discount, changing amount) always keeps the balance correct.

```sql
CREATE TRIGGER recalc_balance_on_fee_update
BEFORE UPDATE ON student_fees
FOR EACH ROW
EXECUTE FUNCTION recalc_student_fee_balance();
```

The function will set `NEW.balance_amount = NEW.total_amount - NEW.paid_amount` and update status accordingly.

This is a database-only fix — no frontend code changes needed.




# Add Additional Fee to Student (Post-Payment Fee Addition)

## Problem
Currently, once a student's fees are fully paid, there's no way to add a new fee category (e.g., Exam Fee, Lab Fee) to that student. The admin needs the ability to add ad-hoc fees to any student regardless of their current payment status.

## Solution

### 1. Database Migration: Add `fee_category` column to `student_fees`

Add a `fee_category` text column to `student_fees` to label each fee line item (e.g., "Tuition Fee", "Exam Fee", "Lab Fee"). Default: `'tuition'`. Also make `fee_structure_id` nullable so ad-hoc fees don't require a fee structure.

```sql
ALTER TABLE student_fees ALTER COLUMN fee_structure_id DROP NOT NULL;
ALTER TABLE student_fees ADD COLUMN fee_category text NOT NULL DEFAULT 'tuition';
ALTER TABLE student_fees ADD COLUMN fee_description text;
```

Existing audit triggers (`audit_trigger_function`) already cover `student_fees` for INSERT/UPDATE/DELETE, so all changes are automatically logged.

### 2. New Component: `AddAdditionalFeeDialog`

**File**: `src/components/fees/AddAdditionalFeeDialog.tsx`

A dialog that allows admin to:
- Search and select a student (using `StudentSearchCombobox`)
- Enter fee category (dropdown: Exam Fee, Lab Fee, Library Fee, Transport Fee, Hostel Fee, Custom/Other)
- Enter custom description if "Other" is selected
- Enter amount and due date
- Optionally apply discount (amount or percentage) with reason
- Submit creates a new `student_fees` row with `fee_structure_id = null`, the selected category, and proper `college_id`

Key validations:
- Amount must be positive
- Due date required
- Category required
- All inputs sanitized

### 3. Update `CollectFeeDialog` to show all fee records (including new ad-hoc ones)

Currently it filters `.gt('balance_amount', 0)` which already works -- new ad-hoc fees with pending balance will appear automatically. The fee record display will show the `fee_category` label so admin can distinguish between tuition and additional fees.

### 4. Update `Fees.tsx` page

- Add an "Add Fee" button next to each student row (in the Actions column) wrapped in `PermissionWrapper` with `FEES_EDIT` permission
- Add a standalone "Add Additional Fee" button in the top action bar
- Display `fee_category` in the table as a small badge/label under the "Final Fee" column

### 5. Update `StudentFeeLedger` to show fee category

Add the `fee_category` column display so ledger reports reflect the additional fee items separately, giving full transparency.

### 6. Security

- The existing audit trigger on `student_fees` automatically logs all INSERT/UPDATE/DELETE with old/new values, user_id, and college_id
- RLS policies on `student_fees` already enforce college-based isolation
- `fee_structure_id` being nullable means ad-hoc fees bypass the structure but still have full audit trail
- All form inputs validated client-side (positive amounts, required fields) and server-side (RLS, audit triggers)

## Technical Details

- The `student_fee_summary` and `student_fee_ledger` views may need updating if they JOIN on `fee_structures` with an INNER JOIN (would exclude ad-hoc fees). Will check and update to LEFT JOIN if needed.
- The `fee_category` field provides clear labeling in receipts, ledgers, and exports.
- Existing `update_student_fee_balance` trigger handles payment balance updates automatically for new fee records too.


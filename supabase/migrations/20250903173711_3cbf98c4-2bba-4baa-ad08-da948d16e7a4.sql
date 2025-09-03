-- Phase 1: Create fee structure for course ID 99 ("computer engg") with ₹700,000
INSERT INTO public.fee_structures (course_id, semester, total_fee, registration_fee, tuition_fee, lab_fee, library_fee, other_fees, due_date, college_id)
SELECT 
  99 as course_id,
  1 as semester,
  700000 as total_fee,
  50000 as registration_fee,
  500000 as tuition_fee,
  100000 as lab_fee,
  25000 as library_fee,
  25000 as other_fees,
  CURRENT_DATE + INTERVAL '30 days' as due_date,
  c.college_id
FROM courses c WHERE c.id = 99
ON CONFLICT DO NOTHING;

-- Phase 1: Create student fee record for STU000050
INSERT INTO public.student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
SELECT 
  s.id as student_id,
  fs.id as fee_structure_id,
  fs.total_fee as total_amount,
  0 as paid_amount,
  fs.total_fee as balance_amount,
  fs.due_date,
  s.college_id,
  'pending' as status
FROM students s
JOIN fee_structures fs ON fs.course_id = s.course_id AND fs.semester = COALESCE(s.semester, 1)
WHERE s.student_id = 'STU000050'
ON CONFLICT DO NOTHING;

-- Phase 2: Create the missing trigger on students table for auto fee creation
CREATE OR REPLACE TRIGGER trigger_auto_create_student_fees
  AFTER INSERT ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_student_fees();

-- Phase 2: Apply the auto fee creation to existing students who might be missing fee records
INSERT INTO public.student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount, due_date, college_id, status)
SELECT DISTINCT
  s.id as student_id,
  fs.id as fee_structure_id,
  fs.total_fee as total_amount,
  0 as paid_amount,
  fs.total_fee as balance_amount,
  fs.due_date,
  s.college_id,
  'pending' as status
FROM students s
JOIN fee_structures fs ON fs.course_id = s.course_id AND fs.semester = COALESCE(s.semester, 1)
LEFT JOIN student_fees sf ON sf.student_id = s.id AND sf.fee_structure_id = fs.id
WHERE sf.id IS NULL
AND s.status = 'active'
ON CONFLICT DO NOTHING;

-- Restrict management to admin/teacher at the college level (super_admin always allowed)

-- 1) Exams
ALTER POLICY "Users can manage exams from their college"
ON public.exams
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
);

-- 2) MCQ Questions
ALTER POLICY "Users can manage questions in their college exams"
ON public.mcq_questions
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
);

-- 3) Student Exam Sessions
ALTER POLICY "Users can manage exam sessions in their college"
ON public.student_exam_sessions
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
);

-- 4) Student Answers
ALTER POLICY "Users can manage student answers in their college"
ON public.student_answers
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    (college_id = get_user_college())
    AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
  )
);

CREATE TABLE public.certificate_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID NOT NULL DEFAULT public.get_user_college(),
  -- Identity
  full_name TEXT NOT NULL,
  mother_name TEXT,
  father_name TEXT,
  -- Personal
  gender TEXT,
  date_of_birth DATE,
  date_of_birth_words TEXT,
  place_of_birth TEXT,
  nationality TEXT DEFAULT 'Indian',
  religion TEXT,
  caste TEXT,
  blood_group TEXT,
  -- Academic
  course TEXT,
  class TEXT,
  register_no TEXT,
  college_code TEXT,
  academic_year TEXT,
  date_of_admission DATE,
  date_of_leaving DATE,
  subjects TEXT,
  previous_exam_details TEXT,
  -- Certificate-specific
  conduct TEXT,
  character TEXT,
  exam_appeared BOOLEAN DEFAULT true,
  exam_name TEXT,
  exam_session TEXT,
  result TEXT,
  seat_no TEXT,
  remarks TEXT,
  -- TC / Bonafide tracking
  tc_no TEXT,
  bonafide_no TEXT,
  -- Standard
  created_by UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificate_students TO authenticated;
GRANT ALL ON public.certificate_students TO service_role;

ALTER TABLE public.certificate_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Privileged roles can view certificate students"
ON public.certificate_students
FOR SELECT
TO authenticated
USING (
  college_id = public.get_user_college()
  AND (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'clerk')
  )
);

CREATE POLICY "Privileged roles can insert certificate students"
ON public.certificate_students
FOR INSERT
TO authenticated
WITH CHECK (
  college_id = public.get_user_college()
  AND (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'clerk')
  )
);

CREATE POLICY "Privileged roles can update certificate students"
ON public.certificate_students
FOR UPDATE
TO authenticated
USING (
  college_id = public.get_user_college()
  AND (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'clerk')
  )
);

CREATE POLICY "Privileged roles can delete certificate students"
ON public.certificate_students
FOR DELETE
TO authenticated
USING (
  college_id = public.get_user_college()
  AND (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'clerk')
  )
);

CREATE TRIGGER update_certificate_students_updated_at
BEFORE UPDATE ON public.certificate_students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
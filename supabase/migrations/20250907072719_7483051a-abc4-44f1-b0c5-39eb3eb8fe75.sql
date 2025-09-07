
-- Phase 1: Backend reliability

-- 1) One-time patch: If there is exactly one college, attach its ID to any NULL college_id rows
DO $$
DECLARE
  v_count integer;
  v_college_id uuid;
BEGIN
  SELECT COUNT(*), MAX(id) INTO v_count, v_college_id FROM public.colleges;

  IF v_count = 1 THEN
    -- Fix missing college_id on roles (critical for RLS)
    UPDATE public.user_roles
    SET college_id = v_college_id
    WHERE college_id IS NULL;

    -- Optional hardening: fix faculty/students missing college (prevents failures in lookups)
    UPDATE public.faculty
    SET college_id = COALESCE(college_id, v_college_id)
    WHERE college_id IS NULL;

    UPDATE public.students
    SET college_id = COALESCE(college_id, v_college_id)
    WHERE college_id IS NULL;
  ELSE
    RAISE NOTICE 'Multiple colleges found; skipped auto-assignment of college_id. Please set user_roles.college_id explicitly for affected users.';
  END IF;
END
$$;

-- 2) Guardrails: ensure user_roles.college_id is auto-filled on insert/update
DROP TRIGGER IF EXISTS set_user_roles_college_id_before_ins ON public.user_roles;
CREATE TRIGGER set_user_roles_college_id_before_ins
BEFORE INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

DROP TRIGGER IF EXISTS set_user_roles_college_id_before_upd ON public.user_roles;
CREATE TRIGGER set_user_roles_college_id_before_upd
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

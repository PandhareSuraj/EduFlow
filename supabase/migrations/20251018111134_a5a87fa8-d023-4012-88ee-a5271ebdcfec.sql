-- Phase 1: Database Schema for Student Year/Semester Upgrade System (Fixed)

-- ==========================================
-- STEP 1: Create New Enums (if not exists)
-- ==========================================

DO $$ BEGIN
  CREATE TYPE promotion_status AS ENUM (
    'preview', 
    'running', 
    'completed', 
    'failed', 
    'rolled_back'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fee_structure_status AS ENUM (
    'draft', 
    'published', 
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- STEP 2: Create Academic Years Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_code TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create unique constraint if not exists
DO $$ BEGIN
  ALTER TABLE public.academic_years ADD CONSTRAINT academic_years_year_code_college_id_key UNIQUE(year_code, college_id);
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- Enable RLS
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- RLS Policies for academic_years
DO $$ BEGIN
  CREATE POLICY "Super admins can manage all academic years"
  ON public.academic_years
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage academic years from their college"
  ON public.academic_years
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view academic years from their college"
  ON public.academic_years
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_academic_years_updated_at ON public.academic_years;
CREATE TRIGGER update_academic_years_updated_at
BEFORE UPDATE ON public.academic_years
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_academic_years_college_id ON public.academic_years(college_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_is_current ON public.academic_years(is_current) WHERE is_current = true;

-- ==========================================
-- STEP 3: Modify fee_structures Table
-- ==========================================

-- Add columns if they don't exist
DO $$ BEGIN
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS effective_from DATE;
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS effective_to DATE;
  ALTER TABLE public.fee_structures ADD COLUMN IF NOT EXISTS fee_status fee_structure_status NOT NULL DEFAULT 'draft';
END $$;

-- Create unique index for versioning
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_structures_version 
ON public.fee_structures(academic_year_id, course_id, semester, version);

-- Add other indexes
CREATE INDEX IF NOT EXISTS idx_fee_structures_academic_year ON public.fee_structures(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_published ON public.fee_structures(is_published) WHERE is_published = true;

-- ==========================================
-- STEP 4: Create Student Academic History Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.student_academic_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  promotion_job_id UUID,
  snapshot_data JSONB NOT NULL,
  previous_year INTEGER NOT NULL,
  previous_semester INTEGER NOT NULL,
  previous_course_id INTEGER,
  previous_status TEXT,
  snapshot_taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_academic_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Super admins can manage all student academic history"
  ON public.student_academic_history
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage student academic history from their college"
  ON public.student_academic_history
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Students can view own academic history"
  ON public.student_academic_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_academic_history.student_id
      AND s.email = get_current_user_email()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_academic_history_student ON public.student_academic_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_job ON public.student_academic_history(promotion_job_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_college ON public.student_academic_history(college_id);

-- ==========================================
-- STEP 5: Create Promotion Jobs Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.promotion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  from_academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  to_academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  target_year INTEGER,
  target_semester INTEGER,
  new_year INTEGER NOT NULL,
  new_semester INTEGER NOT NULL,
  filters JSONB,
  status promotion_status NOT NULL DEFAULT 'preview',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_by UUID NOT NULL REFERENCES auth.users(id),
  total_students INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  can_rollback BOOLEAN NOT NULL DEFAULT true,
  rollback_window_hours INTEGER NOT NULL DEFAULT 48,
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promotion_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Super admins can manage all promotion jobs"
  ON public.promotion_jobs
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage promotion jobs from their college"
  ON public.promotion_jobs
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view promotion jobs from their college"
  ON public.promotion_jobs
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_promotion_jobs_updated_at ON public.promotion_jobs;
CREATE TRIGGER update_promotion_jobs_updated_at
BEFORE UPDATE ON public.promotion_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promotion_jobs_college ON public.promotion_jobs(college_id);
CREATE INDEX IF NOT EXISTS idx_promotion_jobs_status ON public.promotion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_promotion_jobs_started_by ON public.promotion_jobs(started_by);

-- ==========================================
-- STEP 6: Create Promotion Job Events Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.promotion_job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_job_id UUID NOT NULL REFERENCES public.promotion_jobs(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('success', 'failed', 'skipped', 'updated')),
  previous_year INTEGER NOT NULL,
  previous_semester INTEGER NOT NULL,
  new_year INTEGER NOT NULL,
  new_semester INTEGER NOT NULL,
  error_message TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.promotion_job_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Super admins can manage all promotion job events"
  ON public.promotion_job_events
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage promotion job events from their college"
  ON public.promotion_job_events
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role)));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view promotion job events from their college"
  ON public.promotion_job_events
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promotion_job_events_job ON public.promotion_job_events(promotion_job_id);
CREATE INDEX IF NOT EXISTS idx_promotion_job_events_student ON public.promotion_job_events(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_job_events_college ON public.promotion_job_events(college_id);
CREATE INDEX IF NOT EXISTS idx_promotion_job_events_type ON public.promotion_job_events(event_type);

-- ==========================================
-- STEP 7: Create Student Fee Assignments Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.student_fee_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  promotion_job_id UUID REFERENCES public.promotion_jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'cancelled')),
  college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_fee_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
  CREATE POLICY "Super admins can manage all student fee assignments"
  ON public.student_fee_assignments
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage student fee assignments from their college"
  ON public.student_fee_assignments
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role))))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role))));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view student fee assignments from their college"
  ON public.student_fee_assignments
  FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Students can view own fee assignments"
  ON public.student_fee_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_fee_assignments.student_id
      AND s.email = get_current_user_email()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_student_fee_assignments_updated_at ON public.student_fee_assignments;
CREATE TRIGGER update_student_fee_assignments_updated_at
BEFORE UPDATE ON public.student_fee_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_student ON public.student_fee_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_fee_structure ON public.student_fee_assignments(fee_structure_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_academic_year ON public.student_fee_assignments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_college ON public.student_fee_assignments(college_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_assignments_status ON public.student_fee_assignments(status) WHERE status = 'active';

-- ==========================================
-- STEP 8: Create Helper Functions
-- ==========================================

CREATE OR REPLACE FUNCTION public.can_rollback_promotion(job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_record RECORD;
BEGIN
  SELECT 
    status,
    completed_at,
    rollback_window_hours,
    can_rollback
  INTO job_record
  FROM public.promotion_jobs
  WHERE id = job_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF job_record.status = 'completed' 
     AND job_record.can_rollback = true
     AND job_record.completed_at IS NOT NULL
     AND (now() - job_record.completed_at) < (job_record.rollback_window_hours || ' hours')::INTERVAL
  THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_next_year_semester(
  current_year INTEGER,
  current_semester INTEGER,
  course_duration_months INTEGER
)
RETURNS TABLE(next_year INTEGER, next_semester INTEGER, is_graduating BOOLEAN)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  max_years INTEGER;
BEGIN
  max_years := CEIL(course_duration_months / 12.0);
  
  IF current_semester = 1 THEN
    next_year := current_year;
    next_semester := 2;
    is_graduating := false;
  ELSE
    next_year := current_year + 1;
    next_semester := 1;
    is_graduating := (next_year > max_years);
  END IF;
  
  RETURN NEXT;
END;
$$;

-- ==========================================
-- STEP 9: Add Comments
-- ==========================================

COMMENT ON TABLE public.academic_years IS 'Stores academic year definitions for versioning fee structures';
COMMENT ON TABLE public.student_academic_history IS 'Stores snapshots of student data before each promotion for rollback capability';
COMMENT ON TABLE public.promotion_jobs IS 'Tracks batch student promotion operations';
COMMENT ON TABLE public.promotion_job_events IS 'Records per-student results of promotion jobs';
COMMENT ON TABLE public.student_fee_assignments IS 'Links students to specific fee structure versions';

GRANT USAGE ON TYPE promotion_status TO authenticated;
GRANT USAGE ON TYPE fee_structure_status TO authenticated;
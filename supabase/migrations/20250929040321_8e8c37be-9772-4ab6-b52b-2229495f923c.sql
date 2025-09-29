-- Event & Calendar Management Tables
CREATE TABLE public.event_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  description TEXT,
  college_id UUID REFERENCES public.colleges(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT NOT NULL DEFAULT 'academic' CHECK (event_type IN ('academic', 'cultural', 'sports', 'holiday', 'placement', 'other')),
  category_id UUID REFERENCES public.event_categories(id),
  organizer_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  max_attendees INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT true,
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  student_id INTEGER REFERENCES public.students(id),
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attendance_status TEXT NOT NULL DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent')),
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comments TEXT,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.college_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  calendar_date DATE NOT NULL,
  calendar_type TEXT NOT NULL DEFAULT 'holiday' CHECK (calendar_type IN ('holiday', 'exam', 'event', 'academic')),
  description TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  recipient_type TEXT NOT NULL DEFAULT 'all' CHECK (recipient_type IN ('all', 'students', 'faculty', 'specific')),
  recipient_ids UUID[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Placement & Internship Management Tables
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  company_size TEXT,
  description TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  title TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL DEFAULT 'placement' CHECK (job_type IN ('placement', 'internship')),
  employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract')),
  location TEXT,
  salary_range TEXT,
  required_skills TEXT[],
  eligibility_criteria TEXT,
  application_deadline DATE,
  total_positions INTEGER NOT NULL DEFAULT 1,
  filled_positions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.student_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id),
  student_id INTEGER NOT NULL REFERENCES public.students(id),
  application_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'selected')),
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_feedback TEXT,
  final_result TEXT,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.interviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID NOT NULL REFERENCES public.job_postings(id),
  student_id INTEGER NOT NULL REFERENCES public.students(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  interview_type TEXT NOT NULL DEFAULT 'technical' CHECK (interview_type IN ('technical', 'hr', 'group', 'final')),
  interview_date DATE NOT NULL,
  interview_time TIME,
  location TEXT,
  interviewer_name TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  result TEXT CHECK (result IN ('selected', 'rejected', 'pending')),
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.placement_drives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  drive_date DATE NOT NULL,
  venue TEXT,
  job_positions TEXT[],
  eligible_courses INTEGER[],
  min_cgpa NUMERIC,
  registration_deadline DATE,
  coordinator_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.student_placements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES public.students(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  job_posting_id UUID REFERENCES public.job_postings(id),
  position_title TEXT NOT NULL,
  package_amount NUMERIC,
  joining_date DATE,
  placement_type TEXT NOT NULL DEFAULT 'campus' CHECK (placement_type IN ('campus', 'off_campus')),
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'rejected', 'joined')),
  college_id UUID REFERENCES public.colleges(id),
  placed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grievance/Feedback System Tables
CREATE TABLE public.grievance_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  escalation_level INTEGER NOT NULL DEFAULT 1,
  response_time_hours INTEGER NOT NULL DEFAULT 24,
  college_id UUID REFERENCES public.colleges(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.grievances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.grievance_categories(id),
  grievance_type TEXT NOT NULL DEFAULT 'complaint' CHECK (grievance_type IN ('complaint', 'suggestion', 'feedback')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed')),
  submitted_by_type TEXT NOT NULL CHECK (submitted_by_type IN ('student', 'faculty', 'staff')),
  submitted_by_id UUID,
  student_id INTEGER REFERENCES public.students(id),
  faculty_id UUID REFERENCES public.faculty(id),
  assigned_to UUID,
  escalated_to UUID,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_date TIMESTAMP WITH TIME ZONE,
  resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.grievance_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.grievance_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  response_by UUID,
  response_type TEXT NOT NULL DEFAULT 'external' CHECK (response_type IN ('internal', 'external')),
  is_public BOOLEAN NOT NULL DEFAULT true,
  college_id UUID REFERENCES public.colleges(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL DEFAULT 'students' CHECK (target_audience IN ('students', 'faculty', 'all')),
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  college_id UUID REFERENCES public.colleges(id),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.feedback_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.feedback_forms(id),
  submitted_by UUID,
  student_id INTEGER REFERENCES public.students(id),
  responses JSONB NOT NULL DEFAULT '{}',
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  college_id UUID REFERENCES public.colleges(id)
);

-- Enable Row Level Security
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Event Management
CREATE POLICY "Users can view events from their college" ON public.events
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage events from their college" ON public.events
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view event categories from their college" ON public.event_categories
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage event categories from their college" ON public.event_categories
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view event attendees from their college" ON public.event_attendees
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage event attendees from their college" ON public.event_attendees
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view college calendar from their college" ON public.college_calendar
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage college calendar from their college" ON public.college_calendar
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view reminders from their college" ON public.reminders
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage reminders from their college" ON public.reminders
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for Placement Management
CREATE POLICY "Users can view companies from their college" ON public.companies
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage companies from their college" ON public.companies
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view job postings from their college" ON public.job_postings
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view active job postings" ON public.job_postings
FOR SELECT USING (status = 'active' AND college_id = get_user_college());

CREATE POLICY "Users can manage job postings from their college" ON public.job_postings
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view own applications" ON public.student_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_applications.student_id 
    AND s.email = get_current_user_email()
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Students can manage own applications" ON public.student_applications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_applications.student_id 
    AND s.email = get_current_user_email()
  ) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college()
);

CREATE POLICY "Users can view interviews from their college" ON public.interviews
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage interviews from their college" ON public.interviews
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view placement drives from their college" ON public.placement_drives
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage placement drives from their college" ON public.placement_drives
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view student placements from their college" ON public.student_placements
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Students can view own placements" ON public.student_placements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_placements.student_id 
    AND s.email = get_current_user_email()
  )
);

CREATE POLICY "Users can manage student placements from their college" ON public.student_placements
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

-- RLS Policies for Grievance Management
CREATE POLICY "Users can view grievance categories from their college" ON public.grievance_categories
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage grievance categories from their college" ON public.grievance_categories
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view grievances from their college" ON public.grievances
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR
  submitted_by_id = auth.uid() OR
  (student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = grievances.student_id 
    AND s.email = get_current_user_email()
  ))
);

CREATE POLICY "Users can submit grievances" ON public.grievances
FOR INSERT WITH CHECK (
  college_id = get_user_college() AND (
    submitted_by_id = auth.uid() OR
    (student_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = grievances.student_id 
      AND s.email = get_current_user_email()
    ))
  )
);

CREATE POLICY "Users can manage grievances from their college" ON public.grievances
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view grievance attachments" ON public.grievance_attachments
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR
  uploaded_by = auth.uid()
);

CREATE POLICY "Users can manage grievance attachments" ON public.grievance_attachments
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view grievance responses" ON public.grievance_responses
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR
  response_by = auth.uid()
);

CREATE POLICY "Users can manage grievance responses" ON public.grievance_responses
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view feedback forms from their college" ON public.feedback_forms
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can manage feedback forms from their college" ON public.feedback_forms
FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role) OR college_id = get_user_college());

CREATE POLICY "Users can view feedback submissions from their college" ON public.feedback_submissions
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  college_id = get_user_college() OR
  submitted_by = auth.uid() OR
  (student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = feedback_submissions.student_id 
    AND s.email = get_current_user_email()
  ))
);

CREATE POLICY "Users can submit feedback" ON public.feedback_submissions
FOR INSERT WITH CHECK (
  college_id = get_user_college() AND (
    submitted_by = auth.uid() OR
    (student_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = feedback_submissions.student_id 
      AND s.email = get_current_user_email()
    ))
  )
);

-- Add triggers for updated_at
CREATE TRIGGER update_event_categories_updated_at
  BEFORE UPDATE ON public.event_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_college_calendar_updated_at
  BEFORE UPDATE ON public.college_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_applications_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_placement_drives_updated_at
  BEFORE UPDATE ON public.placement_drives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_placements_updated_at
  BEFORE UPDATE ON public.student_placements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grievance_categories_updated_at
  BEFORE UPDATE ON public.grievance_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at
  BEFORE UPDATE ON public.grievances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_forms_updated_at
  BEFORE UPDATE ON public.feedback_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit triggers
CREATE TRIGGER audit_event_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_events_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_companies_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_job_postings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_grievances_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Add college_id auto-fill triggers
CREATE TRIGGER auto_fill_event_categories_college_id
  BEFORE INSERT ON public.event_categories
  FOR EACH ROW EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_events_college_id
  BEFORE INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_companies_college_id
  BEFORE INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_job_postings_college_id
  BEFORE INSERT ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_grievances_college_id
  BEFORE INSERT ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.auto_fill_college_id();

-- Add audit fields triggers
CREATE TRIGGER handle_event_categories_audit_fields
  BEFORE INSERT OR UPDATE ON public.event_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER handle_events_audit_fields
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER handle_companies_audit_fields
  BEFORE INSERT OR UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER handle_job_postings_audit_fields
  BEFORE INSERT OR UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();

CREATE TRIGGER handle_grievances_audit_fields
  BEFORE INSERT OR UPDATE ON public.grievances
  FOR EACH ROW EXECUTE FUNCTION public.handle_audit_fields();
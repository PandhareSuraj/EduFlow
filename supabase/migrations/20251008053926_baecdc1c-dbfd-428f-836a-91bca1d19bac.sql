-- Create follow_up_history table for audit trail
CREATE TABLE IF NOT EXISTS public.follow_up_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  followup_type TEXT NOT NULL CHECK (followup_type IN ('enquiry', 'fee_payment', 'custom')),
  reference_id TEXT NOT NULL,
  student_id INTEGER,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  previous_status TEXT,
  new_status TEXT,
  previous_date DATE,
  new_date DATE,
  remarks TEXT,
  action_taken TEXT,
  contacted_via TEXT CHECK (contacted_via IN ('phone', 'whatsapp', 'email', 'in_person', 'other')),
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create custom_followups table for non-enquiry/fee follow-ups
CREATE TABLE IF NOT EXISTS public.custom_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  student_id INTEGER REFERENCES public.students(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  follow_up_date DATE NOT NULL,
  next_follow_up_date DATE,
  last_contact_date DATE,
  contact_count INTEGER DEFAULT 0,
  remarks TEXT,
  tags TEXT[],
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing follow-up fields to enquiries table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'priority') THEN
    ALTER TABLE public.enquiries ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'next_follow_up_date') THEN
    ALTER TABLE public.enquiries ADD COLUMN next_follow_up_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'last_contact_date') THEN
    ALTER TABLE public.enquiries ADD COLUMN last_contact_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'contact_count') THEN
    ALTER TABLE public.enquiries ADD COLUMN contact_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'contacted_via') THEN
    ALTER TABLE public.enquiries ADD COLUMN contacted_via TEXT CHECK (contacted_via IN ('phone', 'whatsapp', 'email', 'in_person', 'other'));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follow_up_history_reference ON public.follow_up_history(reference_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_history_college ON public.follow_up_history(college_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_history_type ON public.follow_up_history(followup_type);
CREATE INDEX IF NOT EXISTS idx_custom_followups_date ON public.custom_followups(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_custom_followups_college ON public.custom_followups(college_id);
CREATE INDEX IF NOT EXISTS idx_custom_followups_status ON public.custom_followups(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_next_followup ON public.enquiries(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_student_fees_next_followup ON public.student_fees(next_follow_up_date);

-- Enable RLS
ALTER TABLE public.follow_up_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_followups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for follow_up_history
CREATE POLICY "Users can view follow up history from their college"
  ON public.follow_up_history FOR SELECT
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    college_id = get_user_college()
  );

CREATE POLICY "Users can insert follow up history from their college"
  ON public.follow_up_history FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    college_id = get_user_college()
  );

-- RLS Policies for custom_followups
CREATE POLICY "Users can manage custom followups from their college"
  ON public.custom_followups FOR ALL
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR 
    college_id = get_user_college()
  );

-- Trigger for updated_at
CREATE TRIGGER update_follow_up_history_updated_at
  BEFORE UPDATE ON public.follow_up_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_followups_updated_at
  BEFORE UPDATE ON public.custom_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for audit fields
CREATE TRIGGER handle_custom_followups_audit
  BEFORE INSERT OR UPDATE ON public.custom_followups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_audit_fields();
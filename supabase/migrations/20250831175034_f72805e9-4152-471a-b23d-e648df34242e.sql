-- Create enquiries table for admission enquiry management
CREATE TABLE public.enquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  course text NOT NULL,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  follow_up_date date,
  assigned_to text,
  notes text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for enquiries
CREATE POLICY "Users can manage enquiries from their college" 
ON public.enquiries 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Users can view enquiries from their college" 
ON public.enquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enquiries_updated_at
BEFORE UPDATE ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto fill college_id trigger
CREATE TRIGGER auto_fill_enquiries_college_id
BEFORE INSERT ON public.enquiries
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

-- Insert some sample enquiry data
INSERT INTO public.enquiries (name, phone, email, course, source, status, follow_up_date, assigned_to, notes) VALUES
('Rahul Sharma', '+91-9876543210', 'rahul.sharma@email.com', 'DMLT', 'website', 'new', '2024-01-15', 'Dr. Smith', 'Interested in laboratory technology course'),
('Priya Patel', '+91-9876543211', 'priya.patel@email.com', 'DRT', 'referral', 'contacted', '2024-01-16', 'Dr. Johnson', 'Parent inquiry about radiology program'),
('Amit Kumar', '+91-9876543212', 'amit.kumar@email.com', 'DOTT', 'phone', 'follow_up', '2024-01-17', 'Dr. Brown', 'Needs more information about OT technology'),
('Sneha Singh', '+91-9876543213', 'sneha.singh@email.com', 'DMLT', 'walk_in', 'converted', null, 'Dr. Wilson', 'Successfully enrolled in DMLT program'),
('Ravi Gupta', '+91-9876543214', 'ravi.gupta@email.com', 'DRT', 'social_media', 'new', '2024-01-18', 'Dr. Davis', 'Social media inquiry about radiology course');
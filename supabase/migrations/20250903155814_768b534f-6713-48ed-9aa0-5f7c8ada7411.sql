-- Create library management tables

-- Book categories table
CREATE TABLE public.book_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Books table
CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn text,
  title text NOT NULL,
  author text NOT NULL,
  publisher text,
  publication_year integer,
  category_id uuid,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  location text,
  price numeric DEFAULT 0,
  language text DEFAULT 'English',
  pages integer,
  description text,
  status text NOT NULL DEFAULT 'active',
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Library members table
CREATE TABLE public.library_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  student_id integer,
  faculty_id uuid,
  member_type text NOT NULL, -- 'student', 'faculty', 'staff'
  membership_number text NOT NULL,
  max_books integer NOT NULL DEFAULT 3,
  membership_start_date date NOT NULL DEFAULT CURRENT_DATE,
  membership_end_date date,
  status text NOT NULL DEFAULT 'active',
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Book issues table
CREATE TABLE public.book_issues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL,
  member_id uuid NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  return_date date,
  renewal_count integer DEFAULT 0,
  max_renewals integer DEFAULT 2,
  status text NOT NULL DEFAULT 'issued', -- 'issued', 'returned', 'overdue', 'renewed'
  issued_by uuid,
  returned_by uuid,
  remarks text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Library fines table  
CREATE TABLE public.library_fines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid NOT NULL,
  member_id uuid NOT NULL,
  fine_amount numeric NOT NULL DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  balance_amount numeric NOT NULL DEFAULT 0,
  fine_per_day numeric DEFAULT 5,
  days_overdue integer DEFAULT 0,
  fine_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_date date,
  waived_by uuid,
  waiver_reason text,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'waived', 'partial'
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Library settings table
CREATE TABLE public.library_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  description text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for book_categories
CREATE POLICY "Users can view categories from their college" 
ON public.book_categories FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Users can manage categories from their college" 
ON public.book_categories FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

-- Create RLS policies for books
CREATE POLICY "Users can view books from their college" 
ON public.books FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Librarians can manage books from their college" 
ON public.books FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'librarian'::app_role))));

-- Create RLS policies for library_members
CREATE POLICY "Users can view members from their college" 
ON public.library_members FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Members can view own membership" 
ON public.library_members FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Librarians can manage members from their college" 
ON public.library_members FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'librarian'::app_role))));

-- Create RLS policies for book_issues
CREATE POLICY "Users can view issues from their college" 
ON public.book_issues FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Members can view own issues" 
ON public.book_issues FOR SELECT 
USING (EXISTS (SELECT 1 FROM library_members lm WHERE lm.id = book_issues.member_id AND lm.user_id = auth.uid()));

CREATE POLICY "Librarians can manage issues from their college" 
ON public.book_issues FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'librarian'::app_role))));

-- Create RLS policies for library_fines
CREATE POLICY "Users can view fines from their college" 
ON public.library_fines FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Members can view own fines" 
ON public.library_fines FOR SELECT 
USING (EXISTS (SELECT 1 FROM library_members lm WHERE lm.id = library_fines.member_id AND lm.user_id = auth.uid()));

CREATE POLICY "Librarians can manage fines from their college" 
ON public.library_fines FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'librarian'::app_role))));

-- Create RLS policies for library_settings
CREATE POLICY "Users can view settings from their college" 
ON public.library_settings FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college()));

CREATE POLICY "Librarians can manage settings from their college" 
ON public.library_settings FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (college_id = get_user_college() AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'librarian'::app_role))));

-- Add triggers for updated_at columns
CREATE TRIGGER update_book_categories_updated_at
BEFORE UPDATE ON public.book_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_members_updated_at
BEFORE UPDATE ON public.library_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_issues_updated_at
BEFORE UPDATE ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_fines_updated_at
BEFORE UPDATE ON public.library_fines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_settings_updated_at
BEFORE UPDATE ON public.library_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add auto-fill college_id triggers
CREATE TRIGGER auto_fill_book_categories_college_id
BEFORE INSERT ON public.book_categories
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_books_college_id
BEFORE INSERT ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_library_members_college_id
BEFORE INSERT ON public.library_members
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_book_issues_college_id
BEFORE INSERT ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_library_fines_college_id
BEFORE INSERT ON public.library_fines
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_library_settings_college_id
BEFORE INSERT ON public.library_settings
FOR EACH ROW
EXECUTE FUNCTION public.auto_fill_college_id();

-- Create unique constraints
CREATE UNIQUE INDEX idx_book_categories_name_college ON public.book_categories(name, college_id);
CREATE UNIQUE INDEX idx_library_members_membership_number ON public.library_members(membership_number);
CREATE UNIQUE INDEX idx_library_settings_key_college ON public.library_settings(setting_key, college_id);

-- Create indexes for better performance
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_books_isbn ON public.books(isbn);
CREATE INDEX idx_books_category ON public.books(category_id);
CREATE INDEX idx_book_issues_status ON public.book_issues(status);
CREATE INDEX idx_book_issues_due_date ON public.book_issues(due_date);
CREATE INDEX idx_library_fines_status ON public.library_fines(status);

-- Function to update book availability when issued/returned
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'issued' THEN
    -- Decrease available copies when book is issued
    UPDATE public.books 
    SET available_copies = available_copies - 1,
        updated_at = now()
    WHERE id = NEW.book_id AND available_copies > 0;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned' THEN
    -- Increase available copies when book is returned
    UPDATE public.books 
    SET available_copies = available_copies + 1,
        updated_at = now()
    WHERE id = NEW.book_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update book availability
CREATE TRIGGER update_book_availability_trigger
AFTER INSERT OR UPDATE ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_book_availability();

-- Function to generate membership number
CREATE OR REPLACE FUNCTION public.generate_membership_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_number IS NULL THEN
    NEW.membership_number = 'LIB' || LPAD(EXTRACT(EPOCH FROM NOW())::bigint::text, 10, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate membership number
CREATE TRIGGER generate_membership_number_trigger
BEFORE INSERT ON public.library_members
FOR EACH ROW
EXECUTE FUNCTION public.generate_membership_number();

-- Function to calculate and create fines for overdue books
CREATE OR REPLACE FUNCTION public.calculate_overdue_fines()
RETURNS TRIGGER AS $$
DECLARE
  v_fine_per_day numeric := 5;
  v_days_overdue integer;
  v_fine_amount numeric;
BEGIN
  -- Only process when status changes to overdue or when return_date is set after due_date
  IF (TG_OP = 'UPDATE' AND NEW.status = 'overdue') OR 
     (TG_OP = 'UPDATE' AND NEW.return_date IS NOT NULL AND NEW.return_date > NEW.due_date) THEN
    
    -- Get fine per day from settings or use default
    SELECT setting_value::numeric INTO v_fine_per_day 
    FROM public.library_settings 
    WHERE setting_key = 'fine_per_day' AND college_id = NEW.college_id 
    LIMIT 1;
    
    IF v_fine_per_day IS NULL THEN
      v_fine_per_day := 5;
    END IF;
    
    -- Calculate days overdue
    v_days_overdue := COALESCE(NEW.return_date, CURRENT_DATE) - NEW.due_date;
    
    IF v_days_overdue > 0 THEN
      v_fine_amount := v_days_overdue * v_fine_per_day;
      
      -- Insert or update fine record
      INSERT INTO public.library_fines (
        issue_id, member_id, fine_amount, balance_amount, 
        fine_per_day, days_overdue, college_id
      ) VALUES (
        NEW.id, NEW.member_id, v_fine_amount, v_fine_amount,
        v_fine_per_day, v_days_overdue, NEW.college_id
      )
      ON CONFLICT (issue_id) DO UPDATE SET
        fine_amount = v_fine_amount,
        balance_amount = v_fine_amount - EXCLUDED.paid_amount,
        days_overdue = v_days_overdue,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to calculate fines
CREATE TRIGGER calculate_overdue_fines_trigger
AFTER UPDATE ON public.book_issues
FOR EACH ROW
EXECUTE FUNCTION public.calculate_overdue_fines();

-- Insert default library settings
INSERT INTO public.library_settings (setting_key, setting_value, description) VALUES
('fine_per_day', '5', 'Fine amount per day for overdue books'),
('max_renewal', '2', 'Maximum number of renewals allowed'),
('loan_period_days', '14', 'Default loan period in days'),
('student_max_books', '3', 'Maximum books a student can borrow'),
('faculty_max_books', '5', 'Maximum books a faculty can borrow'),
('staff_max_books', '3', 'Maximum books a staff can borrow')
ON CONFLICT DO NOTHING;
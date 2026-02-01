-- ============================================================================
-- COMPREHENSIVE RLS SECURITY AUDIT AND HARDENING
-- EduFlow College Management System
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PHASE 1: HELPER FUNCTIONS
-- ============================================================================

-- Get student's internal ID from auth user
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.students 
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
$$;

-- Get current user's primary role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'teacher' THEN 3
      WHEN 'accountant' THEN 4
      WHEN 'librarian' THEN 5
      WHEN 'clerk' THEN 6
      WHEN 'assistant' THEN 7
      WHEN 'auditor' THEN 8
      WHEN 'student' THEN 9
    END
  LIMIT 1
$$;

-- Check if teacher teaches a specific course (via department or schedule)
CREATE OR REPLACE FUNCTION public.teacher_teaches_course(_course_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.faculty f
    WHERE f.user_id = auth.uid()
    AND (
      f.department = (SELECT department FROM public.courses WHERE id = _course_id)
      OR EXISTS (
        SELECT 1 FROM public.class_schedules cs
        WHERE cs.faculty_id = f.id
        AND cs.course_id = _course_id
      )
    )
  )
$$;

-- ============================================================================
-- PHASE 2: DROP ALL LEGACY PERMISSIVE POLICIES
-- ============================================================================

-- Students table
DROP POLICY IF EXISTS "Students can view own data" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Users can view students from their college" ON public.students;
DROP POLICY IF EXISTS "Users can manage students from their college" ON public.students;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.students;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.students;

-- Results table
DROP POLICY IF EXISTS "Users can view results from their college" ON public.results;
DROP POLICY IF EXISTS "Users can manage results from their college" ON public.results;
DROP POLICY IF EXISTS "Students can view own results" ON public.results;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.results;

-- Attendance tables
DROP POLICY IF EXISTS "Users can view attendance records from their college" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can manage attendance records from their college" ON public.attendance_records;
DROP POLICY IF EXISTS "Students can view own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.attendance_records;

DROP POLICY IF EXISTS "Users can view attendance sessions from their college" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Users can manage attendance sessions from their college" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.attendance_sessions;

-- Courses table
DROP POLICY IF EXISTS "Users can view courses from their college" ON public.courses;
DROP POLICY IF EXISTS "Users can manage courses from their college" ON public.courses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.courses;

-- Subjects table
DROP POLICY IF EXISTS "Users can view subjects from their college" ON public.subjects;
DROP POLICY IF EXISTS "Users can manage subjects from their college" ON public.subjects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.subjects;

-- Fee tables
DROP POLICY IF EXISTS "Users can view student fees from their college" ON public.student_fees;
DROP POLICY IF EXISTS "Users can manage student fees from their college" ON public.student_fees;
DROP POLICY IF EXISTS "Students can view own fees" ON public.student_fees;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.student_fees;

DROP POLICY IF EXISTS "Users can view fee payments from their college" ON public.fee_payments;
DROP POLICY IF EXISTS "Users can manage fee payments from their college" ON public.fee_payments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.fee_payments;

DROP POLICY IF EXISTS "Users can view fee structures from their college" ON public.fee_structures;
DROP POLICY IF EXISTS "Users can manage fee structures from their college" ON public.fee_structures;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.fee_structures;

-- Faculty table
DROP POLICY IF EXISTS "Users can view faculty from their college" ON public.faculty;
DROP POLICY IF EXISTS "Users can manage faculty from their college" ON public.faculty;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.faculty;

-- Profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Exams table
DROP POLICY IF EXISTS "Users can view exams from their college" ON public.exams;
DROP POLICY IF EXISTS "Users can manage exams from their college" ON public.exams;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.exams;

-- Enquiries table
DROP POLICY IF EXISTS "Users can view enquiries from their college" ON public.enquiries;
DROP POLICY IF EXISTS "Users can manage enquiries from their college" ON public.enquiries;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.enquiries;

-- Books/Library tables
DROP POLICY IF EXISTS "Users can view books from their college" ON public.books;
DROP POLICY IF EXISTS "Users can manage books from their college" ON public.books;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.books;

DROP POLICY IF EXISTS "Users can view book issues from their college" ON public.book_issues;
DROP POLICY IF EXISTS "Users can manage book issues from their college" ON public.book_issues;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.book_issues;

DROP POLICY IF EXISTS "Users can view book categories from their college" ON public.book_categories;
DROP POLICY IF EXISTS "Users can manage book categories from their college" ON public.book_categories;

-- Hostel tables
DROP POLICY IF EXISTS "Users can view hostel rooms from their college" ON public.hostel_rooms;
DROP POLICY IF EXISTS "Users can manage hostel rooms from their college" ON public.hostel_rooms;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.hostel_rooms;

DROP POLICY IF EXISTS "Users can view hostel allocations from their college" ON public.hostel_allocations;
DROP POLICY IF EXISTS "Users can manage hostel allocations from their college" ON public.hostel_allocations;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.hostel_allocations;

-- Transport table
DROP POLICY IF EXISTS "Users can view transport routes from their college" ON public.transport_routes;
DROP POLICY IF EXISTS "Users can manage transport routes from their college" ON public.transport_routes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transport_routes;

-- Departments table
DROP POLICY IF EXISTS "Users can view departments from their college" ON public.departments;
DROP POLICY IF EXISTS "Users can manage departments from their college" ON public.departments;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.departments;

-- Grievances table
DROP POLICY IF EXISTS "Users can view grievances from their college" ON public.grievances;
DROP POLICY IF EXISTS "Users can manage grievances from their college" ON public.grievances;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.grievances;

-- Events table
DROP POLICY IF EXISTS "Users can view events from their college" ON public.events;
DROP POLICY IF EXISTS "Users can manage events from their college" ON public.events;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;

-- User roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;

-- Colleges
DROP POLICY IF EXISTS "Users can view their own college" ON public.colleges;
DROP POLICY IF EXISTS "Super admins can manage all colleges" ON public.colleges;

-- Audit logs
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- ============================================================================
-- PHASE 3: STUDENTS TABLE POLICIES
-- ============================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_select" ON public.students
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR user_id = auth.uid()
);

CREATE POLICY "students_insert" ON public.students
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "students_update" ON public.students
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
);

CREATE POLICY "students_delete" ON public.students
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 4: RESULTS TABLE POLICIES
-- ============================================================================

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "results_select" ON public.results
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      NOT has_role(auth.uid(), 'student'::app_role)
      OR student_id = get_current_student_id()
    )
  )
);

CREATE POLICY "results_insert" ON public.results
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "results_update" ON public.results
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "results_delete" ON public.results
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 5: ATTENDANCE TABLES POLICIES
-- ============================================================================

-- attendance_records
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_records_select" ON public.attendance_records
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR student_id = get_current_student_id()
);

CREATE POLICY "attendance_records_insert" ON public.attendance_records
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "attendance_records_update" ON public.attendance_records
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "attendance_records_delete" ON public.attendance_records
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- attendance_sessions
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance_sessions_select" ON public.attendance_sessions
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "attendance_sessions_insert" ON public.attendance_sessions
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "attendance_sessions_update" ON public.attendance_sessions
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "attendance_sessions_delete" ON public.attendance_sessions
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 6: COURSES AND SUBJECTS POLICIES
-- ============================================================================

-- Courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select" ON public.courses
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "courses_insert" ON public.courses
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "courses_update" ON public.courses
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "courses_delete" ON public.courses
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_select" ON public.subjects
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "subjects_insert" ON public.subjects
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "subjects_update" ON public.subjects
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "subjects_delete" ON public.subjects
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 7: FEE TABLES POLICIES
-- ============================================================================

-- student_fees
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_fees_select" ON public.student_fees
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR student_id = get_current_student_id()
);

CREATE POLICY "student_fees_insert" ON public.student_fees
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'accountant'::app_role)
    )
  )
);

CREATE POLICY "student_fees_update" ON public.student_fees
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'accountant'::app_role)
    )
  )
);

CREATE POLICY "student_fees_delete" ON public.student_fees
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- fee_payments
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fee_payments_select" ON public.fee_payments
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR EXISTS (
    SELECT 1 FROM public.student_fees sf 
    WHERE sf.id = fee_payments.student_fee_id 
    AND sf.student_id = get_current_student_id()
  )
);

CREATE POLICY "fee_payments_insert" ON public.fee_payments
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'accountant'::app_role)
    )
  )
);

CREATE POLICY "fee_payments_update" ON public.fee_payments
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'accountant'::app_role)
    )
  )
);

CREATE POLICY "fee_payments_delete" ON public.fee_payments
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- fee_structures
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fee_structures_select" ON public.fee_structures
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "fee_structures_insert" ON public.fee_structures
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "fee_structures_update" ON public.fee_structures
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "fee_structures_delete" ON public.fee_structures
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 8: PROFILES TABLE POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR id = auth.uid()
);

CREATE POLICY "profiles_insert" ON public.profiles
FOR INSERT WITH CHECK (
  id = auth.uid()
);

CREATE POLICY "profiles_update" ON public.profiles
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR id = auth.uid()
);

CREATE POLICY "profiles_delete" ON public.profiles
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- ============================================================================
-- PHASE 9: USER_ROLES TABLE POLICIES
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select" ON public.user_roles
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
  OR user_id = auth.uid()
);

CREATE POLICY "user_roles_insert" ON public.user_roles
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "user_roles_update" ON public.user_roles
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "user_roles_delete" ON public.user_roles
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 10: REMAINING TABLES
-- ============================================================================

-- Faculty
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faculty_select" ON public.faculty
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "faculty_insert" ON public.faculty
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "faculty_update" ON public.faculty
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
  OR user_id = auth.uid()
);

CREATE POLICY "faculty_delete" ON public.faculty
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exams_select" ON public.exams
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "exams_insert" ON public.exams
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "exams_update" ON public.exams
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  )
);

CREATE POLICY "exams_delete" ON public.exams
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Enquiries
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enquiries_select" ON public.enquiries
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "enquiries_insert" ON public.enquiries
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "enquiries_update" ON public.enquiries
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "enquiries_delete" ON public.enquiries
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_select" ON public.books
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "books_insert" ON public.books
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'librarian'::app_role)
    )
  )
);

CREATE POLICY "books_update" ON public.books
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'librarian'::app_role)
    )
  )
);

CREATE POLICY "books_delete" ON public.books
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Book Issues
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "book_issues_select" ON public.book_issues
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "book_issues_insert" ON public.book_issues
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'librarian'::app_role)
    )
  )
);

CREATE POLICY "book_issues_update" ON public.book_issues
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'librarian'::app_role)
    )
  )
);

CREATE POLICY "book_issues_delete" ON public.book_issues
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Book Categories
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "book_categories_select" ON public.book_categories
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "book_categories_insert" ON public.book_categories
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'librarian'::app_role)
    )
  )
);

CREATE POLICY "book_categories_update" ON public.book_categories
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    college_id = get_user_college() AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'librarian'::app_role)
    )
  )
);

CREATE POLICY "book_categories_delete" ON public.book_categories
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Hostel Rooms
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hostel_rooms_select" ON public.hostel_rooms
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "hostel_rooms_insert" ON public.hostel_rooms
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "hostel_rooms_update" ON public.hostel_rooms
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "hostel_rooms_delete" ON public.hostel_rooms
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Hostel Allocations
ALTER TABLE public.hostel_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hostel_allocations_select" ON public.hostel_allocations
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "hostel_allocations_insert" ON public.hostel_allocations
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "hostel_allocations_update" ON public.hostel_allocations
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "hostel_allocations_delete" ON public.hostel_allocations
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Transport Routes
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transport_routes_select" ON public.transport_routes
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "transport_routes_insert" ON public.transport_routes
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "transport_routes_update" ON public.transport_routes
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "transport_routes_delete" ON public.transport_routes
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departments_select" ON public.departments
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "departments_insert" ON public.departments
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "departments_update" ON public.departments
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "departments_delete" ON public.departments
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Grievances
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grievances_select" ON public.grievances
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND NOT has_role(auth.uid(), 'student'::app_role))
  OR submitted_by = auth.uid()
);

CREATE POLICY "grievances_insert" ON public.grievances
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "grievances_update" ON public.grievances
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "grievances_delete" ON public.grievances
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON public.events
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR college_id = get_user_college()
);

CREATE POLICY "events_insert" ON public.events
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "events_update" ON public.events
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "events_delete" ON public.events
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (college_id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

-- ============================================================================
-- PHASE 11: RLS ACCESS AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rls_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role text,
  college_id uuid,
  record_id text,
  accessed_at timestamp with time zone DEFAULT now(),
  policy_matched text,
  details jsonb
);

CREATE INDEX IF NOT EXISTS idx_rls_access_log_accessed_at ON public.rls_access_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_rls_access_log_user_id ON public.rls_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rls_access_log_table_name ON public.rls_access_log(table_name);

ALTER TABLE public.rls_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_access_log_select" ON public.rls_access_log
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "rls_access_log_insert" ON public.rls_access_log
FOR INSERT WITH CHECK (true);

CREATE POLICY "rls_access_log_no_update" ON public.rls_access_log
FOR UPDATE USING (false);

CREATE POLICY "rls_access_log_no_delete" ON public.rls_access_log
FOR DELETE USING (false);

-- ============================================================================
-- PHASE 12: COLLEGES AND AUDIT LOGS
-- ============================================================================

-- Colleges table
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "colleges_select" ON public.colleges
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR id = get_user_college()
);

CREATE POLICY "colleges_insert" ON public.colleges
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "colleges_update" ON public.colleges
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR (id = get_user_college() AND has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "colleges_delete" ON public.colleges
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Audit logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select" ON public.audit_logs
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'auditor'::app_role)
);

CREATE POLICY "audit_logs_insert" ON public.audit_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_no_update" ON public.audit_logs
FOR UPDATE USING (false);

CREATE POLICY "audit_logs_no_delete" ON public.audit_logs
FOR DELETE USING (false);

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================================================

-- Uncomment these to verify:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT tablename, policyname, permissive, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- SELECT tablename, COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename ORDER BY policy_count DESC;

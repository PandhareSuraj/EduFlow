-- Standardize all status values to lowercase across tables that have status columns

-- Faculty table
UPDATE public.faculty SET status = LOWER(status) WHERE status != LOWER(status);

-- Students table
UPDATE public.students SET status = LOWER(status) WHERE status != LOWER(status);

-- Colleges table
UPDATE public.colleges SET status = LOWER(status) WHERE status != LOWER(status);

-- Courses table
UPDATE public.courses SET status = LOWER(status) WHERE status != LOWER(status);

-- Departments table
UPDATE public.departments SET status = LOWER(status) WHERE status != LOWER(status);

-- Books table
UPDATE public.books SET status = LOWER(status) WHERE status != LOWER(status);

-- Book issues table
UPDATE public.book_issues SET status = LOWER(status) WHERE status != LOWER(status);

-- Buses table
UPDATE public.buses SET status = LOWER(status) WHERE status != LOWER(status);

-- Class schedules table
UPDATE public.class_schedules SET status = LOWER(status) WHERE status != LOWER(status);

-- Companies table
UPDATE public.companies SET status = LOWER(status) WHERE status != LOWER(status);

-- Enquiries table
UPDATE public.enquiries SET status = LOWER(status) WHERE status != LOWER(status);

-- Events table
UPDATE public.events SET status = LOWER(status) WHERE status != LOWER(status);

-- Exams table
UPDATE public.exams SET status = LOWER(status) WHERE status != LOWER(status);

-- Hostel rooms table
UPDATE public.hostel_rooms SET status = LOWER(status) WHERE status != LOWER(status);

-- Hostel allocations table
UPDATE public.hostel_allocations SET status = LOWER(status) WHERE status != LOWER(status);

-- Inventory items table
UPDATE public.inventory_items SET status = LOWER(status) WHERE status != LOWER(status);

-- Job postings table
UPDATE public.job_postings SET status = LOWER(status) WHERE status != LOWER(status);

-- Student applications table
UPDATE public.student_applications SET status = LOWER(status) WHERE status != LOWER(status);

-- Student placements table
UPDATE public.student_placements SET status = LOWER(status) WHERE status != LOWER(status);

-- Transport routes table
UPDATE public.transport_routes SET status = LOWER(status) WHERE status != LOWER(status);

-- Student fees table
UPDATE public.student_fees SET status = LOWER(status) WHERE status != LOWER(status);

-- Fee installments table
UPDATE public.fee_installments SET status = LOWER(status) WHERE status != LOWER(status);

-- AMC payments table
UPDATE public.amc_payments SET status = LOWER(status) WHERE status != LOWER(status);

-- Attendance records table
UPDATE public.attendance_records SET status = LOWER(status) WHERE status != LOWER(status);

-- Attendance sessions table
UPDATE public.attendance_sessions SET status = LOWER(status) WHERE status != LOWER(status);

-- Placement drives table
UPDATE public.placement_drives SET status = LOWER(status) WHERE status != LOWER(status);

-- Interviews table
UPDATE public.interviews SET status = LOWER(status) WHERE status != LOWER(status);

-- Library fines table
UPDATE public.library_fines SET status = LOWER(status) WHERE status != LOWER(status);

-- Add check constraints to enforce lowercase status values going forward
ALTER TABLE public.faculty ADD CONSTRAINT faculty_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.students ADD CONSTRAINT students_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.colleges ADD CONSTRAINT colleges_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.courses ADD CONSTRAINT courses_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.departments ADD CONSTRAINT departments_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.books ADD CONSTRAINT books_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.book_issues ADD CONSTRAINT book_issues_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.buses ADD CONSTRAINT buses_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.class_schedules ADD CONSTRAINT class_schedules_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.companies ADD CONSTRAINT companies_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.events ADD CONSTRAINT events_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.exams ADD CONSTRAINT exams_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.hostel_rooms ADD CONSTRAINT hostel_rooms_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.hostel_allocations ADD CONSTRAINT hostel_allocations_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.job_postings ADD CONSTRAINT job_postings_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.student_applications ADD CONSTRAINT student_applications_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.student_placements ADD CONSTRAINT student_placements_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.transport_routes ADD CONSTRAINT transport_routes_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.student_fees ADD CONSTRAINT student_fees_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.fee_installments ADD CONSTRAINT fee_installments_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.amc_payments ADD CONSTRAINT amc_payments_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.attendance_records ADD CONSTRAINT attendance_records_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.attendance_sessions ADD CONSTRAINT attendance_sessions_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.placement_drives ADD CONSTRAINT placement_drives_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.interviews ADD CONSTRAINT interviews_status_lowercase CHECK (status = LOWER(status));
ALTER TABLE public.library_fines ADD CONSTRAINT library_fines_status_lowercase CHECK (status = LOWER(status));
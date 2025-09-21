-- Add comprehensive field constraints and validation
-- Phone number validation constraint
ALTER TABLE students 
ADD CONSTRAINT check_mobile_number_format 
CHECK (mobile_number ~ '^[6-9][0-9]{9}$');

ALTER TABLE faculty 
ADD CONSTRAINT check_phone_format 
CHECK (phone ~ '^[6-9][0-9]{9}$');

ALTER TABLE enquiries 
ADD CONSTRAINT check_enquiry_phone_format 
CHECK (phone ~ '^[6-9][0-9]{9}$');

-- Email format validation
ALTER TABLE students 
ADD CONSTRAINT check_email_format 
CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');

ALTER TABLE faculty 
ADD CONSTRAINT check_faculty_email_format 
CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');

ALTER TABLE enquiries 
ADD CONSTRAINT check_enquiry_email_format 
CHECK (email IS NULL OR email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- Name validation (letters, spaces, dots, hyphens, apostrophes only)
ALTER TABLE students 
ADD CONSTRAINT check_name_format 
CHECK (name ~ '^[a-zA-Z\s.\'''-]+$' AND length(trim(name)) >= 2 AND length(trim(name)) <= 50);

ALTER TABLE faculty 
ADD CONSTRAINT check_faculty_name_format 
CHECK (name ~ '^[a-zA-Z\s.\'''-]+$' AND length(trim(name)) >= 2 AND length(trim(name)) <= 50);

-- Student ID format validation
ALTER TABLE students 
ADD CONSTRAINT check_student_id_format 
CHECK (student_id ~ '^[A-Z0-9]{3,15}$');

-- Amount validations
ALTER TABLE fee_payments 
ADD CONSTRAINT check_amount_positive 
CHECK (amount > 0 AND amount <= 10000000);

ALTER TABLE fee_structures 
ADD CONSTRAINT check_fee_amounts_positive 
CHECK (total_fee >= 0 AND registration_fee >= 0 AND tuition_fee >= 0 AND lab_fee >= 0 AND library_fee >= 0 AND other_fees >= 0);

ALTER TABLE amc_payments 
ADD CONSTRAINT check_amc_amounts_positive 
CHECK (amount > 0 AND calculated_amount >= 0 AND base_fee >= 0 AND per_student_fee >= 0 AND per_user_fee >= 0);

-- Percentage validations
ALTER TABLE student_fees 
ADD CONSTRAINT check_discount_percentage_valid 
CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));

ALTER TABLE attendance_sessions 
ADD CONSTRAINT check_attendance_percentage_valid 
CHECK (attendance_percentage IS NULL OR (attendance_percentage >= 0 AND attendance_percentage <= 100));

-- Exam validations
ALTER TABLE exams 
ADD CONSTRAINT check_exam_marks_valid 
CHECK (total_marks > 0 AND total_marks <= 1000 AND passing_marks >= 0 AND passing_marks <= total_marks);

ALTER TABLE exams 
ADD CONSTRAINT check_duration_valid 
CHECK (duration_minutes > 0 AND duration_minutes <= 600);

ALTER TABLE mcq_questions 
ADD CONSTRAINT check_question_marks_valid 
CHECK (marks > 0 AND marks <= 100);

-- Inventory validations
ALTER TABLE inventory_items 
ADD CONSTRAINT check_stock_valid 
CHECK (current_stock >= 0 AND min_stock >= 0 AND max_stock > min_stock AND price_per_unit >= 0);

ALTER TABLE inventory_transactions 
ADD CONSTRAINT check_quantity_valid 
CHECK (quantity > 0);

-- Book validations
ALTER TABLE books 
ADD CONSTRAINT check_copies_valid 
CHECK (total_copies > 0 AND available_copies >= 0 AND available_copies <= total_copies);

ALTER TABLE books 
ADD CONSTRAINT check_publication_year_valid 
CHECK (publication_year IS NULL OR (publication_year >= 1800 AND publication_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1));

-- Library fine validations
ALTER TABLE library_fines 
ADD CONSTRAINT check_fine_amounts_valid 
CHECK (fine_amount >= 0 AND paid_amount >= 0 AND balance_amount >= 0 AND fine_per_day >= 0);

-- Date validations for future dates
ALTER TABLE exams 
ADD CONSTRAINT check_exam_date_future 
CHECK (exam_date >= CURRENT_DATE);

-- Semester and year validations
ALTER TABLE students 
ADD CONSTRAINT check_semester_valid 
CHECK (semester >= 1 AND semester <= 10);

ALTER TABLE students 
ADD CONSTRAINT check_year_valid 
CHECK (year >= 1 AND year <= 6);

ALTER TABLE fee_structures 
ADD CONSTRAINT check_fee_semester_valid 
CHECK (semester >= 1 AND semester <= 10);

-- Payment method validations
ALTER TABLE fee_payments 
ADD CONSTRAINT check_payment_method_valid 
CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'online', 'card'));

-- Transaction ID format validation
ALTER TABLE fee_payments 
ADD CONSTRAINT check_transaction_id_format 
CHECK (transaction_id IS NULL OR transaction_id ~ '^[A-Za-z0-9\-_]{5,50}$');

-- Cheque number format validation
ALTER TABLE fee_payments 
ADD CONSTRAINT check_cheque_number_format 
CHECK (cheque_number IS NULL OR cheque_number ~ '^[0-9]{6,12}$');

-- Status validations
ALTER TABLE students 
ADD CONSTRAINT check_student_status_valid 
CHECK (status IN ('active', 'inactive', 'graduated', 'dropout', 'transferred'));

ALTER TABLE faculty 
ADD CONSTRAINT check_faculty_status_valid 
CHECK (status IN ('active', 'inactive', 'terminated', 'resigned'));

ALTER TABLE courses 
ADD CONSTRAINT check_course_status_valid 
CHECK (status IN ('active', 'inactive', 'discontinued'));

-- OTP validation
ALTER TABLE otp_verifications 
ADD CONSTRAINT check_otp_format 
CHECK (otp_code ~ '^[0-9]{6}$');

-- Ensure positive counts
ALTER TABLE attendance_sessions 
ADD CONSTRAINT check_attendance_counts_valid 
CHECK (present_count >= 0 AND absent_count >= 0 AND total_students >= 0 AND (present_count + absent_count) <= total_students);

-- Library member validations
ALTER TABLE library_members 
ADD CONSTRAINT check_max_books_valid 
CHECK (max_books > 0 AND max_books <= 10);

-- Add unique constraints where needed
ALTER TABLE students 
ADD CONSTRAINT unique_student_email_per_college 
UNIQUE (email, college_id);

ALTER TABLE faculty 
ADD CONSTRAINT unique_faculty_email_per_college 
UNIQUE (email, college_id);

-- Ensure proper case formatting for certain fields
CREATE OR REPLACE FUNCTION normalize_email() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.email = LOWER(TRIM(NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION normalize_phone() 
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'students' THEN
        NEW.mobile_number = REGEXP_REPLACE(NEW.mobile_number, '[^0-9]', '', 'g');
    ELSIF TG_TABLE_NAME = 'faculty' THEN
        NEW.phone = REGEXP_REPLACE(NEW.phone, '[^0-9]', '', 'g');
    ELSIF TG_TABLE_NAME = 'enquiries' THEN
        NEW.phone = REGEXP_REPLACE(NEW.phone, '[^0-9]', '', 'g');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION normalize_student_id() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.student_id = UPPER(TRIM(NEW.student_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for data normalization
CREATE TRIGGER normalize_student_email 
BEFORE INSERT OR UPDATE ON students 
FOR EACH ROW EXECUTE FUNCTION normalize_email();

CREATE TRIGGER normalize_faculty_email 
BEFORE INSERT OR UPDATE ON faculty 
FOR EACH ROW EXECUTE FUNCTION normalize_email();

CREATE TRIGGER normalize_enquiry_email 
BEFORE INSERT OR UPDATE ON enquiries 
FOR EACH ROW EXECUTE FUNCTION normalize_email();

CREATE TRIGGER normalize_student_phone 
BEFORE INSERT OR UPDATE ON students 
FOR EACH ROW EXECUTE FUNCTION normalize_phone();

CREATE TRIGGER normalize_faculty_phone 
BEFORE INSERT OR UPDATE ON faculty 
FOR EACH ROW EXECUTE FUNCTION normalize_phone();

CREATE TRIGGER normalize_enquiry_phone 
BEFORE INSERT OR UPDATE ON enquiries 
FOR EACH ROW EXECUTE FUNCTION normalize_phone();

CREATE TRIGGER normalize_student_id_trigger 
BEFORE INSERT OR UPDATE ON students 
FOR EACH ROW EXECUTE FUNCTION normalize_student_id();

-- Add comments to document constraints
COMMENT ON CONSTRAINT check_mobile_number_format ON students IS 'Ensures mobile number is 10 digits starting with 6-9';
COMMENT ON CONSTRAINT check_email_format ON students IS 'Ensures email follows proper format';
COMMENT ON CONSTRAINT check_name_format ON students IS 'Ensures name contains only valid characters and proper length';
COMMENT ON CONSTRAINT check_student_id_format ON students IS 'Ensures student ID is 3-15 uppercase alphanumeric characters';
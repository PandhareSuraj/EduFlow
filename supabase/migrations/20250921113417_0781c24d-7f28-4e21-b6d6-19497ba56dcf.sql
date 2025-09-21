-- First, make phone column nullable in enquiries table
ALTER TABLE enquiries ALTER COLUMN phone DROP NOT NULL;

-- Clean up existing data to match constraints
-- Clean phone numbers in enquiries table - keep valid ones, null invalid ones
UPDATE enquiries 
SET phone = CASE 
    WHEN phone IS NOT NULL AND LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 10 
         AND REGEXP_REPLACE(phone, '[^0-9]', '', 'g') ~ '^[6-9][0-9]{9}$'
    THEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
    ELSE NULL
END;

-- Clean phone numbers in students table
UPDATE students 
SET mobile_number = REGEXP_REPLACE(mobile_number, '[^0-9]', '', 'g') 
WHERE mobile_number IS NOT NULL;

-- Clean phone numbers in faculty table  
UPDATE faculty 
SET phone = REGEXP_REPLACE(phone, '[^0-9]', '', 'g') 
WHERE phone IS NOT NULL;

-- Clean emails to lowercase
UPDATE students SET email = LOWER(TRIM(email));
UPDATE faculty SET email = LOWER(TRIM(email));
UPDATE enquiries SET email = LOWER(TRIM(email)) WHERE email IS NOT NULL;

-- Clean student IDs to uppercase
UPDATE students SET student_id = UPPER(TRIM(student_id));

-- Now add the basic constraints (simplified to avoid conflicts with existing data)
-- Phone number validation constraint (allow NULL for enquiries)
ALTER TABLE students 
ADD CONSTRAINT check_mobile_number_format 
CHECK (mobile_number ~ '^[6-9][0-9]{9}$');

ALTER TABLE faculty 
ADD CONSTRAINT check_phone_format 
CHECK (phone ~ '^[6-9][0-9]{9}$');

ALTER TABLE enquiries 
ADD CONSTRAINT check_enquiry_phone_format 
CHECK (phone IS NULL OR phone ~ '^[6-9][0-9]{9}$');

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

-- Name validation (allow reasonable character set)
ALTER TABLE students 
ADD CONSTRAINT check_name_format 
CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 100);

ALTER TABLE faculty 
ADD CONSTRAINT check_faculty_name_format 
CHECK (length(trim(name)) >= 2 AND length(trim(name)) <= 100);

-- Student ID format validation
ALTER TABLE students 
ADD CONSTRAINT check_student_id_format 
CHECK (student_id ~ '^[A-Z0-9]{3,15}$');
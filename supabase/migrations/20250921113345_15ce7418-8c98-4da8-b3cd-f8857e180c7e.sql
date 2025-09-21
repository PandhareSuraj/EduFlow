-- Clean up existing data to match constraints
-- Clean phone numbers in enquiries table
UPDATE enquiries 
SET phone = REGEXP_REPLACE(phone, '[^0-9]', '', 'g') 
WHERE phone IS NOT NULL;

-- Remove invalid phone numbers that still don't match after cleaning
UPDATE enquiries 
SET phone = NULL 
WHERE phone IS NOT NULL 
AND (LENGTH(phone) != 10 OR phone !~ '^[6-9][0-9]{9}$');

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

-- Now add the constraints
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

-- Name validation
ALTER TABLE students 
ADD CONSTRAINT check_name_format 
CHECK (name ~ '^[a-zA-Z\s.\-'']+$' AND length(trim(name)) >= 2 AND length(trim(name)) <= 50);

ALTER TABLE faculty 
ADD CONSTRAINT check_faculty_name_format 
CHECK (name ~ '^[a-zA-Z\s.\-'']+$' AND length(trim(name)) >= 2 AND length(trim(name)) <= 50);

-- Student ID format validation
ALTER TABLE students 
ADD CONSTRAINT check_student_id_format 
CHECK (student_id ~ '^[A-Z0-9]{3,15}$');

-- Add unique constraints where needed
ALTER TABLE students 
ADD CONSTRAINT unique_student_email_per_college 
UNIQUE (email, college_id);

ALTER TABLE faculty 
ADD CONSTRAINT unique_faculty_email_per_college 
UNIQUE (email, college_id);
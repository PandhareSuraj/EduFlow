-- First, clean up existing data to match constraints
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
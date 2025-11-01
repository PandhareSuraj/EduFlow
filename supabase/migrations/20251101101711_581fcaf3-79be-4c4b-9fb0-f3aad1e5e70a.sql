-- Clean up orphaned library members (students that don't exist)
DELETE FROM library_members
WHERE member_type = 'student' 
  AND student_id IS NOT NULL
  AND student_id NOT IN (SELECT id FROM students);

-- Clean up orphaned library members (faculty that don't exist)
DELETE FROM library_members
WHERE member_type = 'faculty' 
  AND faculty_id IS NOT NULL
  AND faculty_id NOT IN (SELECT id FROM faculty);

-- Add foreign key constraints to prevent future orphans
ALTER TABLE library_members
ADD CONSTRAINT fk_library_members_student
FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE library_members
ADD CONSTRAINT fk_library_members_faculty
FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE;
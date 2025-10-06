-- Fix placement system table schemas

-- Update interviews table
ALTER TABLE interviews DROP COLUMN IF EXISTS job_id;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS job_posting_id uuid REFERENCES job_postings(id);

-- Update student_placements table
ALTER TABLE student_placements DROP COLUMN IF EXISTS job_id;
ALTER TABLE student_placements ADD COLUMN IF NOT EXISTS job_posting_id uuid REFERENCES job_postings(id);
ALTER TABLE student_placements DROP COLUMN IF EXISTS salary_package;
ALTER TABLE student_placements ADD COLUMN IF NOT EXISTS package_amount numeric;

-- Update student_applications table
ALTER TABLE student_applications DROP COLUMN IF EXISTS job_id;
ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS job_posting_id uuid REFERENCES job_postings(id);

-- Update placement_drives table  
ALTER TABLE placement_drives DROP COLUMN IF EXISTS minimum_cgpa;
ALTER TABLE placement_drives ADD COLUMN IF NOT EXISTS min_cgpa numeric;
ALTER TABLE placement_drives ALTER COLUMN eligible_courses TYPE text[];

-- Add skills column to student_applications if missing
ALTER TABLE student_applications ADD COLUMN IF NOT EXISTS skills text;
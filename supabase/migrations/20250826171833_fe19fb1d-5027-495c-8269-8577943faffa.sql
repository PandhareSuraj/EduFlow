
-- Add foreign key relationships that are missing
ALTER TABLE student_fees 
ADD CONSTRAINT fk_student_fees_student_id 
FOREIGN KEY (student_id) REFERENCES students(id);

ALTER TABLE fee_payments 
ADD CONSTRAINT fk_fee_payments_student_id 
FOREIGN KEY (student_id) REFERENCES students(id);

ALTER TABLE fee_payments 
ADD CONSTRAINT fk_fee_payments_student_fee_id 
FOREIGN KEY (student_fee_id) REFERENCES student_fees(id);

ALTER TABLE fee_installments 
ADD CONSTRAINT fk_fee_installments_student_fee_id 
FOREIGN KEY (student_fee_id) REFERENCES student_fees(id);

ALTER TABLE students 
ADD CONSTRAINT fk_students_course_id 
FOREIGN KEY (course_id) REFERENCES courses(id);

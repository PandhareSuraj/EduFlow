-- MCQ Exam System Database Schema

-- 1. Enhance existing exams table
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS total_questions integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS exam_type text DEFAULT 'mcq',
ADD COLUMN IF NOT EXISTS instructions text,
ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS max_attempts integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS passing_marks numeric DEFAULT 50;

-- 2. Create MCQ questions table
CREATE TABLE public.mcq_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]', -- Array of options: [{"key": "A", "text": "Option A"}, ...]
  correct_answer text NOT NULL, -- "A", "B", "C", or "D"
  marks numeric NOT NULL DEFAULT 1,
  difficulty text DEFAULT 'medium', -- easy, medium, hard
  explanation text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT mcq_questions_valid_answer CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  CONSTRAINT mcq_questions_valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard'))
);

-- 3. Create student exam sessions table
CREATE TABLE public.student_exam_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id integer NOT NULL REFERENCES public.students(id),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL DEFAULT 1,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  submit_time timestamp with time zone,
  duration_minutes integer,
  status text NOT NULL DEFAULT 'in_progress', -- in_progress, completed, timed_out, abandoned
  total_questions integer DEFAULT 0,
  answered_questions integer DEFAULT 0,
  marks_obtained numeric DEFAULT 0,
  total_marks numeric DEFAULT 0,
  percentage numeric,
  grade text,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT student_exam_sessions_valid_status CHECK (status IN ('in_progress', 'completed', 'timed_out', 'abandoned')),
  UNIQUE(student_id, exam_id, attempt_number)
);

-- 4. Create student answers table
CREATE TABLE public.student_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.student_exam_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.mcq_questions(id) ON DELETE CASCADE,
  selected_answer text, -- "A", "B", "C", "D" or null if not answered
  is_correct boolean DEFAULT false,
  marks_obtained numeric DEFAULT 0,
  time_spent_seconds integer,
  answered_at timestamp with time zone,
  college_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT student_answers_valid_answer CHECK (selected_answer IS NULL OR selected_answer IN ('A', 'B', 'C', 'D')),
  UNIQUE(session_id, question_id)
);

-- Enable RLS on new tables
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mcq_questions
CREATE POLICY "Users can manage questions in their college exams"
ON public.mcq_questions FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Students can view questions in their exams"
ON public.mcq_questions FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college()) OR
  (EXISTS (
    SELECT 1 FROM public.student_exam_sessions ses
    JOIN public.students s ON s.id = ses.student_id
    WHERE ses.exam_id = mcq_questions.exam_id 
    AND s.email = get_current_user_email()
    AND ses.status = 'in_progress'
  ))
);

-- RLS Policies for student_exam_sessions
CREATE POLICY "Users can manage exam sessions in their college"
ON public.student_exam_sessions FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Students can view own exam sessions"
ON public.student_exam_sessions FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college()) OR
  (EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_exam_sessions.student_id 
    AND s.email = get_current_user_email()
  ))
);

CREATE POLICY "Students can insert own exam sessions"
ON public.student_exam_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_exam_sessions.student_id 
    AND s.email = get_current_user_email()
    AND s.college_id = student_exam_sessions.college_id
  )
);

CREATE POLICY "Students can update own exam sessions"
ON public.student_exam_sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_exam_sessions.student_id 
    AND s.email = get_current_user_email()
  )
);

-- RLS Policies for student_answers
CREATE POLICY "Users can manage student answers in their college"
ON public.student_answers FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  (college_id = get_user_college())
);

CREATE POLICY "Students can manage own answers"
ON public.student_answers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.student_exam_sessions ses
    JOIN public.students s ON s.id = ses.student_id
    WHERE ses.id = student_answers.session_id 
    AND s.email = get_current_user_email()
  )
);

-- Indexes for performance
CREATE INDEX idx_mcq_questions_exam_id ON public.mcq_questions(exam_id);
CREATE INDEX idx_mcq_questions_college_id ON public.mcq_questions(college_id);
CREATE INDEX idx_student_exam_sessions_student_id ON public.student_exam_sessions(student_id);
CREATE INDEX idx_student_exam_sessions_exam_id ON public.student_exam_sessions(exam_id);
CREATE INDEX idx_student_exam_sessions_college_id ON public.student_exam_sessions(college_id);
CREATE INDEX idx_student_answers_session_id ON public.student_answers(session_id);
CREATE INDEX idx_student_answers_question_id ON public.student_answers(question_id);

-- Auto-fill college_id triggers
CREATE TRIGGER auto_fill_mcq_questions_college_id
  BEFORE INSERT ON public.mcq_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_student_exam_sessions_college_id
  BEFORE INSERT ON public.student_exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

CREATE TRIGGER auto_fill_student_answers_college_id
  BEFORE INSERT ON public.student_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_fill_college_id();

-- Update timestamps triggers
CREATE TRIGGER update_mcq_questions_updated_at
  BEFORE UPDATE ON public.mcq_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_exam_sessions_updated_at
  BEFORE UPDATE ON public.student_exam_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_answers_updated_at
  BEFORE UPDATE ON public.student_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate exam session results
CREATE OR REPLACE FUNCTION public.calculate_exam_session_results()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_total_marks numeric := 0;
  v_obtained_marks numeric := 0;
  v_total_questions integer := 0;
  v_answered_questions integer := 0;
  v_percentage numeric := 0;
  v_grade text := 'F';
BEGIN
  -- Calculate totals from student answers
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN selected_answer IS NOT NULL THEN 1 END),
    COALESCE(SUM(marks_obtained), 0)
  INTO v_total_questions, v_answered_questions, v_obtained_marks
  FROM public.student_answers sa
  JOIN public.mcq_questions mq ON mq.id = sa.question_id
  WHERE sa.session_id = NEW.id;
  
  -- Get total possible marks
  SELECT COALESCE(SUM(marks), 0)
  INTO v_total_marks
  FROM public.mcq_questions mq
  JOIN public.student_answers sa ON sa.question_id = mq.id
  WHERE sa.session_id = NEW.id;
  
  -- Calculate percentage
  IF v_total_marks > 0 THEN
    v_percentage := ROUND((v_obtained_marks / v_total_marks) * 100, 2);
  END IF;
  
  -- Determine grade
  IF v_percentage >= 90 THEN v_grade := 'A+';
  ELSIF v_percentage >= 80 THEN v_grade := 'A';
  ELSIF v_percentage >= 70 THEN v_grade := 'B+';
  ELSIF v_percentage >= 60 THEN v_grade := 'B';
  ELSIF v_percentage >= 50 THEN v_grade := 'C';
  ELSIF v_percentage >= 40 THEN v_grade := 'D';
  ELSE v_grade := 'F';
  END IF;
  
  -- Update session with calculated results
  NEW.total_questions := v_total_questions;
  NEW.answered_questions := v_answered_questions;
  NEW.marks_obtained := v_obtained_marks;
  NEW.total_marks := v_total_marks;
  NEW.percentage := v_percentage;
  NEW.grade := v_grade;
  
  RETURN NEW;
END;
$function$;

-- Trigger to auto-calculate results when session is completed
CREATE TRIGGER calculate_exam_results
  BEFORE UPDATE OF status ON public.student_exam_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION public.calculate_exam_session_results();

-- Function to auto-grade student answers
CREATE OR REPLACE FUNCTION public.auto_grade_student_answer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_correct_answer text;
  v_question_marks numeric;
BEGIN
  -- Get correct answer and marks for the question
  SELECT correct_answer, marks
  INTO v_correct_answer, v_question_marks
  FROM public.mcq_questions
  WHERE id = NEW.question_id;
  
  -- Check if answer is correct and assign marks
  IF NEW.selected_answer = v_correct_answer THEN
    NEW.is_correct := true;
    NEW.marks_obtained := v_question_marks;
  ELSE
    NEW.is_correct := false;
    NEW.marks_obtained := 0;
  END IF;
  
  NEW.answered_at := now();
  
  RETURN NEW;
END;
$function$;

-- Trigger to auto-grade answers
CREATE TRIGGER auto_grade_answer
  BEFORE INSERT OR UPDATE OF selected_answer ON public.student_answers
  FOR EACH ROW
  WHEN (NEW.selected_answer IS NOT NULL)
  EXECUTE FUNCTION public.auto_grade_student_answer();
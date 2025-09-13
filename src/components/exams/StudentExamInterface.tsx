import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, AlertCircle, Send, Timer } from "lucide-react";
import { getCurrentISTTime, formatISTDate, convertToIST } from "@/utils/dateUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MCQOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface MCQQuestion {
  id: string;
  question_number: number;
  question_text: string;
  options: MCQOption[];
  marks: number;
}

interface ExamSession {
  id: string;
  exam_id: string;
  start_time: string;
  duration_minutes: number;
  status: 'in_progress' | 'completed' | 'timed_out';
}

interface Exam {
  id: string;
  name: string;
  instructions: string;
  duration_minutes: number;
  total_questions: number;
  total_marks: number;
  passing_marks: number;
}

interface StudentExamInterfaceProps {
  exam: Exam;
  studentId: number;
  onExamComplete?: (sessionId: string) => void;
}

export function StudentExamInterface({ exam, studentId, onExamComplete }: StudentExamInterfaceProps) {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    if (!examStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeRemaining]);

  // Auto-save answers periodically
  useEffect(() => {
    if (!session || !examStarted) return;

    const autoSave = setInterval(async () => {
      await saveAnswers(false);
    }, 30000); // Save every 30 seconds

    return () => clearInterval(autoSave);
  }, [session, examStarted, answers]);

  const startExam = async () => {
    setLoading(true);
    try {
      // Check for existing active session
      const { data: existingSession } = await supabase
        .from('student_exam_sessions')
        .select('*')
        .eq('student_id', studentId)
        .eq('exam_id', exam.id)
        .eq('status', 'in_progress')
        .single();

      let sessionData;
      if (existingSession) {
        sessionData = existingSession;
        // Calculate remaining time
        const startTime = convertToIST(existingSession.start_time);
        const currentTime = getCurrentISTTime();
        const elapsed = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
        const remaining = Math.max(0, (exam.duration_minutes * 60) - elapsed);
        setTimeRemaining(remaining);
      } else {
        // Create new session
        const { data: newSession, error } = await supabase
          .from('student_exam_sessions')
          .insert([{
            student_id: studentId,
            exam_id: exam.id,
            duration_minutes: exam.duration_minutes,
            status: 'in_progress'
          }])
          .select()
          .single();

        if (error) throw error;
        sessionData = newSession;
        setTimeRemaining(exam.duration_minutes * 60);
      }

      setSession(sessionData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('mcq_questions')
        .select('id, question_number, question_text, options, marks')
        .eq('exam_id', exam.id)
        .order('question_number');

      if (questionsError) throw questionsError;
      
      const formattedQuestions = (questionsData || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as unknown as MCQOption[] : []
      }));
      
      setQuestions(formattedQuestions);

      // Load existing answers if resuming
      if (existingSession) {
        const { data: answersData } = await supabase
          .from('student_answers')
          .select('question_id, selected_answer')
          .eq('session_id', sessionData.id);

        if (answersData) {
          const answersMap: Record<string, 'A' | 'B' | 'C' | 'D'> = {};
          answersData.forEach(answer => {
            if (answer.selected_answer) {
              answersMap[answer.question_id] = answer.selected_answer as 'A' | 'B' | 'C' | 'D';
            }
          });
          setAnswers(answersMap);
        }
      }

      setExamStarted(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAnswers = async (showToast = true) => {
    if (!session) return;

    try {
      const answerUpdates = Object.entries(answers).map(([questionId, answer]) => ({
        session_id: session.id,
        question_id: questionId,
        selected_answer: answer
      }));

      if (answerUpdates.length > 0) {
        const { error } = await supabase
          .from('student_answers')
          .upsert(answerUpdates, { onConflict: 'session_id,question_id' });

        if (error) throw error;

        if (showToast) {
          toast({
            title: "Answers Saved",
            description: "Your answers have been saved",
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to save answers:', error);
      if (showToast) {
        toast({
          title: "Save Failed",
          description: "Failed to save answers",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmitExam = async () => {
    if (!session) return;

    setSubmitting(true);
    try {
      // Save final answers
      await saveAnswers(false);

      // Update session status
      const { error } = await supabase
        .from('student_exam_sessions')
        .update({ 
          status: 'completed',
          submit_time: formatISTDate(getCurrentISTTime(), 'yyyy-MM-dd HH:mm:ss'),
          end_time: formatISTDate(getCurrentISTTime(), 'yyyy-MM-dd HH:mm:ss')
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Exam Submitted",
        description: "Your exam has been submitted successfully",
      });

      onExamComplete?.(session.id);
    } catch (error: any) {
      toast({
        title: "Submit Failed",
        description: error.message || "Failed to submit exam",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleAutoSubmit = useCallback(async () => {
    if (!session) return;

    try {
      await saveAnswers(false);
      
      const { error } = await supabase
        .from('student_exam_sessions')
        .update({ 
          status: 'timed_out',
          submit_time: formatISTDate(getCurrentISTTime(), 'yyyy-MM-dd HH:mm:ss'),
          end_time: formatISTDate(getCurrentISTTime(), 'yyyy-MM-dd HH:mm:ss')
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Time's Up!",
        description: "Exam has been auto-submitted due to time limit",
        variant: "destructive"
      });

      onExamComplete?.(session.id);
    } catch (error: any) {
      console.error('Auto-submit failed:', error);
    }
  }, [session, onExamComplete]);

  const selectAnswer = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 600) return 'text-green-600'; // > 10 minutes
    if (timeRemaining > 300) return 'text-yellow-600'; // > 5 minutes
    return 'text-red-600'; // < 5 minutes
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (!examStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{exam.name}</CardTitle>
          <CardDescription>
            Duration: {exam.duration_minutes} minutes | Questions: {exam.total_questions} | Total Marks: {exam.total_marks}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Instructions:</strong><br />
              {exam.instructions}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">Duration</div>
              <div className="text-sm text-muted-foreground">{exam.duration_minutes} minutes</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">Questions</div>
              <div className="text-sm text-muted-foreground">{exam.total_questions} MCQ</div>
            </div>
          </div>

          <Button onClick={startExam} disabled={loading} className="w-full" size="lg">
            {loading ? "Starting Exam..." : "Start Exam"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Questions Available</h3>
          <p className="text-muted-foreground">This exam doesn't have any questions yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with timer and progress */}
      <div className="flex justify-between items-center p-4 border rounded-lg bg-card">
        <div>
          <h1 className="text-xl font-bold">{exam.name}</h1>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getTimeColor()}`}>
            <Timer className="inline h-5 w-5 mr-2" />
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-muted-foreground">Time Remaining</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{answeredCount}/{questions.length} answered</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Question {currentQuestion.question_number}
            </CardTitle>
            <Badge variant="outline">
              {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{currentQuestion.question_text}</p>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <div
                key={option.key}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === option.key
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => selectAnswer(currentQuestion.id, option.key)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  }`}>
                    {answers[currentQuestion.id] === option.key && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{option.key}.</span>
                  <span>{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button onClick={() => saveAnswers()}>
            <Flag className="h-4 w-4 mr-2" />
            Save Answers
          </Button>
          <Button 
            onClick={() => setShowSubmitDialog(true)}
            variant="destructive"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Exam
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Question navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 ${
                  answers[questions[index].id] ? 'bg-green-100 border-green-500' : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="text-destructive">
                  <br />Warning: You have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitExam} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
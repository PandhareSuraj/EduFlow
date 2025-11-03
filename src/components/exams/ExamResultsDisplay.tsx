import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Award, Clock, FileText, Download, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuestionResult {
  question_number: number;
  question_text: string;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  marks_obtained: number;
  total_marks: number;
  options: Array<{ key: string; text: string }>;
  explanation?: string;
}

interface ExamResult {
  session_id: string;
  exam_name: string;
  student_name: string;
  total_questions: number;
  answered_questions: number;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  start_time: string;
  submit_time: string;
  duration_taken: string;
  status: string;
}

interface ExamResultsDisplayProps {
  sessionId: string;
}

export function ExamResultsDisplay({ sessionId }: ExamResultsDisplayProps) {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeInfo, setCollegeInfo] = useState<{
    name: string;
    logo_url?: string;
    signature_url?: string;
    signature_title?: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Fetch exam session with related data
      const { data: sessionData, error: sessionError } = await supabase
        .from('student_exam_sessions')
        .select(`
          *,
          exams (name, total_marks, passing_marks),
          students (name)
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Fetch question results
      const { data: answersData, error: answersError } = await supabase
        .from('student_answers')
        .select(`
          *,
          mcq_questions (
            question_number,
            question_text,
            correct_answer,
            marks,
            options,
            explanation
          )
        `)
        .eq('session_id', sessionId)
        .order('mcq_questions.question_number');

      if (answersError) throw answersError;

      // Fetch college information
      const { data: collegeData } = await supabase
        .from('colleges')
        .select('name, logo_url, signature_url, signature_title')
        .eq('id', sessionData.college_id)
        .single();

      if (collegeData) {
        setCollegeInfo(collegeData);
      }

      // Calculate duration taken
      const startTime = new Date(sessionData.start_time);
      const submitTime = new Date(sessionData.submit_time || sessionData.end_time);
      const durationMs = submitTime.getTime() - startTime.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));
      const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000);

      const examResult: ExamResult = {
        session_id: sessionData.id,
        exam_name: sessionData.exams.name,
        student_name: sessionData.students.name,
        total_questions: sessionData.total_questions,
        answered_questions: sessionData.answered_questions,
        marks_obtained: sessionData.marks_obtained,
        total_marks: sessionData.total_marks,
        percentage: sessionData.percentage,
        grade: sessionData.grade,
        start_time: sessionData.start_time,
        submit_time: sessionData.submit_time,
        duration_taken: `${durationMinutes}m ${durationSeconds}s`,
        status: sessionData.status
      };

      const questions: QuestionResult[] = answersData.map(answer => ({
        question_number: answer.mcq_questions.question_number,
        question_text: answer.mcq_questions.question_text,
        selected_answer: answer.selected_answer,
        correct_answer: answer.mcq_questions.correct_answer,
        is_correct: answer.is_correct,
        marks_obtained: answer.marks_obtained,
        total_marks: answer.mcq_questions.marks,
        options: Array.isArray(answer.mcq_questions.options) ? answer.mcq_questions.options as Array<{ key: string; text: string }> : [],
        explanation: answer.mcq_questions.explanation
      }));

      setResult(examResult);
      setQuestionResults(questions);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'text-green-600';
      case 'B+': case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'timed_out': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const downloadCertificate = () => {
    if (!result) return;
    
    // This would integrate with your certificate generation system
    toast({
      title: "Certificate Downloaded",
      description: "Your certificate has been downloaded successfully",
    });
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading results...</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Results Not Found</h3>
          <p className="text-muted-foreground">Unable to load exam results.</p>
        </CardContent>
      </Card>
    );
  }

  const isPassed = result.percentage >= ((result.total_marks * 0.4) / result.total_marks) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {isPassed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl mb-2">{result.exam_name}</CardTitle>
          <CardDescription>Exam Results for {result.student_name}</CardDescription>
          <Badge className={getStatusColor(result.status)} variant="outline">
            {result.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{result.marks_obtained}</div>
              <div className="text-sm text-muted-foreground">Marks Obtained</div>
              <div className="text-xs text-muted-foreground">out of {result.total_marks}</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${getGradeColor(result.grade)}`}>
                {result.percentage}%
              </div>
              <div className="text-sm text-muted-foreground">Percentage</div>
              <div className="text-xs text-muted-foreground">Grade: {result.grade}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{result.answered_questions}</div>
              <div className="text-sm text-muted-foreground">Answered</div>
              <div className="text-xs text-muted-foreground">out of {result.total_questions}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{result.duration_taken}</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
              <div className="text-xs text-muted-foreground">
                {result.status === 'timed_out' ? 'Time limit reached' : 'Submitted early'}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-center space-x-4">
            <Progress value={result.percentage} className="flex-1 max-w-md" />
          </div>

          <div className="flex justify-center mt-6">
            {isPassed && (
              <Button onClick={downloadCertificate} className="mr-4">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            )}
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Download Detailed Report
            </Button>
          </div>

          {/* Signature and Verification */}
          {collegeInfo?.signature_url && (
            <>
              <Separator className="my-6" />
              <div className="flex justify-between items-end">
                <div className="text-sm text-muted-foreground">
                  <p>Result Date: {new Date(result.submit_time).toLocaleDateString('en-IN')}</p>
                  <p className="mt-1">
                    This is a computer-generated result. Signature may be digital.
                  </p>
                </div>
                <div className="text-center">
                  <img
                    src={collegeInfo.signature_url}
                    alt="Authorized Signature"
                    className="w-32 h-12 object-contain mx-auto mb-2"
                  />
                  <div className="border-t border-foreground/20 pt-1">
                    <p className="text-sm font-medium">
                      {collegeInfo.signature_title || 'Authorized Signature'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Question-wise Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question-wise Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of your performance on each question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questionResults.map((question) => (
            <div 
              key={question.question_number}
              className={`p-4 rounded-lg border ${
                question.is_correct ? 'border-green-500/20 bg-green-50/50' : 'border-red-500/20 bg-red-50/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {question.is_correct ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-1" />
                  )}
                  <div>
                    <h4 className="font-medium">Question {question.question_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      {question.marks_obtained}/{question.total_marks} marks
                    </p>
                  </div>
                </div>
                <Badge variant={question.is_correct ? "default" : "destructive"}>
                  {question.is_correct ? "Correct" : "Incorrect"}
                </Badge>
              </div>

              <p className="mb-4 font-medium">{question.question_text}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {question.options.map((option: any) => (
                  <div
                    key={option.key}
                    className={`p-2 rounded border text-sm ${
                      option.key === question.correct_answer
                        ? 'border-green-500 bg-green-100 text-green-800'
                        : option.key === question.selected_answer
                        ? 'border-red-500 bg-red-100 text-red-800'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{option.key}.</span> {option.text}
                    {option.key === question.correct_answer && (
                      <CheckCircle className="inline h-4 w-4 ml-2" />
                    )}
                    {option.key === question.selected_answer && option.key !== question.correct_answer && (
                      <XCircle className="inline h-4 w-4 ml-2" />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-sm">
                <span className="font-medium">Your Answer: </span>
                <span className={question.is_correct ? 'text-green-600' : 'text-red-600'}>
                  {question.selected_answer || 'Not answered'}
                </span>
                <span className="mx-2">|</span>
                <span className="font-medium">Correct Answer: </span>
                <span className="text-green-600">{question.correct_answer}</span>
              </div>

              {question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-blue-800">Explanation:</p>
                  <p className="text-sm text-blue-700">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {questionResults.filter(q => q.is_correct).length}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {questionResults.filter(q => !q.is_correct).length}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect Answers</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {result.total_questions - result.answered_questions}
              </div>
              <div className="text-sm text-muted-foreground">Unanswered</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
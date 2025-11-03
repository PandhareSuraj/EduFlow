import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Clock, Users, TrendingUp, Award, Eye, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReportGenerator } from "@/utils/reportGenerator";

interface ExamAnalyticsReportProps {
  examId: string;
}

interface StudentResult {
  student_id: string;
  roll_number: string;
  student_name: string;
  start_time: string;
  submit_time: string;
  duration_minutes: number;
  answered_questions: number;
  total_questions: number;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  status: string;
}

interface QuestionAnalytics {
  question_number: number;
  question_text: string;
  correct_count: number;
  total_attempts: number;
  success_rate: number;
  avg_time_spent: number;
}

interface ExamAnalytics {
  exam: {
    id: string;
    name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    total_marks: number;
    total_questions: number;
    duration_minutes: number;
  };
  summary: {
    total_appeared: number;
    total_completed: number;
    total_timed_out: number;
    completion_rate: number;
  };
  performance: {
    highest_score: number;
    lowest_score: number;
    average_score: number;
    average_percentage: number;
    pass_count: number;
    fail_count: number;
    pass_rate: number;
    grade_distribution: Array<{ grade: string; count: number; percentage: number }>;
  };
  time_stats: {
    avg_time_minutes: number;
    min_time_minutes: number;
    max_time_minutes: number;
  };
  student_results: StudentResult[];
  question_analytics: QuestionAnalytics[];
}

export function ExamAnalyticsReport({ examId }: ExamAnalyticsReportProps) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [examId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('id, name, exam_date, start_time, end_time, total_marks, total_questions, duration_minutes')
        .eq('id', examId)
        .single();

      if (examError) throw examError;

      // Fetch student sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('student_exam_sessions')
        .select(`
          student_id,
          start_time,
          submit_time,
          duration_minutes,
          answered_questions,
          total_questions,
          marks_obtained,
          total_marks,
          percentage,
          grade,
          status,
          students(id, student_id, name)
        `)
        .eq('exam_id', examId);

      if (sessionsError) throw sessionsError;

      const studentResults: StudentResult[] = (sessionsData || []).map((session: any) => ({
        student_id: session.students?.id || '',
        roll_number: session.students?.student_id || '',
        student_name: session.students?.name || '',
        start_time: session.start_time,
        submit_time: session.submit_time,
        duration_minutes: session.duration_minutes || 0,
        answered_questions: session.answered_questions || 0,
        total_questions: session.total_questions || 0,
        marks_obtained: session.marks_obtained || 0,
        total_marks: session.total_marks || 0,
        percentage: session.percentage || 0,
        grade: session.grade || 'F',
        status: session.status || 'completed'
      }));

      // Calculate summary stats
      const totalAppeared = studentResults.length;
      const totalCompleted = studentResults.filter(r => r.status === 'completed').length;
      const totalTimedOut = studentResults.filter(r => r.status === 'timed_out').length;

      // Calculate performance stats
      const scores = studentResults.map(r => r.marks_obtained);
      const percentages = studentResults.map(r => r.percentage);
      const passCount = studentResults.filter(r => r.percentage >= 40).length;
      const failCount = studentResults.filter(r => r.percentage < 40).length;

      // Grade distribution
      const gradeGroups: { [key: string]: number } = {};
      studentResults.forEach(r => {
        gradeGroups[r.grade] = (gradeGroups[r.grade] || 0) + 1;
      });

      const gradeDistribution = Object.entries(gradeGroups).map(([grade, count]) => ({
        grade,
        count,
        percentage: totalAppeared > 0 ? Math.round((count / totalAppeared) * 100) : 0
      })).sort((a, b) => {
        const gradeOrder = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
        return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
      });

      // Time stats
      const durations = studentResults.map(r => r.duration_minutes).filter(d => d > 0);
      const avgTime = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      const minTime = durations.length > 0 ? Math.min(...durations) : 0;
      const maxTime = durations.length > 0 ? Math.max(...durations) : 0;

      // Fetch question analytics for MCQ exams
      let questionAnalytics: QuestionAnalytics[] = [];
      const { data: questionsData } = await supabase
        .from('mcq_questions')
        .select(`
          id,
          question_number,
          question_text,
          student_answers(is_correct, time_spent_seconds)
        `)
        .eq('exam_id', examId)
        .order('question_number');

      if (questionsData) {
        questionAnalytics = questionsData.map((q: any) => {
          const answers = q.student_answers || [];
          const correctCount = answers.filter((a: any) => a.is_correct).length;
          const totalAttempts = answers.length;
          const successRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
          const avgTimeSpent = answers.length > 0 
            ? Math.round(answers.reduce((sum: number, a: any) => sum + (a.time_spent_seconds || 0), 0) / answers.length)
            : 0;

          return {
            question_number: q.question_number,
            question_text: q.question_text,
            correct_count: correctCount,
            total_attempts: totalAttempts,
            success_rate: successRate,
            avg_time_spent: avgTimeSpent
          };
        });
      }

      setAnalytics({
        exam: examData,
        summary: {
          total_appeared: totalAppeared,
          total_completed: totalCompleted,
          total_timed_out: totalTimedOut,
          completion_rate: totalAppeared > 0 ? Math.round((totalCompleted / totalAppeared) * 100) : 0
        },
        performance: {
          highest_score: scores.length > 0 ? Math.max(...scores) : 0,
          lowest_score: scores.length > 0 ? Math.min(...scores) : 0,
          average_score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          average_percentage: percentages.length > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0,
          pass_count: passCount,
          fail_count: failCount,
          pass_rate: totalAppeared > 0 ? Math.round((passCount / totalAppeared) * 100) : 0,
          grade_distribution: gradeDistribution
        },
        time_stats: {
          avg_time_minutes: Math.round(avgTime),
          min_time_minutes: Math.round(minTime),
          max_time_minutes: Math.round(maxTime)
        },
        student_results: studentResults.sort((a, b) => b.percentage - a.percentage),
        question_analytics: questionAnalytics
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load exam analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!analytics) return;

    const reportConfig = {
      title: `Detailed Exam Analytics - ${analytics.exam.name}`,
      type: 'academic' as const,
      data: analytics.student_results.map(r => ({
        roll_number: r.roll_number,
        student_name: r.student_name,
        time_taken: `${r.duration_minutes} min`,
        answered: `${r.answered_questions}/${r.total_questions}`,
        marks: `${r.marks_obtained}/${r.total_marks}`,
        percentage: r.percentage,
        grade: r.grade,
        status: r.status
      })),
      columns: [
        { key: 'roll_number', label: 'Student ID' },
        { key: 'student_name', label: 'Name' },
        { key: 'time_taken', label: 'Time Taken' },
        { key: 'answered', label: 'Answered' },
        { key: 'marks', label: 'Marks' },
        { key: 'percentage', label: 'Percentage', formatter: (value: number) => `${value}%` },
        { key: 'grade', label: 'Grade' },
        { key: 'status', label: 'Status' }
      ],
      summary: {
        totalRecords: analytics.student_results.length,
        additionalInfo: {
          'Total Appeared': analytics.summary.total_appeared,
          'Pass Rate': `${analytics.performance.pass_rate}%`,
          'Average Score': `${analytics.performance.average_score}/${analytics.exam.total_marks}`,
          'Average Time': `${analytics.time_stats.avg_time_minutes} minutes`,
          'Completion Rate': `${analytics.summary.completion_rate}%`
        }
      }
    };

    ReportGenerator.generatePDF(reportConfig);
    toast({
      title: "Success",
      description: "Analytics report exported successfully"
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '-';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No analytics data available</p>
        <p className="text-sm text-muted-foreground">This exam may not have any student submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{analytics.exam.name}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(analytics.exam.exam_date).toLocaleDateString('en-IN')}
                </span>
                {analytics.exam.start_time && analytics.exam.end_time && (
                  <span>
                    {formatTime(analytics.exam.start_time)} - {formatTime(analytics.exam.end_time)}
                  </span>
                )}
                {analytics.exam.duration_minutes && (
                  <Badge variant="secondary">{analytics.exam.duration_minutes} min</Badge>
                )}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.total_appeared}</div>
            <p className="text-xs text-muted-foreground">Students Appeared</p>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Award className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.pass_rate}%</div>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
            <Progress value={analytics.performance.pass_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance.average_percentage}%</div>
            <p className="text-xs text-muted-foreground">Average Score</p>
            <div className="text-sm text-muted-foreground mt-1">
              {analytics.performance.average_score}/{analytics.exam.total_marks} marks
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(analytics.time_stats.avg_time_minutes)}</div>
            <p className="text-xs text-muted-foreground">Average Time Taken</p>
            <div className="text-sm text-muted-foreground mt-1">
              Range: {formatDuration(analytics.time_stats.min_time_minutes)} - {formatDuration(analytics.time_stats.max_time_minutes)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Grade distribution and pass/fail statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.performance.pass_count}</div>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.performance.fail_count}</div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.performance.highest_score}</div>
              <p className="text-sm text-muted-foreground">Highest Score</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analytics.performance.lowest_score}</div>
              <p className="text-sm text-muted-foreground">Lowest Score</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Grade Distribution</h4>
            {analytics.performance.grade_distribution.map(({ grade, count, percentage }) => (
              <div key={grade} className="flex items-center gap-4">
                <Badge variant="outline" className="w-12 justify-center">{grade}</Badge>
                <Progress value={percentage} className="flex-1" />
                <span className="text-sm text-muted-foreground w-24 text-right">
                  {count} ({percentage}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student-wise Results */}
      <Card>
        <CardHeader>
          <CardTitle>Student-wise Detailed Results</CardTitle>
          <CardDescription>{analytics.summary.total_appeared} students appeared for this exam</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Submit Time</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Answered</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.student_results.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell className="font-medium">{student.roll_number}</TableCell>
                    <TableCell>{student.student_name}</TableCell>
                    <TableCell className="text-sm">{formatTime(student.start_time)}</TableCell>
                    <TableCell className="text-sm">{formatTime(student.submit_time)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatDuration(student.duration_minutes)}</Badge>
                    </TableCell>
                    <TableCell>
                      {student.answered_questions}/{student.total_questions}
                    </TableCell>
                    <TableCell>
                      {student.marks_obtained}/{student.total_marks}
                    </TableCell>
                    <TableCell className="font-semibold">{student.percentage}%</TableCell>
                    <TableCell>
                      <Badge variant={student.percentage >= 40 ? "default" : "destructive"}>
                        {student.grade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'completed' ? 'default' : 'destructive'}>
                        {student.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Question-wise Analytics */}
      {analytics.question_analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question-wise Analysis</CardTitle>
            <CardDescription>Difficulty analysis based on student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Q.No</TableHead>
                  <TableHead className="max-w-md">Question</TableHead>
                  <TableHead>Correct Answers</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Difficulty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.question_analytics.map((q) => (
                  <TableRow key={q.question_number}>
                    <TableCell className="font-medium">{q.question_number}</TableCell>
                    <TableCell className="max-w-md truncate">{q.question_text}</TableCell>
                    <TableCell>{q.correct_count}/{q.total_attempts}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={q.success_rate} className="w-20" />
                        <span className="text-sm">{q.success_rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{q.avg_time_spent}s</TableCell>
                    <TableCell>
                      <Badge variant={
                        q.success_rate > 70 ? 'default' :
                        q.success_rate > 40 ? 'secondary' : 'destructive'
                      }>
                        {q.success_rate > 70 ? 'Easy' : 
                         q.success_rate > 40 ? 'Medium' : 'Hard'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

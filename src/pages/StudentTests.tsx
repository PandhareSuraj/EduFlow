import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Play, CheckCircle, AlertCircle, Loader2, Timer, FileText } from "lucide-react";
import { StudentExamInterface } from "@/components/exams/StudentExamInterface";
import { ExamResultsDisplay } from "@/components/exams/ExamResultsDisplay";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/permissions/RoleGuard";
import { getExamStatus, formatISTDate } from "@/utils/dateUtils";

interface MCQTest {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalQuestions: number;
  status: 'available' | 'completed' | 'upcoming' | 'expired';
  score?: number;
  completedAt?: string;
  description: string;
  startTime?: string;
  endTime?: string;
  passingMarks?: number;
}

export default function StudentTests() {
  const [tests, setTests] = useState<MCQTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [showResults, setShowResults] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExamsAndStudent();
  }, []);

  const fetchExamsAndStudent = async () => {
    setLoading(true);
    try {
      // Get current user's email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.error('No authenticated user found');
        toast({
          title: "Authentication Error",
          description: "Please log in as a student to view your tests.",
          variant: "destructive"
        });
        setMockTests();
        return;
      }

      console.log('Looking for student with email:', user.email);

      // Fetch student data first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, course_id, name, email')
        .eq('email', user.email)
        .single();

      if (studentError || !studentData) {
        console.error('Error fetching student data:', { studentError, userEmail: user.email });
        toast({
          title: "Student Record Not Found",
          description: "No student record found for your account. Please contact administration.",
          variant: "destructive"
        });
        setMockTests();
        return;
      }

      console.log('Student data found:', { id: studentData.id, course_id: studentData.course_id, name: studentData.name });
      setStudentId(studentData.id);

      // Fetch all MCQ exams for the student's course (including completed and expired)
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select(`
          id,
          name,
          description,
          exam_type,
          start_time,
          end_time,
          duration_minutes,
          total_questions,
          passing_marks,
          status,
          course_id
        `)
        .eq('course_id', studentData.course_id)
        .eq('exam_type', 'mcq')
        .order('start_time', { ascending: false });

      console.log('Exams query result:', { examsData, examsError, course_id: studentData.course_id });

      if (examsError) {
        console.error('Error fetching exams:', examsError);
        toast({
          title: "Database Error",
          description: `Failed to fetch exams: ${examsError.message}`,
          variant: "destructive"
        });
        setMockTests();
        return;
      }

      console.log(`Found ${examsData?.length || 0} exams for course ${studentData.course_id}`);

      // Check for existing exam sessions
      const { data: sessionsData } = await supabase
        .from('student_exam_sessions')
        .select('exam_id, status, percentage, grade, marks_obtained, total_marks')
        .eq('student_id', studentData.id);

      const sessionMap = new Map(sessionsData?.map(s => [s.exam_id, s]) || []);

      // Transform exams to MCQTest format
      const transformedTests: MCQTest[] = examsData?.map(exam => {
        const session = sessionMap.get(exam.id);
        
        // Use IST-aware status determination
        const testStatus = getExamStatus(
          exam.start_time || '', 
          exam.end_time || '', 
          session?.status === 'completed'
        );

        return {
          id: exam.id,
          title: exam.name,
          subject: 'General', // Removed invalid subjects join
          duration: exam.duration_minutes || 60,
          totalQuestions: exam.total_questions || 30,
          status: testStatus,
          score: session?.percentage || undefined,
          completedAt: session?.status === 'completed' ? formatISTDate(new Date()) : undefined,
          description: exam.description || 'MCQ Examination',
          startTime: exam.start_time,
          endTime: exam.end_time,
          passingMarks: exam.passing_marks
        };
      }) || [];

      setTests(transformedTests);
      
      if (transformedTests.length === 0) {
        toast({
          title: "No Exams Found",
          description: "No MCQ exams are currently available for your course. Contact your instructor for more information.",
        });
      }
    } catch (error) {
      console.error('Error in fetchExamsAndStudent:', error);
      setMockTests();
    } finally {
      setLoading(false);
    }
  };

  const setMockTests = () => {
    setTests([
      {
        id: '1',
        title: 'Basic Anatomy Quiz',
        subject: 'Anatomy',
        duration: 30,
        totalQuestions: 20,
        status: 'available',
        description: 'Test your knowledge of basic human anatomy'
      },
      {
        id: '2',
        title: 'Physiology Fundamentals',
        subject: 'Physiology',
        duration: 45,
        totalQuestions: 30,
        status: 'completed',
        score: 85,
        completedAt: '2024-01-15',
        description: 'Comprehensive test on physiological processes'
      },
      {
        id: '3',
        title: 'Medical Terminology',
        subject: 'Medical Terms',
        duration: 25,
        totalQuestions: 25,
        status: 'completed',
        score: 92,
        completedAt: '2024-01-10',
        description: 'Essential medical terminology and definitions'
      },
      {
        id: '4',
        title: 'Pathology Basics',
        subject: 'Pathology',
        duration: 40,
        totalQuestions: 35,
        status: 'upcoming',
        description: 'Introduction to pathological conditions'
      },
      {
        id: '5',
        title: 'Laboratory Procedures',
        subject: 'Lab Procedures',
        duration: 50,
        totalQuestions: 40,
        status: 'available',
        description: 'Standard laboratory procedures and safety protocols'
      }
    ]);
  };

  const getStatusBadge = (status: MCQTest['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="default">Available</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: MCQTest['status']) => {
    switch (status) {
      case 'available':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStartTest = async (testId: string) => {
    console.log('Starting test:', { testId, studentId });
    
    if (!studentId) {
      toast({
        title: "Error",
        description: "Student data not found. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if exam exists and student can access it
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', testId)
        .single();
      
      if (examError) {
        console.error('Error fetching exam:', examError);
        toast({
          title: "Error",
          description: "Failed to load exam details.",
          variant: "destructive"
        });
        return;
      }
      
      if (exam) {
        console.log('Exam found, starting interface:', exam.name);
        setCurrentExam({ ...exam, studentId: studentId });
      } else {
        toast({
          title: "Demo Mode",
          description: "This is a demo test. Real MCQ functionality requires actual exam data.",
        });
      }
    } catch (error: any) {
      console.error('Error starting test:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start exam",
        variant: "destructive"
      });
    }
  };

  const handleViewResults = (testId: string) => {
    // For mock data, show placeholder
    toast({
      title: "Demo Mode",
      description: "Detailed results view will show actual exam results when available.",
    });
  };

  const handleRefreshTests = () => {
    fetchExamsAndStudent();
  };

  const completedTests = tests.filter(test => test.status === 'completed');
  const availableTests = tests.filter(test => test.status === 'available');
  const upcomingTests = tests.filter(test => test.status === 'upcoming');
  const expiredTests = tests.filter(test => test.status === 'expired');

  const averageScore = completedTests.length > 0 
    ? Math.round(completedTests.reduce((sum, test) => sum + (test.score || 0), 0) / completedTests.length)
    : 0;

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowResults(null)}>
            ← Back to Tests
          </Button>
        </div>
        <ExamResultsDisplay sessionId={showResults} />
      </div>
    );
  }

  if (currentExam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setCurrentExam(null)}>
            ← Back to Tests
          </Button>
        </div>
        <StudentExamInterface 
          exam={currentExam}
          studentId={currentExam.studentId}
          onExamComplete={(sessionId) => {
            setCurrentExam(null);
            setShowResults(sessionId);
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MCQ Tests
          </h1>
          <p className="text-muted-foreground mt-2">
            Practice tests and assessments for your course • Track your progress and improve your skills
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshTests} className="gap-2">
          <BookOpen className="h-4 w-4" />
          Refresh Tests
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Tests</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{tests.length}</div>
            <p className="text-xs text-blue-600">Available in course</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{completedTests.length}</div>
            <p className="text-xs text-emerald-600">Tests finished</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Available</CardTitle>
            <Play className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{availableTests.length}</div>
            <p className="text-xs text-amber-600">Ready to take</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Missed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{expiredTests.length}</div>
            <p className="text-xs text-red-600">Expired tests</p>
          </CardContent>
        </Card>
      </div>

      {/* Average Score Card */}
      {completedTests.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Clock className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}%
                </div>
                <p className="text-sm text-purple-600">Average Score</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Based on {completedTests.length} completed test{completedTests.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tests */}
      {availableTests.length > 0 && (
        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Play className="h-6 w-6" />
              Available Tests
            </CardTitle>
            <CardDescription>Tests you can take right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availableTests.map((test) => (
                <div key={test.id} className="border rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-50/50 to-emerald-50/50 hover:from-green-100/50 hover:to-emerald-100/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        {getStatusIcon(test.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                        <p className="text-sm text-gray-600">{test.subject}</p>
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{test.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4" />
                        {test.duration} min
                      </span>
                      <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                        <BookOpen className="h-4 w-4" />
                        {test.totalQuestions} questions
                      </span>
                      {test.passingMarks && (
                        <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                          Pass: {test.passingMarks}%
                        </span>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleStartTest(test.id)}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Tests */}
      {completedTests.length > 0 && (
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <CheckCircle className="h-6 w-6" />
              Test History
            </CardTitle>
            <CardDescription>Your completed tests and performance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {completedTests.map((test) => (
                <div key={test.id} className="border rounded-xl p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        {getStatusIcon(test.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                        <p className="text-sm text-gray-600">{test.subject}</p>
                        {test.completedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed on {test.completedAt}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(test.status)}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(test.score || 0)}`}>
                          {test.score}%
                        </div>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{test.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                        <Clock className="h-4 w-4" />
                        {test.duration} min
                      </span>
                      <span className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full">
                        <BookOpen className="h-4 w-4" />
                        {test.totalQuestions} questions
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (test.score || 0) >= 80 ? 'bg-green-100 text-green-700' :
                        (test.score || 0) >= 60 ? 'bg-blue-100 text-blue-700' :
                        (test.score || 0) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(test.score || 0) >= (test.passingMarks || 50) ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewResults(test.id)}
                      className="hover:bg-blue-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tests */}
      {upcomingTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-600" />
              Upcoming Tests
            </CardTitle>
            <CardDescription>Tests scheduled for later - watch the countdown!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {upcomingTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-6 bg-gradient-to-r from-background to-muted/30">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Test Info Section */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h3 className="text-lg font-semibold">{test.title}</h3>
                            <p className="text-sm text-muted-foreground">{test.subject}</p>
                          </div>
                        </div>
                        {getStatusBadge(test.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {test.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {test.totalQuestions} questions
                        </span>
                        {test.passingMarks && (
                          <span>Passing: {test.passingMarks}%</span>
                        )}
                      </div>

                      {/* Start Time Display */}
                      {test.startTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Starts:</span>
                          <span className="font-medium">
                            {formatISTDate(test.startTime, 'MMM d, yyyy \'at\' h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Countdown Timer Section */}
                    <div className="lg:w-80">
                      {test.startTime ? (
                        <CountdownTimer
                          targetDate={test.startTime}
                          onExpire={handleRefreshTests}
                          urgencyThreshold={24}
                          size="md"
                          className="bg-card border rounded-lg p-4"
                        />
                      ) : (
                        <div className="bg-card border rounded-lg p-4 text-center">
                          <div className="text-muted-foreground text-sm">
                            Start time not set
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired/Missed Tests */}
      {expiredTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Missed Tests
            </CardTitle>
            <CardDescription>Tests that have expired or were missed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {expiredTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-50/30 to-orange-50/30 opacity-75">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold text-muted-foreground">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">{test.subject}</p>
                        {test.endTime && (
                          <p className="text-xs text-red-600">
                            Expired on {formatISTDate(test.endTime, 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {test.totalQuestions} questions
                      </span>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Expired
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {tests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Tests Available</h3>
            <p className="text-muted-foreground">MCQ tests will appear here once they are created for your course.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
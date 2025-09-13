import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { StudentExamInterface } from "@/components/exams/StudentExamInterface";
import { ExamResultsDisplay } from "@/components/exams/ExamResultsDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/permissions/RoleGuard";

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
        setMockTests();
        return;
      }

      // Fetch student data first
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, course_id, name')
        .eq('email', user.email)
        .single();

      if (studentError || !studentData) {
        console.error('Error fetching student data:', studentError);
        setMockTests();
        return;
      }

      // Fetch live MCQ exams for the student's course
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
          subjects(name)
        `)
        .eq('course_id', studentData.course_id)
        .eq('exam_type', 'mcq')
        .in('status', ['scheduled', 'active'])
        .order('start_time', { ascending: true });

      if (examsError) {
        console.error('Error fetching exams:', examsError);
        setMockTests();
        return;
      }

      // Check for existing exam sessions
      const { data: sessionsData } = await supabase
        .from('student_exam_sessions')
        .select('exam_id, status, percentage, grade, marks_obtained, total_marks')
        .eq('student_id', studentData.id);

      const sessionMap = new Map(sessionsData?.map(s => [s.exam_id, s]) || []);

      // Transform exams to MCQTest format
      const transformedTests: MCQTest[] = examsData?.map(exam => {
        const session = sessionMap.get(exam.id);
        const now = new Date();
        const startTime = new Date(exam.start_time || '');
        const endTime = new Date(exam.end_time || '');
        
        let testStatus: 'available' | 'completed' | 'upcoming' | 'expired' = 'upcoming';
        
        if (session?.status === 'completed') {
          testStatus = 'completed';
        } else if (now >= startTime && now <= endTime) {
          testStatus = 'available';
        } else if (now > endTime) {
          testStatus = 'expired';
        }

        return {
          id: exam.id,
          title: exam.name,
          subject: exam.subjects?.[0]?.name || 'General',
          duration: exam.duration_minutes || 60,
          totalQuestions: exam.total_questions || 30,
          status: testStatus,
          score: session?.percentage || undefined,
          completedAt: session?.status === 'completed' ? new Date().toISOString() : undefined,
          description: exam.description || 'MCQ Examination',
          startTime: exam.start_time,
          endTime: exam.end_time,
          passingMarks: exam.passing_marks
        };
      }) || [];

      setTests(transformedTests);
      setStudentId(studentData.id);
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
      case 'in_progress':
        return <Badge variant="outline">In Progress</Badge>;
      case 'locked':
        return <Badge variant="destructive">Locked</Badge>;
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
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'locked':
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
    if (!studentData) {
      toast({
        title: "Error",
        description: "Student data not found. Please log in as a student.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: exam } = await supabase
        .from('exams')
        .select('*')
        .eq('id', testId)
        .single();
      
      if (exam) {
        setCurrentExam({ ...exam, studentId: studentData.id });
      } else {
        // For mock tests, show alert
        toast({
          title: "Demo Mode",
          description: "This is a demo test. Real MCQ functionality requires actual exam data.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start exam",
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

  const completedTests = tests.filter(test => test.status === 'completed');
  const availableTests = tests.filter(test => test.status === 'available');
  const lockedTests = tests.filter(test => test.status === 'locked');

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCQ Tests</h1>
          <p className="text-muted-foreground">Practice tests and assessments for your course</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
            <p className="text-xs text-muted-foreground">Available in course</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTests.length}</div>
            <p className="text-xs text-muted-foreground">Tests completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{availableTests.length}</div>
            <p className="text-xs text-muted-foreground">Ready to take</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore > 0 ? `${averageScore}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Tests */}
      {availableTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Available Tests
            </CardTitle>
            <CardDescription>Tests you can take now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availableTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">{test.subject}</p>
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
                    <Button onClick={() => handleStartTest(test.id)}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Completed Tests
            </CardTitle>
            <CardDescription>Your test history and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {completedTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">{test.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(test.status)}
                      <Badge className={`${getScoreColor(test.score || 0)} bg-opacity-10`}>
                        {test.score}%
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Completed: {test.completedAt && new Date(test.completedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {test.totalQuestions} questions
                      </span>
                    </div>
                    <Button variant="outline" onClick={() => handleViewResults(test.id)}>
                      View Results
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locked Tests */}
      {lockedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Upcoming Tests
            </CardTitle>
            <CardDescription>Tests that will be available later</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {lockedTests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">{test.subject}</p>
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
                    <p className="text-sm text-muted-foreground">Available after completing prerequisites</p>
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
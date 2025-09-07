import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { StudentExamInterface } from "@/components/exams/StudentExamInterface";
import { ExamResultsDisplay } from "@/components/exams/ExamResultsDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MCQTest {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalQuestions: number;
  status: 'available' | 'completed' | 'in_progress' | 'locked';
  score?: number;
  completedAt?: string;
  description: string;
}

export default function StudentTests() {
  const [tests, setTests] = useState<MCQTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [showResults, setShowResults] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExamsAndStudent();
  }, []);

  const fetchExamsAndStudent = async () => {
    try {
      // Get current student data
      const { data: student } = await supabase
        .rpc('get_student_data')
        .single();
      
      if (student) {
        setStudentData(student);
        
        // Fetch available MCQ exams
        const { data: exams } = await supabase
          .from('exams')
          .select('*')
          .eq('exam_type', 'mcq')
          .eq('status', 'scheduled');

        if (exams) {
          const formattedTests = exams.map(exam => ({
            id: exam.id,
            title: exam.name,
            subject: 'MCQ Test',
            duration: exam.duration_minutes,
            totalQuestions: exam.total_questions,
            status: 'available' as const,
            description: exam.description || 'Multiple choice examination'
          }));
          setTests(formattedTests);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Keep existing mock data as fallback
  const mockTests = [
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
      status: 'locked',
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
        description: "Student data not found",
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
    // In real app, this would show detailed results
    console.log('Viewing results for test:', testId);
    alert('Detailed results view will be implemented soon!');
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
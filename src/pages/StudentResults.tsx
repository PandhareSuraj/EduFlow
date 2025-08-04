import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Award, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ResultData {
  exam_name: string;
  subject_name: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  exam_date: string;
}

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<ResultData[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalExams: 0,
    averagePercentage: 0,
    passedExams: 0,
    failedExams: 0
  });

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      // Get student data first to get student_id
      const { data: studentInfo, error: studentError } = await supabase.rpc('get_student_data');
      
      if (studentError || !studentInfo || studentInfo.length === 0) {
        console.error('Error fetching student data:', studentError);
        setLoading(false);
        return;
      }

      const studentId = studentInfo[0].id;

      // Get results with exam and subject details
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select(`
          marks_obtained,
          total_marks,
          percentage,
          grade,
          exams!inner(name, exam_date),
          subjects!inner(name)
        `)
        .eq('student_id', studentId);

      if (resultsError) {
        console.error('Error fetching results:', resultsError);
        setLoading(false);
        return;
      }

      // Transform the data
      const transformedResults: ResultData[] = (resultsData || []).map((result: any) => ({
        exam_name: result.exams.name,
        subject_name: result.subjects.name,
        marks_obtained: result.marks_obtained,
        total_marks: result.total_marks,
        percentage: result.percentage,
        grade: result.grade,
        exam_date: result.exams.exam_date
      }));

      setResults(transformedResults);

      // Calculate overall statistics
      if (transformedResults.length > 0) {
        const totalPercentage = transformedResults.reduce((sum, result) => sum + result.percentage, 0);
        const averagePercentage = totalPercentage / transformedResults.length;
        const passedExams = transformedResults.filter(result => result.percentage >= 40).length;
        const failedExams = transformedResults.length - passedExams;

        setOverallStats({
          totalExams: transformedResults.length,
          averagePercentage: Math.round(averagePercentage * 100) / 100,
          passedExams,
          failedExams
        });
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'A+': case 'A': return 'bg-green-100 text-green-800';
      case 'B+': case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Results</h1>
          <p className="text-muted-foreground">View your exam results and academic performance</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalExams}</div>
            <p className="text-xs text-muted-foreground">Exams completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{overallStats.averagePercentage}%</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.passedExams}</div>
            <p className="text-xs text-muted-foreground">Exams passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.failedExams}</div>
            <p className="text-xs text-muted-foreground">Exams failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
          <CardDescription>Your overall academic progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Performance</span>
                <span className="text-sm text-muted-foreground">{overallStats.averagePercentage}%</span>
              </div>
              <Progress value={overallStats.averagePercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{overallStats.passedExams}</p>
                <p className="text-sm text-green-600">Passed Exams</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{overallStats.failedExams}</p>
                <p className="text-sm text-red-600">Failed Exams</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Results</CardTitle>
          <CardDescription>
            {results.length > 0 ? 'Detailed results for all your exams' : 'No exam results available yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{result.exam_name}</h3>
                      <p className="text-sm text-muted-foreground">{result.subject_name}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getGradeColor(result.grade)}>
                        Grade: {result.grade || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{result.marks_obtained}</p>
                      <p className="text-xs text-muted-foreground">Marks Obtained</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{result.total_marks}</p>
                      <p className="text-xs text-muted-foreground">Total Marks</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${getPercentageColor(result.percentage)}`}>
                        {result.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">Percentage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{new Date(result.exam_date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">Exam Date</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        result.percentage >= 80 ? 'bg-green-600' :
                        result.percentage >= 60 ? 'bg-blue-600' :
                        result.percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(result.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Results Available</h3>
              <p className="text-muted-foreground">Your exam results will appear here once they are published.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
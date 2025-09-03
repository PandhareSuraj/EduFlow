import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, FileText, Award, Download, Clock, Users, BookOpen, TrendingUp, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { ScheduleExamDialog, ViewExamsDialog } from "@/components/forms/ExamDialogs";
import { ViewResultsDialog } from "@/components/forms/ResultDialogs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LiveExamManagement } from "@/components/exams/LiveExamManagement";

// Data interfaces
interface Exam {
  id: string;
  name: string;
  course_id: number;
  exam_date: string;
  total_marks: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  courses?: { name: string; code: string };
}

interface Result {
  id: string;
  student_id: number;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  students?: { name: string; student_id: string };
  exams?: { name: string };
  courses?: { name: string };
}

interface Course {
  id: number;
  name: string;
  code: string;
}

export default function Exams() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultsSearchTerm, setResultsSearchTerm] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');

      if (coursesError) throw coursesError;

      // Fetch exams separately
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('id, name, course_id, exam_date, total_marks, status')
        .order('exam_date', { ascending: false });

      if (examsError) throw examsError;

      setCourses(coursesData || []);
      
      // Map exams with course data
      const mappedExams = (examsData || []).map(exam => ({
        ...exam,
        status: exam.status as 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
        courses: coursesData?.find(c => c.id === exam.course_id)
      }));
      
      setExams(mappedExams);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load exam data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setResultsLoading(true);
    try {
      // Fetch results separately
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('id, student_id, exam_id, marks_obtained, total_marks, percentage, grade')
        .order('created_at', { ascending: false });

      if (resultsError) throw resultsError;

      if (!resultsData || resultsData.length === 0) {
        setResults([]);
        setResultsLoading(false);
        return;
      }

      // Get unique IDs for related data
      const studentIds = [...new Set(resultsData.map(r => r.student_id))];
      const examIds = [...new Set(resultsData.map(r => r.exam_id))];

      // Fetch related data
      const [studentsData, examsData] = await Promise.all([
        supabase
          .from('students')
          .select('id, name, student_id')
          .in('id', studentIds),
        supabase
          .from('exams')
          .select('id, name, course_id')
          .in('id', examIds)
      ]);

      if (studentsData.error) throw studentsData.error;
      if (examsData.error) throw examsData.error;

      // Get course IDs from exams
      const courseIds = [...new Set((examsData.data || []).map(e => e.course_id))];
      
      // Fetch course data
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name, code')
        .in('id', courseIds);

      // Map all data together
      const mappedResults = resultsData.map(result => ({
        ...result,
        students: studentsData.data?.find(s => s.id === result.student_id),
        exams: examsData.data?.find(e => e.id === result.exam_id),
        courses: coursesData?.find(c => c.id === examsData.data?.find(e => e.id === result.exam_id)?.course_id)
      }));

      setResults(mappedResults);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast({
        title: "Error",
        description: "Failed to load results data",
        variant: "destructive",
      });
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchResults();
  }, []);

  // Enhanced exam statistics
  const examStats = {
    totalExams: exams.length,
    scheduledExams: exams.filter(e => e.status === 'scheduled').length,
    completedExams: exams.filter(e => e.status === 'completed').length,
    upcomingExams: exams.filter(e => new Date(e.exam_date) > new Date()).length,
    passRate: results.length > 0 ? Math.round((results.filter(r => r.percentage >= 40).length / results.length) * 100) : 0
  };

  // Filter exams based on search and status
  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.courses?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter results based on search
  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.students?.name.toLowerCase().includes(resultsSearchTerm.toLowerCase()) ||
      result.students?.student_id.toLowerCase().includes(resultsSearchTerm.toLowerCase()) ||
      result.exams?.name.toLowerCase().includes(resultsSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Export results functionality
  const handleExportResults = () => {
    try {
      if (filteredResults.length === 0) {
        toast({
          title: "No Data",
          description: "No results available to export",
          variant: "destructive",
        });
        return;
      }

      const reportConfig = {
        title: 'Exam Results Report',
        type: 'academic' as const,
        data: filteredResults.map(result => ({
          student_id: result.students?.student_id,
          student_name: result.students?.name,
          exam_name: result.exams?.name,
          course_name: result.courses?.name,
          marks_obtained: result.marks_obtained,
          total_marks: result.total_marks,
          percentage: result.percentage,
          grade: result.grade,
          status: result.percentage >= 40 ? 'Pass' : 'Fail'
        })),
        columns: [
          { key: 'student_id', label: 'Student ID' },
          { key: 'student_name', label: 'Student Name' },
          { key: 'exam_name', label: 'Exam' },
          { key: 'course_name', label: 'Course' },
          { key: 'marks_obtained', label: 'Marks Obtained' },
          { key: 'total_marks', label: 'Total Marks' },
          { key: 'percentage', label: 'Percentage', formatter: (value: number) => `${value}%` },
          { key: 'grade', label: 'Grade' },
          { key: 'status', label: 'Status' }
        ],
        filters: { searchTerm: resultsSearchTerm },
        summary: {
          totalRecords: filteredResults.length,
          additionalInfo: {
            'Pass Rate': `${examStats.passRate}%`,
            'Total Pass': filteredResults.filter(r => r.percentage >= 40).length,
            'Total Fail': filteredResults.filter(r => r.percentage < 40).length
          }
        }
      };

      ReportGenerator.generatePDF(reportConfig);
      
      toast({
        title: "Export Successful",
        description: "Results exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results",
        variant: "destructive",
      });
    }
  };

  // Generate marksheet
  const handleGenerateMarksheet = (result: Result) => {
    try {
      const marksheetData = [{
        student_id: result.students?.student_id,
        student_name: result.students?.name,
        exam_name: result.exams?.name,
        marks_obtained: result.marks_obtained,
        total_marks: result.total_marks,
        percentage: result.percentage,
        grade: result.grade,
        result: result.percentage >= 40 ? 'PASS' : 'FAIL'
      }];

      const reportConfig = {
        title: `Marksheet - ${result.students?.name}`,
        type: 'academic' as const,
        data: marksheetData,
        columns: [
          { key: 'student_id', label: 'Student ID' },
          { key: 'student_name', label: 'Student Name' },
          { key: 'exam_name', label: 'Examination' },
          { key: 'marks_obtained', label: 'Marks Obtained' },
          { key: 'total_marks', label: 'Total Marks' },
          { key: 'percentage', label: 'Percentage', formatter: (value: number) => `${value}%` },
          { key: 'grade', label: 'Grade' },
          { key: 'result', label: 'Result' }
        ],
        summary: {
          totalRecords: 1,
          additionalInfo: {
            'Grade': result.grade,
            'Result': result.percentage >= 40 ? 'PASS' : 'FAIL'
          }
        }
      };

      ReportGenerator.generatePDF(reportConfig);
      
      toast({
        title: "Marksheet Generated",
        description: `Marksheet generated for ${result.students?.name}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate marksheet",
        variant: "destructive",
      });
    }
  };

  // Generate certificate
  const handleGenerateCertificate = (result: Result) => {
    if (result.percentage < 40) {
      toast({
        title: "Certificate Not Available",
        description: "Certificate can only be generated for passed students",
        variant: "destructive",
      });
      return;
    }

    try {
      const certificateData = [{
        student_name: result.students?.name,
        exam_name: result.exams?.name,
        grade: result.grade,
        percentage: result.percentage,
        date_issued: new Date().toLocaleDateString()
      }];

      const reportConfig = {
        title: `Certificate of Achievement - ${result.students?.name}`,
        type: 'academic' as const,
        data: certificateData,
        columns: [
          { key: 'student_name', label: 'Student Name' },
          { key: 'exam_name', label: 'Examination' },
          { key: 'grade', label: 'Grade Achieved' },
          { key: 'percentage', label: 'Percentage', formatter: (value: number) => `${value}%` },
          { key: 'date_issued', label: 'Date Issued' }
        ],
        summary: {
          totalRecords: 1,
          additionalInfo: {
            'Achievement': `Successfully completed with ${result.grade} grade`,
            'Performance': `${result.percentage}% marks obtained`
          }
        }
      };

      ReportGenerator.generatePDF(reportConfig);
      
      toast({
        title: "Certificate Generated",
        description: `Certificate generated for ${result.students?.name}`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
    }
  };

  // Handle bulk certificate generation
  const handleBulkCertificateGeneration = (type: string) => {
    const passedResults = results.filter(r => r.percentage >= 40);
    
    if (passedResults.length === 0) {
      toast({
        title: "No Eligible Students",
        description: "No students are eligible for certificates",
        variant: "destructive",
      });
      return;
    }

    try {
      const certificateData = passedResults.map(result => ({
        student_name: result.students?.name,
        student_id: result.students?.student_id,
        exam_name: result.exams?.name,
        grade: result.grade,
        percentage: result.percentage,
        status: 'Eligible for Certificate'
      }));

      const reportConfig = {
        title: `${type} - Batch Certificate Generation`,
        type: 'academic' as const,
        data: certificateData,
        columns: [
          { key: 'student_name', label: 'Student Name' },
          { key: 'student_id', label: 'Student ID' },
          { key: 'exam_name', label: 'Examination' },
          { key: 'grade', label: 'Grade' },
          { key: 'percentage', label: 'Percentage', formatter: (value: number) => `${value}%` },
          { key: 'status', label: 'Status' }
        ],
        summary: {
          totalRecords: certificateData.length,
          additionalInfo: {
            'Total Eligible': certificateData.length,
            'Average Performance': `${(passedResults.reduce((sum, r) => sum + r.percentage, 0) / passedResults.length).toFixed(1)}%`
          }
        }
      };

      ReportGenerator.generatePDF(reportConfig);
      
      toast({
        title: "Certificates Generated",
        description: `${type} generated for ${certificateData.length} students`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: `Failed to generate ${type.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exams & Results</h1>
          <p className="text-muted-foreground">Manage examinations and student results</p>
        </div>
        {courses.length > 0 && (
          <ScheduleExamDialog 
            course={courses[0]} 
            onExamScheduled={fetchData}
          />
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examStats.totalExams}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {examStats.scheduledExams}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {examStats.completedExams}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {examStats.passRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="exams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
          <TabsTrigger value="conduct">Live Management</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Exams */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search exams..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 border border-input bg-background rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examination Schedule</CardTitle>
              <CardDescription>Manage all scheduled and completed examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading exams...</span>
                </div>
              ) : filteredExams.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{exam.courses?.name}</div>
                            <div className="text-sm text-muted-foreground">{exam.courses?.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(exam.exam_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{exam.total_marks}</TableCell>
                        <TableCell>
                          <Badge variant={
                            exam.status === 'completed' ? 'default' : 
                            exam.status === 'ongoing' ? 'secondary' :
                            exam.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {exam.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {courses.find(c => c.id === exam.course_id) && (
                              <ViewExamsDialog course={courses.find(c => c.id === exam.course_id)!} />
                            )}
                            {exam.status === 'completed' && courses.find(c => c.id === exam.course_id) && (
                              <ViewResultsDialog course={courses.find(c => c.id === exam.course_id)!} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Exams Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "No exams have been scheduled yet"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conduct Exam Tab */}
        <TabsContent value="conduct" className="space-y-6">
          <LiveExamManagement />
        </TabsContent>
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search results..." 
                    className="pl-10"
                    value={resultsSearchTerm}
                    onChange={(e) => setResultsSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleExportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
              <CardDescription>Student performance and results summary</CardDescription>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading results...</span>
                </div>
              ) : filteredResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.students?.name}</div>
                            <div className="text-sm text-muted-foreground">{result.students?.student_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.exams?.name}</div>
                            <div className="text-sm text-muted-foreground">{result.courses?.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.marks_obtained}/{result.total_marks}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{result.percentage}%</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.percentage >= 40 ? 'default' : 'destructive'}>
                            {result.percentage >= 40 ? 'Pass' : 'Fail'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateMarksheet(result)}
                            >
                              Marksheet
                            </Button>
                            {result.percentage >= 40 && (
                              <Button 
                                size="sm"
                                onClick={() => handleGenerateCertificate(result)}
                              >
                                Certificate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                  <p className="text-muted-foreground">
                    {resultsSearchTerm 
                      ? "Try adjusting your search criteria" 
                      : "No exam results have been recorded yet"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificates & Documents</CardTitle>
              <CardDescription>Generate and manage student certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleBulkCertificateGeneration('Course Completion Certificate')}
                >
                  <Award className="h-6 w-6 mb-2" />
                  Course Completion Certificate
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleBulkCertificateGeneration('Batch Marksheet Report')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Batch Marksheet
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleBulkCertificateGeneration('Academic Transcript')}
                >
                  <Download className="h-6 w-6 mb-2" />
                  Transcript
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => handleBulkCertificateGeneration('Merit Certificate')}
                >
                  <Award className="h-6 w-6 mb-2" />
                  Merit Certificate
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Certificate Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-600">{results.filter(r => r.percentage >= 40).length}</div>
                    <div className="text-muted-foreground">Eligible Students</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600">{examStats.passRate}%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                  <div>
                    <div className="font-medium text-orange-600">{results.filter(r => r.grade === 'A' || r.grade === 'A+').length}</div>
                    <div className="text-muted-foreground">Merit Students</div>
                  </div>
                  <div>
                    <div className="font-medium text-purple-600">{examStats.completedExams}</div>
                    <div className="text-muted-foreground">Completed Exams</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
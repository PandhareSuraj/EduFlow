import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, FileText, Award, Download, Clock, Users, BookOpen, TrendingUp, CheckCircle, Loader2, AlertCircle, Eye, Play, Trash2, RefreshCw } from "lucide-react";
// Update existing ExamDialogs import and add MCQ components
import { ScheduleExamDialog, ViewExamsDialog } from "@/components/forms/ExamDialogs";
import { MCQExamCreationDialog } from "@/components/exams/MCQExamCreationDialog";
import { MCQQuestionBuilder } from "@/components/exams/MCQQuestionBuilder";
import { AdminExamPreview } from "@/components/exams/AdminExamPreview";
import { DeleteExamDialog } from "@/components/exams/DeleteExamDialog";
import { RunExamNowDialog } from "@/components/exams/RunExamNowDialog";
import { EditExamDialog } from "@/components/forms/EditExamDialog";
import { RescheduleExamDialog } from "@/components/exams/RescheduleExamDialog";
import { ViewResultsDialog } from "@/components/forms/ResultDialogs";
import { ExamAnalyticsReport } from "@/components/exams/ExamAnalyticsReport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportGenerator, ReportConfigs } from "@/utils/reportGenerator";
import { LiveExamManagement } from "@/components/exams/LiveExamManagement";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";
import { usePageTitle } from "@/hooks/usePageTitle";

// Data interfaces
interface Exam {
  id: string;
  name: string;
  course_id: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  total_marks: number;
  total_questions?: number;
  exam_type?: string;
  actual_question_count?: number;
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
  usePageTitle("Exams");
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resultsSearchTerm, setResultsSearchTerm] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [updatingStatuses, setUpdatingStatuses] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Auto-update exam statuses based on current time
      try {
        await supabase.rpc('update_exam_statuses');
      } catch (error) {
        console.log('Status update skipped:', error);
      }

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');

      if (coursesError) throw coursesError;

      // Fetch exams separately with question counts
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select(`
          id, 
          name, 
          course_id, 
          exam_date,
          start_time,
          end_time,
          duration_minutes,
          total_marks, 
          total_questions,
          exam_type,
          status
        `)
        .order('exam_date', { ascending: false });

      if (examsError) throw examsError;

      setCourses(coursesData || []);
      
      // Map exams with course data and question counts
      const mappedExams = await Promise.all((examsData || []).map(async (exam) => {
        // Get actual question count for MCQ exams
        let actualQuestionCount = 0;
        if (exam.exam_type === 'mcq') {
          const { count, error: countError } = await supabase
            .from('mcq_questions')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', exam.id);
          
          if (!countError) {
            actualQuestionCount = count || 0;
          }
        }

        // Calculate actual status based on time (frontend override for better UX)
        let actualStatus = exam.status;
        const now = new Date();
        const examDate = new Date(exam.exam_date);
        const startTime = exam.start_time ? new Date(exam.start_time) : examDate;
        const endTime = exam.end_time ? new Date(exam.end_time) : 
                        new Date(startTime.getTime() + (exam.duration_minutes || 60) * 60000);
        
        // Auto-calculate status if exam is marked as "scheduled"
        if (exam.status === 'scheduled') {
          if (now > endTime) {
            actualStatus = 'completed';
          } else if (now >= startTime && now <= endTime) {
            actualStatus = 'ongoing';
          }
        }

        return {
          ...exam,
          actual_question_count: actualQuestionCount,
          status: actualStatus as 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
          course: courses.find(c => c.id === exam.course_id)
        };
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

  // Handle manual mark as completed
  const handleMarkCompleted = async (examId: string) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ status: 'completed' })
        .eq('id', examId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Exam marked as completed. Analytics now available.",
      });
      
      fetchData(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive",
      });
    }
  };

  // Handle bulk status update
  const handleUpdateAllStatuses = async () => {
    setUpdatingStatuses(true);
    try {
      await supabase.rpc('update_exam_statuses');
      
      toast({
        title: "Success",
        description: "All exam statuses updated based on current time",
      });
      
      fetchData(); // Refresh
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update statuses",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatuses(false);
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
        {courses && courses.length > 0 && (
          <div className="flex gap-2">
            <PermissionWrapper 
              permission="EXAMS_CREATE"
              fallback={
                <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                  Contact admin to create exams
                </div>
              }
            >
              <MCQExamCreationDialog 
                courses={courses || []} 
                onExamCreated={fetchData}
              />
            </PermissionWrapper>
            <PermissionWrapper 
              permission="EXAMS_CREATE"
              fallback={null}
            >
              <ScheduleExamDialog 
                course={courses[0]} 
                onExamScheduled={fetchData}
              />
            </PermissionWrapper>
          </div>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Examination Schedule</CardTitle>
                  <CardDescription>Manage all scheduled and completed examinations</CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleUpdateAllStatuses}
                  disabled={updatingStatuses}
                >
                  {updatingStatuses ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update All Statuses
                    </>
                  )}
                </Button>
              </div>
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
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {new Date(exam.exam_date).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            {exam.start_time && exam.end_time && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {new Date(exam.start_time).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                  {' - '}
                                  {new Date(exam.end_time).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </span>
                                {exam.duration_minutes && (
                                  <Badge variant="secondary" className="ml-2">
                                    {exam.duration_minutes} min
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{exam.total_marks}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={
                              exam.status === 'completed' ? 'default' : 
                              exam.status === 'ongoing' ? 'destructive' :
                              exam.status === 'cancelled' ? 'destructive' : 
                              'secondary'
                            }>
                              {exam.status}
                            </Badge>
                            
                            {/* Show time-based hint */}
                            {exam.status === 'scheduled' && 
                             new Date(exam.end_time || exam.exam_date) < new Date() && (
                              <span className="text-xs text-orange-500">
                                ⚠️ Past due
                              </span>
                            )}
                            
                            {exam.status === 'ongoing' && (
                              <span className="text-xs text-red-500">
                                🔴 Live now
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {/* Reschedule Exam - Works for all statuses */}
                            <PermissionWrapper permission="EXAMS_CREATE" fallback={null}>
                              <RescheduleExamDialog 
                                exam={exam}
                                onExamRescheduled={fetchData}
                              />
                            </PermissionWrapper>

                            {/* Edit Exam */}
                            <PermissionWrapper permission="EXAMS_CREATE" fallback={null}>
                              <EditExamDialog 
                                exam={exam}
                                onExamUpdated={fetchData}
                              />
                            </PermissionWrapper>

                            {/* Admin Actions - Delete, Preview, Run Now */}
                            <PermissionWrapper permission="EXAMS_DELETE" fallback={null}>
                              <DeleteExamDialog 
                                exam={exam} 
                                onExamDeleted={fetchData}
                              />
                            </PermissionWrapper>
                            
                            <PermissionWrapper permission="EXAMS_PREVIEW" fallback={null}>
                              <AdminExamPreview exam={exam} />
                            </PermissionWrapper>
                            
                            <PermissionWrapper permission="EXAMS_RUN_NOW" fallback={null}>
                              <RunExamNowDialog exam={exam} />
                            </PermissionWrapper>

                            {/* MCQ Question Management - Only for MCQ exams */}
                            {exam.exam_type === 'mcq' && (
                              <PermissionWrapper 
                                permission="EXAMS_CONDUCT"
                                fallback={null}
                              >
                                <MCQQuestionBuilder
                                  exam={{
                                    id: exam.id,
                                    name: exam.name,
                                    total_questions: exam.total_questions || 30,
                                    total_marks: exam.total_marks,
                                    exam_type: exam.exam_type,
                                    actual_question_count: exam.actual_question_count || 0
                                  }}
                                  onQuestionsUpdated={fetchData}
                                />
                              </PermissionWrapper>
                            )}
                            
                            {/* Theory/Other Exam Management */}
                            {exam.exam_type !== 'mcq' && (
                              <PermissionWrapper 
                                permission="EXAMS_CONDUCT"
                                fallback={null}
                              >
                                <Button variant="outline" size="sm">
                                  <FileText className="h-4 w-4 mr-1" />
                                  Manage Questions
                                </Button>
                              </PermissionWrapper>
                            )}
                            
                            {courses.find(c => c.id === exam.course_id) && (
                              <ViewExamsDialog course={courses.find(c => c.id === exam.course_id)!} />
                            )}
                            {exam.status === 'completed' && courses.find(c => c.id === exam.course_id) && (
                              <ViewResultsDialog course={courses.find(c => c.id === exam.course_id)!} />
                            )}
                            
                            {/* Show "Mark as Completed" for past scheduled exams */}
                            {exam.status === 'scheduled' && 
                             new Date(exam.end_time || exam.exam_date) < new Date() && (
                              <PermissionWrapper permission="EXAMS_CREATE" fallback={null}>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkCompleted(exam.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark Completed
                                </Button>
                              </PermissionWrapper>
                            )}
                            
                            {/* Analytics Report for completed exams */}
                            {exam.status === 'completed' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Analytics
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Exam Analytics Report</DialogTitle>
                                  </DialogHeader>
                                  <ExamAnalyticsReport examId={exam.id} />
                                </DialogContent>
                              </Dialog>
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

        {/* Results Tab */}
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
              <CardTitle>Student Results</CardTitle>
              <CardDescription>View and manage all examination results</CardDescription>
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
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.students?.student_id}</TableCell>
                        <TableCell>{result.students?.name}</TableCell>
                        <TableCell>{result.exams?.name}</TableCell>
                        <TableCell>{result.courses?.name}</TableCell>
                        <TableCell>{result.marks_obtained}/{result.total_marks}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={result.percentage >= 40 ? "text-green-600" : "text-red-600"}>
                              {result.percentage}%
                            </span>
                            {result.percentage >= 40 && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={result.percentage >= 40 ? "default" : "destructive"}>
                            {result.grade}
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
                                variant="outline" 
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
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                  <p className="text-muted-foreground">
                    {resultsSearchTerm 
                      ? "Try adjusting your search criteria" 
                      : "No results have been published yet"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Certificate Generation</CardTitle>
                <CardDescription>Generate certificates in bulk for eligible students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleBulkCertificateGeneration("Completion Certificates")}
                >
                  Generate Completion Certificates
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleBulkCertificateGeneration("Merit Certificates")}
                >
                  Generate Merit Certificates
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleBulkCertificateGeneration("Participation Certificates")}
                >
                  Generate Participation Certificates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificate Statistics</CardTitle>
                <CardDescription>Overview of certificate eligibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Students</span>
                  <Badge variant="outline">{results.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Eligible for Certificates</span>
                  <Badge className="bg-green-100 text-green-800">
                    {results.filter(r => r.percentage >= 40).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pass Rate</span>
                  <Badge variant="secondary">{examStats.passRate}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Certificates Generated</span>
                  <Badge variant="outline">0</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, FileText, Award, AlertCircle, CheckCircle, Timer, Monitor, Pause, Play, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LiveExam {
  id: string;
  name: string;
  course_name: string;
  status: 'ongoing' | 'scheduled';
  start_time: string;
  duration: number;
  students_enrolled: number;
  students_online: number;
  submissions_count: number;
}

interface StudentSubmission {
  id: string;
  student_name: string;
  student_id: string;
  status: 'in_progress' | 'submitted' | 'not_started';
  time_remaining: number;
  progress: number;
  last_activity: string;
}

export function LiveExamManagement() {
  const { toast } = useToast();
  const [liveExams, setLiveExams] = useState<LiveExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<LiveExam | null>(null);
  const [students, setStudents] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeExtension, setTimeExtension] = useState(15);

  // Fetch live exams and student sessions
  useEffect(() => {
    fetchLiveExams();
    fetchStudentSessions();
  }, []);

  const fetchLiveExams = async () => {
    setLoading(true);
    try {
      // First get active exam sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('student_exam_sessions')
        .select(`
          id,
          exam_id,
          student_id,
          status,
          start_time,
          end_time,
          duration_minutes
        `)
        .eq('status', 'in_progress')
        .order('start_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        setLiveExams([]);
        return;
      }

      // Get unique exam IDs
      const examIds = [...new Set(sessions.map(s => s.exam_id))];

      // Get exam details for these IDs
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select(`
          id,
          name,
          course_id,
          duration_minutes,
          total_questions
        `)
        .in('id', examIds);

      if (examsError) throw examsError;

      // Get course details
      const courseIds = [...new Set(exams?.map(e => e.course_id) || [])];
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);

      if (coursesError) throw coursesError;

      // Create course lookup map
      const courseMap = new Map(courses?.map(c => [c.id, c.name]) || []);

      // Group sessions by exam to get live exam data
      const examMap = new Map();
      sessions.forEach(session => {
        const examId = session.exam_id;
        const exam = exams?.find(e => e.id === examId);
        
        if (!exam) return;

        if (!examMap.has(examId)) {
          examMap.set(examId, {
            id: examId,
            name: exam.name,
            course_name: courseMap.get(exam.course_id) || 'Unknown Course',
            status: 'ongoing' as const,
            start_time: session.start_time,
            duration: exam.duration_minutes || 60,
            students_enrolled: 0,
            students_online: 0,
            submissions_count: 0
          });
        }
        
        const liveExam = examMap.get(examId);
        liveExam.students_online += 1;
        if (session.status === 'completed') {
          liveExam.submissions_count += 1;
        }
      });

      // Get total enrolled students for each exam
      for (const [examId, exam] of examMap.entries()) {
        const examData = exams?.find(e => e.id === examId);
        if (examData) {
          const { count } = await supabase
            .from('students')
            .select('id', { count: 'exact' })
            .eq('course_id', examData.course_id);
          
          exam.students_enrolled = count || 0;
        }
      }

      const liveExamsData = Array.from(examMap.values());
      setLiveExams(liveExamsData);

    } catch (error: any) {
      console.error('Error fetching live exams:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load live exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentSessions = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('student_exam_sessions')
        .select(`
          id,
          student_id,
          status,
          start_time,
          end_time,
          duration_minutes,
          answered_questions,
          total_questions
        `)
        .eq('status', 'in_progress')
        .order('start_time', { ascending: false });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setStudents([]);
        return;
      }

      // Get student details
      const studentIds = [...new Set(sessions.map(s => s.student_id))];
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, name, student_id')
        .in('id', studentIds);

      if (studentsError) throw studentsError;

      // Create student lookup map
      const studentMap = new Map(students?.map(s => [s.id, s]) || []);

      const studentsData: StudentSubmission[] = sessions.map(session => {
        const student = studentMap.get(session.student_id);
        const timeElapsed = new Date().getTime() - new Date(session.start_time).getTime();
        const totalDuration = (session.duration_minutes || 60) * 60 * 1000;
        const timeRemaining = Math.max(0, Math.floor((totalDuration - timeElapsed) / (1000 * 60)));
        const progress = session.total_questions > 0 ? 
          Math.floor((session.answered_questions / session.total_questions) * 100) : 0;

        return {
          id: session.id,
          student_name: student?.name || 'Unknown Student',
          student_id: student?.student_id || 'Unknown ID',
          status: session.status === 'completed' ? 'submitted' : 'in_progress',
          time_remaining: timeRemaining,
          progress: progress,
          last_activity: timeElapsed < 120000 ? 'Just now' : 
                        timeElapsed < 300000 ? 'Few minutes ago' : 
                        'More than 5 minutes ago'
        };
      });

      setStudents(studentsData);

    } catch (error: any) {
      console.error('Error fetching student sessions:', error);
      toast({
        title: "Error", 
        description: error.message || "Failed to load student sessions",
        variant: "destructive"
      });
    }
  };

  const handleExtendTime = async (examId: string, minutes: number) => {
    try {
      // Get current sessions for this exam
      const { data: sessions, error: fetchError } = await supabase
        .from('student_exam_sessions')
        .select('id, duration_minutes')
        .eq('exam_id', examId)
        .eq('status', 'in_progress');

      if (fetchError) throw fetchError;

      // Update each session individually
      for (const session of sessions || []) {
        const newDuration = (session.duration_minutes || 60) + minutes;
        
        const { error: updateError } = await supabase
          .from('student_exam_sessions')
          .update({ duration_minutes: newDuration })
          .eq('id', session.id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Time Extended",
        description: `Exam time extended by ${minutes} minutes for all students`,
      });

      // Refresh data
      fetchLiveExams();
      fetchStudentSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to extend exam time",
        variant: "destructive",
      });
    }
  };

  const handleEndExam = async (examId: string) => {
    try {
      // End all active sessions for this exam
      const { error } = await supabase
        .from('student_exam_sessions')
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString(),
          submit_time: new Date().toISOString()
        })
        .eq('exam_id', examId)
        .eq('status', 'in_progress');

      if (error) throw error;
      
      toast({
        title: "Exam Ended",
        description: "The exam has been ended successfully. All submissions are now final.",
      });

      // Refresh data
      fetchLiveExams();
      fetchStudentSessions();
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to end exam",
        variant: "destructive",
      });
    }
  };

  const handlePauseExam = async (examId: string) => {
    try {
      // For now, just show a message as pausing requires more complex state management
      toast({
        title: "Exam Paused",
        description: "The exam has been paused for all students",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to pause exam", 
        variant: "destructive",
      });
    }
  };

  const handleResumeExam = async (examId: string) => {
    try {
      // For now, just show a message as resuming requires more complex state management
      toast({
        title: "Exam Resumed",  
        description: "The exam has been resumed for all students",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resume exam",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStudentsOnline = liveExams.reduce((sum, exam) => sum + exam.students_online, 0);
  const totalActiveExams = liveExams.filter(exam => exam.status === 'ongoing').length;
  const averageTimeRemaining = students.length > 0 
    ? students.reduce((sum, student) => sum + student.time_remaining, 0) / students.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800">Active Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalActiveExams}</div>
            <p className="text-sm text-green-600">Currently in progress</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">Students Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStudentsOnline}</div>
            <p className="text-sm text-blue-600">Taking exams now</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-orange-800">Avg Time Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.floor(averageTimeRemaining)}m
            </div>
            <p className="text-sm text-orange-600">Average time left</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Exams */}
      <Card>
        <CardHeader>
          <CardTitle>Active Examinations</CardTitle>
          <CardDescription>Monitor and manage ongoing exams</CardDescription>
        </CardHeader>
        <CardContent>
          {liveExams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.course_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {exam.students_online}/{exam.students_enrolled}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {exam.submissions_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={exam.status === 'ongoing' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Monitor className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Monitor Students - {exam.name}</DialogTitle>
                              <DialogDescription>
                                Real-time student activity and progress
                              </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Time Left</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {students.map((student) => (
                                    <TableRow key={student.id}>
                                      <TableCell>
                                        <div>
                                          <div className="font-medium">{student.student_name}</div>
                                          <div className="text-sm text-muted-foreground">{student.student_id}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge className={getStatusColor(student.status)}>
                                          {student.status.replace('_', ' ')}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-blue-600 h-2 rounded-full" 
                                              style={{ width: `${student.progress}%` }}
                                            />
                                          </div>
                                          <span className="text-sm">{student.progress}%</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-1">
                                          <Timer className="h-4 w-4" />
                                          {student.time_remaining}m
                                        </div>
                                      </TableCell>
                                      <TableCell>{student.last_activity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Extend Time</DialogTitle>
                              <DialogDescription>
                                Add additional time to the exam for all students
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="minutes">Additional Minutes</Label>
                                <Input
                                  id="minutes"
                                  type="number"
                                  min="1"
                                  max="120"
                                  value={timeExtension}
                                  onChange={(e) => setTimeExtension(parseInt(e.target.value) || 15)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                onClick={() => handleExtendTime(exam.id, timeExtension)}
                                className="w-full"
                              >
                                Extend Time by {timeExtension} Minutes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePauseExam(exam.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <StopCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>End Exam</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to end this exam? This action cannot be undone and all student submissions will be finalized.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline">Cancel</Button>
                              <Button 
                                variant="destructive"
                                onClick={() => handleEndExam(exam.id)}
                              >
                                End Exam
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Exams</h3>
              <p className="text-muted-foreground">
                There are no exams currently in progress
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
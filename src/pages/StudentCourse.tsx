import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, Clock, Calendar, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CourseData {
  id: number;
  name: string;
  code: string;
  duration_months: number;
  total_semesters: number;
  description: string;
  department: string;
}

interface StudentData {
  year: number;
  semester: number;
  admission_date: string;
  status: string;
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
  credits: number;
  description: string;
}

export default function StudentCourse() {
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCourseData();
    }
  }, [user]);

  const fetchCourseData = async () => {
    try {
      // Get student data first
      const { data: studentInfo, error: studentError } = await supabase.rpc('get_student_data');
      
      if (studentError || !studentInfo || studentInfo.length === 0) {
        console.error('Error fetching student data:', studentError);
        return;
      }

      const student = studentInfo[0];
      setStudentData({
        year: student.year,
        semester: student.semester,
        admission_date: student.admission_date,
        status: student.status
      });

      // Get course details
      const { data: courseInfo, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('name', student.course_name)
        .single();

      if (courseError) {
        console.error('Error fetching course data:', courseError);
        return;
      }

      setCourseData(courseInfo);

      // Get subjects for this course
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('course_id', courseInfo.id);

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
      } else {
        setSubjects(subjectsData || []);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!courseData || !studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Course Data Found</CardTitle>
            <CardDescription className="text-center">
              Unable to load course information. Please contact the administration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const calculateProgress = () => {
    if (!courseData.total_semesters) return 0;
    return Math.min((studentData.semester / courseData.total_semesters) * 100, 100);
  };

  const getTimeRemaining = () => {
    const admissionDate = new Date(studentData.admission_date);
    const endDate = new Date(admissionDate);
    endDate.setMonth(endDate.getMonth() + courseData.duration_months);
    
    const now = new Date();
    const remaining = endDate.getTime() - now.getTime();
    const remainingMonths = Math.ceil(remaining / (1000 * 60 * 60 * 24 * 30));
    
    return remainingMonths > 0 ? remainingMonths : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Course</h1>
          <p className="text-muted-foreground">View your course details and academic progress</p>
        </div>
        <Badge variant={studentData.status === 'active' ? 'default' : 'secondary'}>
          {studentData.status}
        </Badge>
      </div>

      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{courseData.name}</CardTitle>
              <CardDescription>Course Code: {courseData.code}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {courseData.description && (
            <div>
              <h3 className="font-semibold mb-2">Course Description</h3>
              <p className="text-muted-foreground">{courseData.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Duration</h3>
              <p className="text-2xl font-bold text-primary">{courseData.duration_months}</p>
              <p className="text-sm text-muted-foreground">Months</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Total Semesters</h3>
              <p className="text-2xl font-bold text-primary">{courseData.total_semesters || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Semesters</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Award className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Department</h3>
              <p className="text-lg font-semibold text-primary">{courseData.department || 'Medical'}</p>
              <p className="text-sm text-muted-foreground">Department</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{studentData.year}</p>
                  <p className="text-sm text-muted-foreground">Current Year</p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <p className="text-2xl font-bold text-accent">{studentData.semester}</p>
                  <p className="text-sm text-muted-foreground">Current Semester</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Important Dates</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Admission Date:</span>
                    <span>{new Date(studentData.admission_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Completion:</span>
                    <span>
                      {new Date(new Date(studentData.admission_date).getTime() + 
                        courseData.duration_months * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Remaining:</span>
                    <span className="text-primary font-medium">{getTimeRemaining()} months</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Subjects
          </CardTitle>
          <CardDescription>
            Subjects included in your course curriculum
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{subject.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {subject.credits} Credits
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">Code: {subject.code}</p>
                    {subject.description && (
                      <p className="text-xs text-muted-foreground">{subject.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No subjects found for this course.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
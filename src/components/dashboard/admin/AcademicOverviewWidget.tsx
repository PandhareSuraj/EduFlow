import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CourseAttendance {
  name: string;
  students: number;
  attendance: number;
}

interface AcademicStats {
  totalCourses: number;
  totalSubjects: number;
  averageAttendance: number;
  upcomingExams: number;
  topPerformingCourses: CourseAttendance[];
}

export function AcademicOverviewWidget() {
  const [stats, setStats] = useState<AcademicStats>({
    totalCourses: 0,
    totalSubjects: 0,
    averageAttendance: 0,
    upcomingExams: 0,
    topPerformingCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicStats();
  }, []);

  const fetchAcademicStats = async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const today = new Date();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const [
        coursesResult,
        subjectsResult,
        attendanceResult,
        examsResult,
        courseStudents
      ] = await Promise.all([
        supabase.from('courses').select('id, name', { count: 'exact' }).eq('status', 'active'),
        supabase.from('subjects').select('id', { count: 'exact' }),
        supabase.from('attendance_records').select('status, student_id, students!inner(course_id)')
          .gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('exams').select('id', { count: 'exact' })
          .eq('status', 'scheduled')
          .gte('exam_date', today.toISOString().split('T')[0])
          .lte('exam_date', nextWeek.toISOString().split('T')[0]),
        supabase.from('students').select('course_id, courses!students_course_id_fkey(name)')
          .eq('status', 'active')
      ]);

      // Overall attendance
      const totalAttendance = attendanceResult.data?.length || 0;
      const presentCount = attendanceResult.data?.filter(r => r.status === 'present').length || 0;
      const averageAttendance = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      // Per-course attendance from real data
      const courseAttendanceMap = new Map<string, { present: number; total: number }>();
      (attendanceResult.data || []).forEach((record: any) => {
        const courseId = record.students?.course_id;
        if (courseId) {
          const existing = courseAttendanceMap.get(courseId) || { present: 0, total: 0 };
          existing.total++;
          if (record.status === 'present') existing.present++;
          courseAttendanceMap.set(courseId, existing);
        }
      });

      // Build course list with student counts and real attendance
      const courseMap = new Map<string, { name: string; students: number }>();
      (courseStudents.data || []).forEach((student: any) => {
        const courseName = student.courses?.name || 'Unknown';
        const courseId = student.course_id;
        if (courseId) {
          const existing = courseMap.get(courseId);
          if (existing) {
            existing.students++;
          } else {
            courseMap.set(courseId, { name: courseName, students: 1 });
          }
        }
      });

      const topCourses: CourseAttendance[] = Array.from(courseMap.entries())
        .sort((a, b) => b[1].students - a[1].students)
        .slice(0, 3)
        .map(([courseId, course]) => {
          const att = courseAttendanceMap.get(courseId);
          const attendance = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
          return {
            name: course.name,
            students: course.students,
            attendance
          };
        });

      setStats({
        totalCourses: coursesResult.count || 0,
        totalSubjects: subjectsResult.count || 0,
        averageAttendance,
        upcomingExams: examsResult.count || 0,
        topPerformingCourses: topCourses
      });
    } catch (error) {
      console.error('Error fetching academic stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 85) return 'text-emerald-600';
    if (rate >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <GraduationCap className="mr-2 h-5 w-5" />
            Academic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <GraduationCap className="mr-2 h-5 w-5 text-primary" />
          Academic Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid - removed fake pass rate */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{stats.totalCourses}</p>
            <p className="text-xs text-muted-foreground">Courses</p>
          </div>
          <div className="bg-accent/10 rounded-lg p-3 text-center">
            <BookOpen className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-xl font-bold">{stats.totalSubjects}</p>
            <p className="text-xs text-muted-foreground">Subjects</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <ClipboardCheck className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className={`text-xl font-bold ${getAttendanceColor(stats.averageAttendance)}`}>
              {stats.averageAttendance}%
            </p>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
        </div>

        {/* Upcoming Exams Alert */}
        {stats.upcomingExams > 0 && (
          <div className="flex items-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{stats.upcomingExams} Exams This Week</p>
              <p className="text-xs text-muted-foreground">Review schedules and preparations</p>
            </div>
          </div>
        )}

        {/* Top Courses with real attendance */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Top Courses by Enrollment
          </h4>
          <div className="space-y-3">
            {stats.topPerformingCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No course data available</p>
            ) : (
              stats.topPerformingCourses.map((course, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[150px]">{course.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {course.students} students
                      </Badge>
                      {course.attendance > 0 && (
                        <span className={`text-xs font-medium ${getAttendanceColor(course.attendance)}`}>
                          {course.attendance}%
                        </span>
                      )}
                    </div>
                  </div>
                  {course.attendance > 0 && (
                    <Progress value={course.attendance} className="h-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

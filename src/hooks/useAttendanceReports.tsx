import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AttendanceReportFilters {
  reportType: string;
  courseId?: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  threshold?: number;
  semester?: number;
}

export interface DailyAttendanceData {
  sessions: Array<{
    id: string;
    class_name: string;
    subject_name: string;
    faculty_name: string;
    start_time: string;
    total_students: number;
    present_count: number;
    absent_count: number;
    attendance_percentage: number;
    status: string;
  }>;
  hourlyStats: Array<{
    hour: string;
    sessions: number;
    averageAttendance: number;
  }>;
  totalSessions: number;
  overallAttendance: number;
}

export interface StudentAttendanceData {
  students: Array<{
    student_id: number;
    student_name: string;
    student_number: string;
    course_name: string;
    total_sessions: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    attendance_percentage: number;
    monthlyTrends: Array<{
      month: string;
      percentage: number;
    }>;
    subjectWise: Array<{
      subject: string;
      sessions: number;
      present: number;
      percentage: number;
    }>;
  }>;
  classAverage: number;
  riskStudents: number;
}

export interface CourseWiseData {
  courses: Array<{
    course_id: number;
    course_name: string;
    total_students: number;
    total_sessions: number;
    average_attendance: number;
    subjects: Array<{
      subject_name: string;
      sessions: number;
      attendance_percentage: number;
    }>;
    faculty_performance: Array<{
      faculty_name: string;
      sessions: number;
      average_attendance: number;
    }>;
  }>;
  trends: Array<{
    date: string;
    courses: Record<string, number>;
  }>;
}

export interface LowAttendanceAlert {
  students: Array<{
    student_id: number;
    student_name: string;
    student_number: string;
    course_name: string;
    attendance_percentage: number;
    risk_level: 'critical' | 'warning';
    total_sessions: number;
    present_count: number;
    last_present: string | null;
  }>;
  summary: {
    critical: number;
    warning: number;
    threshold: number;
  };
}

export const useAttendanceReports = () => {
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState<DailyAttendanceData | null>(null);
  const [studentData, setStudentData] = useState<StudentAttendanceData | null>(null);
  const [courseData, setCourseData] = useState<CourseWiseData | null>(null);
  const [lowAttendanceData, setLowAttendanceData] = useState<LowAttendanceAlert | null>(null);
  const { toast } = useToast();

  const fetchDailyReport = async (filters: AttendanceReportFilters) => {
    setLoading(true);
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      const dateStr = filters.dateRange.from.toISOString().split('T')[0];
      
      // Fetch sessions for the selected date
      let sessionQuery = supabase
        .from('attendance_sessions')
        .select(`
          id,
          class_name,
          subject_id,
          faculty_id,
          start_time,
          total_students,
          present_count,
          absent_count,
          attendance_percentage,
          status
        `)
        .eq('session_date', dateStr)
        .order('start_time');
        
      if (collegeId) {
        sessionQuery = sessionQuery.eq('college_id', collegeId);
      }
      
      if (filters.courseId && filters.courseId !== 'all') {
        sessionQuery = sessionQuery.eq('course_id', parseInt(filters.courseId));
      }
      
      const { data: sessionsData, error: sessionsError } = await sessionQuery;
      if (sessionsError) throw sessionsError;
      
      if (!sessionsData || sessionsData.length === 0) {
        setDailyData({
          sessions: [],
          hourlyStats: [],
          totalSessions: 0,
          overallAttendance: 0
        });
        return;
      }
      
      // Fetch subject and faculty names
      const subjectIds = [...new Set(sessionsData.map(s => s.subject_id))];
      const facultyIds = [...new Set(sessionsData.map(s => s.faculty_id))];
      
      const [subjectsResponse, facultyResponse] = await Promise.all([
        supabase.from('subjects').select('id, name').in('id', subjectIds),
        supabase.from('faculty').select('id, name').in('id', facultyIds)
      ]);
      
      const subjectsMap = new Map((subjectsResponse.data || []).map(s => [s.id, s.name]));
      const facultyMap = new Map((facultyResponse.data || []).map(f => [f.id, f.name]));
      
      // Process sessions data
      const sessions = sessionsData.map(session => ({
        id: session.id,
        class_name: session.class_name,
        subject_name: subjectsMap.get(session.subject_id) || 'Unknown Subject',
        faculty_name: facultyMap.get(session.faculty_id) || 'Unknown Faculty',
        start_time: session.start_time,
        total_students: session.total_students || 0,
        present_count: session.present_count || 0,
        absent_count: session.absent_count || 0,
        attendance_percentage: session.attendance_percentage || 0,
        status: session.status
      }));
      
      // Calculate hourly stats
      const hourlyMap = new Map<string, { sessions: number; totalAttendance: number }>();
      sessions.forEach(session => {
        const hour = new Date(session.start_time).getHours();
        const hourKey = `${hour}:00`;
        
        if (!hourlyMap.has(hourKey)) {
          hourlyMap.set(hourKey, { sessions: 0, totalAttendance: 0 });
        }
        
        const hourData = hourlyMap.get(hourKey)!;
        hourData.sessions += 1;
        hourData.totalAttendance += session.attendance_percentage;
      });
      
      const hourlyStats = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
        hour,
        sessions: data.sessions,
        averageAttendance: data.sessions > 0 ? data.totalAttendance / data.sessions : 0
      })).sort((a, b) => a.hour.localeCompare(b.hour));
      
      const totalSessions = sessions.length;
      const overallAttendance = totalSessions > 0 
        ? sessions.reduce((sum, s) => sum + s.attendance_percentage, 0) / totalSessions 
        : 0;
      
      setDailyData({
        sessions,
        hourlyStats,
        totalSessions,
        overallAttendance
      });
      
    } catch (error) {
      console.error('Error fetching daily report:', error);
      toast({
        title: "Error",
        description: "Failed to fetch daily attendance report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (filters: AttendanceReportFilters) => {
    setLoading(true);
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      
      // Fetch attendance records within date range
      let recordsQuery = supabase
        .from('attendance_records')
        .select(`
          student_id,
          status,
          created_at,
          attendance_sessions!inner(
            session_date,
            subject_id,
            course_id
          )
        `)
        .gte('attendance_sessions.session_date', filters.dateRange.from.toISOString().split('T')[0])
        .lte('attendance_sessions.session_date', filters.dateRange.to.toISOString().split('T')[0]);
        
      if (collegeId) {
        recordsQuery = recordsQuery.eq('college_id', collegeId);
      }
      
      if (filters.courseId && filters.courseId !== 'all') {
        recordsQuery = recordsQuery.eq('attendance_sessions.course_id', parseInt(filters.courseId));
      }
      
      const { data: recordsData, error: recordsError } = await recordsQuery;
      if (recordsError) throw recordsError;
      
      if (!recordsData || recordsData.length === 0) {
        setStudentData({
          students: [],
          classAverage: 0,
          riskStudents: 0
        });
        return;
      }
      
      // Get unique student IDs and fetch student info
      const studentIds = [...new Set(recordsData.map(r => r.student_id))];
      
      let studentsQuery = supabase
        .from('students')
        .select('id, name, student_id, course_id')
        .in('id', studentIds);
        
      if (collegeId) {
        studentsQuery = studentsQuery.eq('college_id', collegeId);
      }
      
      const { data: studentsData, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;
      
      // Fetch course names
      const courseIds = [...new Set(studentsData?.map(s => s.course_id) || [])];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);
      
      const studentsMap = new Map(studentsData?.map(s => [s.id, s]) || []);
      const coursesMap = new Map(coursesData?.map(c => [c.id, c.name]) || []);
      
      // Process student data
      const studentStats = new Map<number, {
        records: typeof recordsData;
        totalSessions: number;
        present: number;
        absent: number;
        late: number;
      }>();
      
      recordsData.forEach(record => {
        const studentId = record.student_id;
        if (!studentStats.has(studentId)) {
          studentStats.set(studentId, {
            records: [],
            totalSessions: 0,
            present: 0,
            absent: 0,
            late: 0
          });
        }
        
        const stats = studentStats.get(studentId)!;
        stats.records.push(record);
        stats.totalSessions += 1;
        
        if (record.status === 'present') stats.present += 1;
        else if (record.status === 'absent') stats.absent += 1;
        else if (record.status === 'late') stats.late += 1;
      });
      
      const students = Array.from(studentStats.entries()).map(([studentId, stats]) => {
        const student = studentsMap.get(studentId);
        const courseName = student ? coursesMap.get(student.course_id) || 'Unknown Course' : 'Unknown Course';
        const attendancePercentage = stats.totalSessions > 0 ? (stats.present / stats.totalSessions) * 100 : 0;
        
        // Calculate monthly trends (simplified)
        const monthlyTrends = [
          { month: 'Jan', percentage: attendancePercentage },
          { month: 'Feb', percentage: attendancePercentage },
          { month: 'Mar', percentage: attendancePercentage }
        ];
        
        // Calculate subject-wise attendance (simplified)
        const subjectWise = [
          { subject: 'Subject 1', sessions: stats.totalSessions, present: stats.present, percentage: attendancePercentage }
        ];
        
        return {
          student_id: studentId,
          student_name: student?.name || 'Unknown',
          student_number: student?.student_id || 'N/A',
          course_name: courseName,
          total_sessions: stats.totalSessions,
          present_count: stats.present,
          absent_count: stats.absent,
          late_count: stats.late,
          attendance_percentage: Number(attendancePercentage.toFixed(1)),
          monthlyTrends,
          subjectWise
        };
      });
      
      const classAverage = students.length > 0 
        ? students.reduce((sum, s) => sum + s.attendance_percentage, 0) / students.length 
        : 0;
      
      const riskStudents = students.filter(s => s.attendance_percentage < 75).length;
      
      setStudentData({
        students: students.sort((a, b) => a.student_name.localeCompare(b.student_name)),
        classAverage: Number(classAverage.toFixed(1)),
        riskStudents
      });
      
    } catch (error) {
      console.error('Error fetching student report:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student attendance report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLowAttendanceAlert = async (threshold: number = 75) => {
    setLoading(true);
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      
      // Fetch all attendance records
      let recordsQuery = supabase
        .from('attendance_records')
        .select(`
          student_id,
          status,
          created_at
        `);
        
      if (collegeId) {
        recordsQuery = recordsQuery.eq('college_id', collegeId);
      }
      
      const { data: recordsData, error: recordsError } = await recordsQuery;
      if (recordsError) throw recordsError;
      
      if (!recordsData || recordsData.length === 0) {
        setLowAttendanceData({
          students: [],
          summary: { critical: 0, warning: 0, threshold }
        });
        return;
      }
      
      // Calculate attendance for each student
      const studentStats = new Map<number, {
        totalSessions: number;
        present: number;
        lastPresent: string | null;
      }>();
      
      recordsData.forEach(record => {
        const studentId = record.student_id;
        if (!studentStats.has(studentId)) {
          studentStats.set(studentId, {
            totalSessions: 0,
            present: 0,
            lastPresent: null
          });
        }
        
        const stats = studentStats.get(studentId)!;
        stats.totalSessions += 1;
        
        if (record.status === 'present') {
          stats.present += 1;
          stats.lastPresent = record.created_at;
        }
      });
      
      // Get student info for those with low attendance
      const lowAttendanceStudentIds = Array.from(studentStats.entries())
        .filter(([_, stats]) => {
          const percentage = stats.totalSessions > 0 ? (stats.present / stats.totalSessions) * 100 : 0;
          return percentage < threshold;
        })
        .map(([studentId]) => studentId);
      
      if (lowAttendanceStudentIds.length === 0) {
        setLowAttendanceData({
          students: [],
          summary: { critical: 0, warning: 0, threshold }
        });
        return;
      }
      
      let studentsQuery = supabase
        .from('students')
        .select('id, name, student_id, course_id')
        .in('id', lowAttendanceStudentIds);
        
      if (collegeId) {
        studentsQuery = studentsQuery.eq('college_id', collegeId);
      }
      
      const { data: studentsData, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;
      
      // Fetch course names
      const courseIds = [...new Set(studentsData?.map(s => s.course_id) || [])];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);
      
      const studentsMap = new Map(studentsData?.map(s => [s.id, s]) || []);
      const coursesMap = new Map(coursesData?.map(c => [c.id, c.name]) || []);
      
      const students = lowAttendanceStudentIds.map(studentId => {
        const student = studentsMap.get(studentId);
        const stats = studentStats.get(studentId)!;
        const attendancePercentage = stats.totalSessions > 0 ? (stats.present / stats.totalSessions) * 100 : 0;
        const courseName = student ? coursesMap.get(student.course_id) || 'Unknown Course' : 'Unknown Course';
        
        return {
          student_id: studentId,
          student_name: student?.name || 'Unknown',
          student_number: student?.student_id || 'N/A',
          course_name: courseName,
          attendance_percentage: Number(attendancePercentage.toFixed(1)),
          risk_level: (attendancePercentage < 60 ? 'critical' : 'warning') as 'critical' | 'warning',
          total_sessions: stats.totalSessions,
          present_count: stats.present,
          last_present: stats.lastPresent
        };
      }).sort((a, b) => a.attendance_percentage - b.attendance_percentage);
      
      const critical = students.filter(s => s.risk_level === 'critical').length;
      const warning = students.filter(s => s.risk_level === 'warning').length;
      
      setLowAttendanceData({
        students,
        summary: { critical, warning, threshold }
      });
      
    } catch (error) {
      console.error('Error fetching low attendance alert:', error);
      toast({
        title: "Error",
        description: "Failed to fetch low attendance alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    dailyData,
    studentData,
    courseData,
    lowAttendanceData,
    fetchDailyReport,
    fetchStudentReport,
    fetchLowAttendanceAlert
  };
};
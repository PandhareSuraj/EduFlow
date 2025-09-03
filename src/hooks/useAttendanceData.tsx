import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AttendanceStats {
  todayClasses: number;
  averageAttendance: number;
  presentToday: number;
  absentToday: number;
}

interface TodaySession {
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
}

interface StudentAttendanceSummary {
  student_id: number;
  student_name: string;
  student_number: string;
  course_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
}

export function useAttendanceData() {
  const [stats, setStats] = useState<AttendanceStats>({
    todayClasses: 0,
    averageAttendance: 0,
    presentToday: 0,
    absentToday: 0
  });
  
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [studentSummaries, setStudentSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('attendance-data')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_sessions'
        },
        () => fetchAttendanceData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        () => fetchAttendanceData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTodaysSessions(),
        fetchAttendanceStats(),
        fetchStudentSummaries()
      ]);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysSessions = async () => {
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch attendance sessions
      let sessionQuery = supabase
        .from('attendance_sessions')
        .select('*')
        .eq('session_date', today)
        .order('start_time');
        
      if (collegeId) {
        sessionQuery = sessionQuery.eq('college_id', collegeId);
      }
      
      const { data: sessionsData, error: sessionsError } = await sessionQuery;
      if (sessionsError) throw sessionsError;
      
      if (!sessionsData || sessionsData.length === 0) {
        setTodaySessions([]);
        return;
      }
      
      // Fetch subject and faculty info separately
      const subjectIds = [...new Set(sessionsData.map(s => s.subject_id))];
      const facultyIds = [...new Set(sessionsData.map(s => s.faculty_id))];
      
      const [subjectsResponse, facultyResponse] = await Promise.all([
        supabase.from('subjects').select('id, name').in('id', subjectIds),
        supabase.from('faculty').select('id, name').in('id', facultyIds)
      ]);
      
      const subjectsMap = new Map((subjectsResponse.data || []).map(s => [s.id, s.name]));
      const facultyMap = new Map((facultyResponse.data || []).map(f => [f.id, f.name]));
      
      const sessions: TodaySession[] = sessionsData.map(session => ({
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
      
      setTodaySessions(sessions);
    } catch (error) {
      console.error('Error fetching today sessions:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's stats
      let todayQuery = supabase
        .from('attendance_sessions')
        .select('total_students, present_count, absent_count, attendance_percentage')
        .eq('session_date', today);
        
      if (collegeId) {
        todayQuery = todayQuery.eq('college_id', collegeId);
      }
      
      const { data: todayData, error: todayError } = await todayQuery;
      if (todayError) throw todayError;
      
      // Calculate today's totals
      const todayStats = (todayData || []).reduce((acc, session) => ({
        classes: acc.classes + 1,
        totalStudents: acc.totalStudents + (session.total_students || 0),
        presentStudents: acc.presentStudents + (session.present_count || 0),
        absentStudents: acc.absentStudents + (session.absent_count || 0)
      }), { classes: 0, totalStudents: 0, presentStudents: 0, absentStudents: 0 });
      
      // Get overall average attendance
      let avgQuery = supabase
        .from('attendance_sessions')
        .select('attendance_percentage')
        .not('attendance_percentage', 'is', null);
        
      if (collegeId) {
        avgQuery = avgQuery.eq('college_id', collegeId);
      }
      
      const { data: avgData, error: avgError } = await avgQuery;
      if (avgError) throw avgError;
      
      const averageAttendance = avgData && avgData.length > 0
        ? avgData.reduce((sum, session) => sum + (session.attendance_percentage || 0), 0) / avgData.length
        : 0;
      
      setStats({
        todayClasses: todayStats.classes,
        averageAttendance: Number(averageAttendance.toFixed(1)),
        presentToday: todayStats.presentStudents,
        absentToday: todayStats.absentStudents
      });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const fetchStudentSummaries = async () => {
    try {
      const { data: collegeId } = await supabase.rpc('get_user_college');
      
      // Get attendance records
      let recordsQuery = supabase
        .from('attendance_records')
        .select('student_id, status');
        
      if (collegeId) {
        recordsQuery = recordsQuery.eq('college_id', collegeId);
      }
      
      const { data: recordsData, error: recordsError } = await recordsQuery;
      if (recordsError) throw recordsError;
      
      if (!recordsData || recordsData.length === 0) {
        setStudentSummaries([]);
        return;
      }
      
      // Get unique student IDs
      const studentIds = [...new Set(recordsData.map(r => r.student_id))];
      
      // Fetch student info
      let studentsQuery = supabase
        .from('students')
        .select('id, name, student_id, course_id')
        .in('id', studentIds);
        
      if (collegeId) {
        studentsQuery = studentsQuery.eq('college_id', collegeId);
      }
      
      const { data: studentsData, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;
      
      // Fetch course info
      const courseIds = [...new Set(studentsData?.map(s => s.course_id) || [])];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name')
        .in('id', courseIds);
      
      // Create maps for quick lookup
      const studentsMap = new Map(studentsData?.map(s => [s.id, s]) || []);
      const coursesMap = new Map(coursesData?.map(c => [c.id, c.name]) || []);
      
      // Group records by student and calculate stats
      const studentRecordsMap = new Map<number, string[]>();
      
      recordsData.forEach(record => {
        const studentId = record.student_id;
        if (!studentRecordsMap.has(studentId)) {
          studentRecordsMap.set(studentId, []);
        }
        studentRecordsMap.get(studentId)?.push(record.status);
      });
      
      // Calculate summaries
      const summaries: StudentAttendanceSummary[] = Array.from(studentRecordsMap.entries()).map(([studentId, records]) => {
        const student = studentsMap.get(studentId);
        const courseName = student ? coursesMap.get(student.course_id) || 'Unknown Course' : 'Unknown Course';
        
        const totalSessions = records.length;
        const presentCount = records.filter(status => status === 'present').length;
        const absentCount = records.filter(status => status === 'absent').length;
        const lateCount = records.filter(status => status === 'late').length;
        const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
        
        return {
          student_id: studentId,
          student_name: student?.name || 'Unknown',
          student_number: student?.student_id || 'N/A',
          course_name: courseName,
          total_sessions: totalSessions,
          present_count: presentCount,
          absent_count: absentCount,
          late_count: lateCount,
          attendance_percentage: Number(attendancePercentage.toFixed(1))
        };
      });
      
      setStudentSummaries(summaries.sort((a, b) => a.student_name.localeCompare(b.student_name)));
    } catch (error) {
      console.error('Error fetching student summaries:', error);
    }
  };

  return {
    stats,
    todaySessions,
    studentSummaries,
    loading,
    refreshData: fetchAttendanceData
  };
}
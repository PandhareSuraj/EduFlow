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
      
      let query = supabase
        .from('attendance_sessions')
        .select(`
          id,
          class_name,
          start_time,
          total_students,
          present_count,
          absent_count,
          attendance_percentage,
          status,
          subjects!inner(name),
          faculty!inner(name)
        `)
        .eq('session_date', today)
        .order('start_time');
        
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const sessions: TodaySession[] = (data || []).map(session => ({
        id: session.id,
        class_name: session.class_name,
        subject_name: session.subjects?.name || 'Unknown Subject',
        faculty_name: session.faculty?.name || 'Unknown Faculty',
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
      
      // Get attendance records with student and course info
      let query = supabase
        .from('attendance_records')
        .select(`
          student_id,
          status,
          students!inner(name, student_id, course_id),
          courses!inner(name)
        `);
        
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Group by student and calculate stats
      const studentMap = new Map<number, {
        name: string;
        student_number: string;
        course_name: string;
        records: string[];
      }>();
      
      (data || []).forEach(record => {
        const studentId = record.student_id;
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            name: record.students?.name || 'Unknown',
            student_number: record.students?.student_id || 'N/A',
            course_name: record.courses?.name || 'Unknown Course',
            records: []
          });
        }
        studentMap.get(studentId)?.records.push(record.status);
      });
      
      // Calculate summaries
      const summaries: StudentAttendanceSummary[] = Array.from(studentMap.entries()).map(([studentId, data]) => {
        const totalSessions = data.records.length;
        const presentCount = data.records.filter(status => status === 'present').length;
        const absentCount = data.records.filter(status => status === 'absent').length;
        const lateCount = data.records.filter(status => status === 'late').length;
        const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
        
        return {
          student_id: studentId,
          student_name: data.name,
          student_number: data.student_number,
          course_name: data.course_name,
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
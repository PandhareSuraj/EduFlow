import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  count: number;
  type: 'warning' | 'error' | 'info' | 'success';
  action?: string;
}

export function useDashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_fees'
        },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        () => fetchNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams'
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const notifications: Notification[] = [];

      // Check for students with pending fees
      const { data: pendingFees, count: pendingFeesCount } = await supabase
        .from('student_fees')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (pendingFeesCount && pendingFeesCount > 0) {
        notifications.push({
          id: 'pending-fees',
          title: 'Fee Reminders',
          message: 'students have pending fees',
          count: pendingFeesCount,
          type: 'warning',
          action: 'View Fees'
        });
      }

      // Check for students with low attendance (less than 75%)
      const { data: lowAttendanceData } = await supabase
        .from('students')
        .select(`
          id,
          name,
          attendance_records!attendance_records_student_id_fkey(status)
        `);

      let lowAttendanceCount = 0;
      if (lowAttendanceData) {
        lowAttendanceData.forEach((student: any) => {
          if (student.attendance_records && student.attendance_records.length > 0) {
            const presentCount = student.attendance_records.filter((record: any) => record.status === 'present').length;
            const totalCount = student.attendance_records.length;
            const attendancePercentage = (presentCount / totalCount) * 100;
            
            if (attendancePercentage < 75) {
              lowAttendanceCount++;
            }
          }
        });
      }

      if (lowAttendanceCount > 0) {
        notifications.push({
          id: 'low-attendance',
          title: 'Low Attendance',
          message: 'students below 75% attendance',
          count: lowAttendanceCount,
          type: 'error',
          action: 'View Attendance'
        });
      }

      // Check for upcoming exams (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcomingExams, count: upcomingExamsCount } = await supabase
        .from('exams')
        .select('id', { count: 'exact' })
        .gte('exam_date', new Date().toISOString().split('T')[0])
        .lte('exam_date', nextWeek.toISOString().split('T')[0])
        .eq('status', 'scheduled');

      if (upcomingExamsCount && upcomingExamsCount > 0) {
        notifications.push({
          id: 'upcoming-exams',
          title: 'Upcoming Exams',
          message: 'exams scheduled in next 7 days',
          count: upcomingExamsCount,
          type: 'info',
          action: 'View Exams'
        });
      }

      // Check for recent course completions (potential certificate candidates)
      const { data: recentGraduates, count: certificatePendingCount } = await supabase
        .from('students')
        .select('id', { count: 'exact' })
        .eq('status', 'completed')
        .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (certificatePendingCount && certificatePendingCount > 0) {
        notifications.push({
          id: 'certificates-pending',
          title: 'Certificates Pending',
          message: 'course completion certificates to issue',
          count: certificatePendingCount,
          type: 'info',
          action: 'Issue Certificates'
        });
      }

      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return { notifications, loading, refetch: fetchNotifications };
}
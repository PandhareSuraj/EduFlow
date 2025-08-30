import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Activity {
  id: string;
  student: string;
  action: string;
  course: string;
  time: string;
  type: 'admission' | 'payment' | 'attendance' | 'exam' | 'id-card';
  created_at: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const activities: Activity[] = [];

      // Fetch recent student admissions
      const { data: recentStudents } = await supabase
        .from('students')
        .select('id, name, created_at, courses(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentStudents) {
        recentStudents.forEach((student: any) => {
          activities.push({
            id: `admission-${student.id}`,
            student: student.name,
            action: 'New Admission',
            course: student.courses?.name || 'Unknown Course',
            time: formatTimeAgo(student.created_at),
            type: 'admission',
            created_at: student.created_at
          });
        });
      }

      // Fetch recent fee payments
      const { data: recentPayments } = await supabase
        .from('fee_payments')
        .select('id, created_at, amount, students(name, courses(name))')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentPayments) {
        recentPayments.forEach((payment: any) => {
          activities.push({
            id: `payment-${payment.id}`,
            student: payment.students?.name || 'Unknown Student',
            action: `Fee Payment ₹${payment.amount}`,
            course: payment.students?.courses?.name || 'Unknown Course',
            time: formatTimeAgo(payment.created_at),
            type: 'payment',
            created_at: payment.created_at
          });
        });
      }

      // Fetch recent attendance sessions
      const { data: recentAttendance } = await supabase
        .from('attendance_sessions')
        .select('id, created_at, class_name, courses(name), total_students')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentAttendance) {
        recentAttendance.forEach((session: any) => {
          activities.push({
            id: `attendance-${session.id}`,
            student: `${session.total_students || 0} students`,
            action: 'Attendance Marked',
            course: session.courses?.name || session.class_name || 'Class',
            time: formatTimeAgo(session.created_at),
            type: 'attendance',
            created_at: session.created_at
          });
        });
      }

      // Sort all activities by creation time
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(activities.slice(0, 6)); // Show only latest 6 activities
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return { activities, loading, refetch: fetchRecentActivities };
}
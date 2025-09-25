import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BookOpen,
  IndianRupee
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { useDashboardNotifications } from '@/hooks/useDashboardNotifications';

interface AdminStats {
  totalStudents: number;
  activeCourses: number;
  facultyMembers: number;
  monthlyRevenue: string;
  pendingFees: number;
  attendanceRate: number;
  activeExams: number;
  libraryBooks: number;
}

interface PendingAction {
  id: string;
  type: 'fee' | 'admission' | 'exam' | 'attendance';
  title: string;
  description: string;
  count: number;
  urgency: 'high' | 'medium' | 'low';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeCourses: 0,
    facultyMembers: 0,
    monthlyRevenue: "₹0",
    pendingFees: 0,
    attendanceRate: 0,
    activeExams: 0,
    libraryBooks: 0
  });
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useDashboardNotifications();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data in parallel
      const [
        studentsResult,
        coursesResult,
        facultyResult,
        feePaymentsResult,
        pendingFeesResult,
        examsResult,
        booksResult,
        attendanceResult
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('courses').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('faculty').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('fee_payments').select('amount, payment_date')
          .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .lte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]),
        supabase.from('student_fees').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('exams').select('id', { count: 'exact' }).eq('status', 'scheduled'),
        supabase.from('books').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('attendance_records').select('status')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Calculate monthly revenue
      const monthlyRevenue = feePaymentsResult.data?.reduce((total, payment) => total + (payment.amount || 0), 0) || 0;
      
      // Calculate attendance rate
      const totalAttendance = attendanceResult.data?.length || 0;
      const presentCount = attendanceResult.data?.filter(record => record.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      setStats({
        totalStudents: studentsResult.count || 0,
        activeCourses: coursesResult.count || 0,
        facultyMembers: facultyResult.count || 0,
        monthlyRevenue: `₹${monthlyRevenue.toLocaleString()}`,
        pendingFees: pendingFeesResult.count || 0,
        attendanceRate,
        activeExams: examsResult.count || 0,
        libraryBooks: booksResult.count || 0
      });

      // Generate pending actions from notifications and data
      const actions: PendingAction[] = [];
      
      if (pendingFeesResult.count && pendingFeesResult.count > 0) {
        actions.push({
          id: 'pending-fees',
          type: 'fee',
          title: 'Pending Fee Collections',
          description: `${pendingFeesResult.count} students have pending fees`,
          count: pendingFeesResult.count,
          urgency: pendingFeesResult.count > 50 ? 'high' : 'medium'
        });
      }

      if (attendanceRate < 75) {
        actions.push({
          id: 'low-attendance',
          type: 'attendance',
          title: 'Low Attendance Alert',
          description: `Overall attendance is ${attendanceRate}%`,
          count: 1,
          urgency: 'high'
        });
      }

      if (examsResult.count && examsResult.count > 0) {
        actions.push({
          id: 'upcoming-exams',
          type: 'exam',
          title: 'Upcoming Exams',
          description: `${examsResult.count} exams scheduled`,
          count: examsResult.count,
          urgency: 'medium'
        });
      }

      setPendingActions(actions);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleActionClick = (action: PendingAction) => {
    switch (action.type) {
      case 'fee':
        window.location.href = '/fees';
        break;
      case 'attendance':
        window.location.href = '/attendance';
        break;
      case 'exam':
        window.location.href = '/exams';
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-header rounded-lg p-4 sm:p-6 text-white shadow-header">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
          College Administration Dashboard
        </h1>
        <p className="text-white/90 text-sm sm:text-base">
          Monitor and manage all aspects of your institution
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={loading ? "..." : stats.totalStudents.toLocaleString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatsCard
          title="Active Courses"
          value={loading ? "..." : stats.activeCourses.toString()}
          icon={GraduationCap}
          trend={{ value: 8, isPositive: true }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatsCard
          title="Monthly Revenue"
          value={loading ? "..." : stats.monthlyRevenue}
          icon={IndianRupee}
          trend={{ value: 15, isPositive: true }}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
        />
        <StatsCard
          title="Faculty Members"
          value={loading ? "..." : stats.facultyMembers.toString()}
          icon={UserCheck}
          trend={{ value: 4, isPositive: true }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pending Fees"
          value={loading ? "..." : stats.pendingFees.toString()}
          icon={CreditCard}
          trend={{ value: -5, isPositive: false }}
          className={stats.pendingFees > 0 ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900" : ""}
        />
        <StatsCard
          title="Attendance Rate"
          value={loading ? "..." : `${stats.attendanceRate}%`}
          icon={CheckCircle}
          trend={{ value: 2, isPositive: true }}
          className={stats.attendanceRate < 75 ? "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900" : ""}
        />
        <StatsCard
          title="Active Exams"
          value={loading ? "..." : stats.activeExams.toString()}
          icon={BookOpen}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Library Books"
          value={loading ? "..." : stats.libraryBooks.toString()}
          icon={BookOpen}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <QuickActions userRole="admin" className="lg:col-span-1" />
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Pending Actions and Upcoming Events */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Pending Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingActions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">All caught up! No pending actions.</p>
              </div>
            ) : (
              pendingActions.map((action) => (
                <div 
                  key={action.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${getUrgencyColor(action.urgency)}`}
                  onClick={() => handleActionClick(action)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{action.title}</h4>
                    <Badge variant="secondary">{action.count}</Badge>
                  </div>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <UpcomingEventsCard />
      </div>
    </div>
  );
}
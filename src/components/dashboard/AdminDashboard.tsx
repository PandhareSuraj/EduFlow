import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { useNavigate } from "react-router-dom";
import { 
  UserActivityWidget, 
  FinancialInsightsWidget, 
  AcademicOverviewWidget, 
  UserManagementWidget 
} from "@/components/dashboard/admin";

interface PendingAction {
  id: string;
  type: 'fee' | 'admission' | 'exam' | 'attendance';
  title: string;
  description: string;
  count: number;
  urgency: 'high' | 'medium' | 'low';
}

export function AdminDashboard() {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingActions();
  }, []);

  const fetchPendingActions = async () => {
    try {
      setLoading(true);

      const [pendingFeesResult, attendanceResult, examsResult] = await Promise.all([
        supabase.from('student_fees').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('attendance_records').select('status')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('exams').select('id', { count: 'exact' }).eq('status', 'scheduled')
      ]);

      const totalAttendance = attendanceResult.data?.length || 0;
      const presentCount = attendanceResult.data?.filter(r => r.status === 'present').length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

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

      if (attendanceRate < 75 && totalAttendance > 0) {
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
        navigate('/fees');
        break;
      case 'attendance':
        navigate('/attendance');
        break;
      case 'exam':
        navigate('/exams');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Recent Activity */}
      <RecentActivity />

      {/* Role-Specific Feature Widgets - 2 per row for readability */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <UserActivityWidget />
        <FinancialInsightsWidget />
        <AcademicOverviewWidget />
        <UserManagementWidget />
      </div>

      {/* Pending Actions and Upcoming Events */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-card" data-tour="pending-actions">
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

        <UpcomingEventsCard />
      </div>
    </div>
  );
}

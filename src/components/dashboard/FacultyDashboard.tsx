import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ClipboardCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentFaculty } from "@/hooks/useCurrentFaculty";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useToast } from "@/hooks/use-toast";
import { AttendanceMarkingDialog } from "@/components/attendance/AttendanceMarkingDialog";

interface FacultyStats {
  totalClasses: number;
  todayClasses: number;
  totalStudents: number;
  assignedSubjects: number;
  pendingEvaluations: number;
  averageAttendance: number;
}

interface TodayClass {
  id: string;
  subject: string;
  course: string;
  time: string;
  room: string;
  studentCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'assignment' | 'exam' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export function FacultyDashboard() {
  const { currentFaculty, loading: facultyLoading } = useCurrentFaculty();
  const { toast } = useToast();
  const [stats, setStats] = useState<FacultyStats>({
    totalClasses: 0,
    todayClasses: 0,
    totalStudents: 0,
    assignedSubjects: 0,
    pendingEvaluations: 0,
    averageAttendance: 0
  });
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);

  useEffect(() => {
    if (currentFaculty) {
      fetchFacultyData();
    }
  }, [currentFaculty]);

  const fetchFacultyData = async () => {
    if (!currentFaculty) return;
    
    try {
      setLoading(true);
      
      // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
      const currentDay = new Date().getDay();
      const currentTime = new Date();
      
      // Fetch today's classes
      const { data: todayClassesData } = await supabase
        .from('class_schedules')
        .select(`
          id,
          class_name,
          room_number,
          start_time,
          end_time,
          course_id,
          subject_id
        `)
        .eq('faculty_id', currentFaculty.id)
        .eq('day_of_week', currentDay)
        .eq('status', 'active');

      // Fetch all classes for stats
      const { data: allClassesData } = await supabase
        .from('class_schedules')
        .select('id, course_id')
        .eq('faculty_id', currentFaculty.id)
        .eq('status', 'active');

      // Get unique courses and student counts
      const courseIds = [...new Set(allClassesData?.map(c => c.course_id) || [])];
      let totalStudents = 0;
      
      if (courseIds.length > 0) {
        const { data: studentCounts } = await supabase
          .from('students')
          .select('course_id')
          .in('course_id', courseIds)
          .eq('status', 'active');
        
        totalStudents = studentCounts?.length || 0;
      }

      // Calculate recent attendance percentage
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: recentAttendance } = await supabase
        .from('attendance_sessions')
        .select('attendance_percentage')
        .eq('faculty_id', currentFaculty.id)
        .gte('created_at', thirtyDaysAgo);

      const avgAttendance = recentAttendance && recentAttendance.length > 0
        ? Math.round(recentAttendance.reduce((sum, session) => sum + (session.attendance_percentage || 0), 0) / recentAttendance.length)
        : 0;

      // Process today's classes
      const processedClasses: TodayClass[] = (todayClassesData || []).map(cls => {
        const startTime = new Date(`1970-01-01T${cls.start_time}`);
        const endTime = new Date(`1970-01-01T${cls.end_time}`);
        const currentTimeOnly = new Date(`1970-01-01T${currentTime.toTimeString().slice(0, 8)}`);
        
        let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
        if (currentTimeOnly >= startTime && currentTimeOnly <= endTime) {
          status = 'ongoing';
        } else if (currentTimeOnly > endTime) {
          status = 'completed';
        }

        return {
          id: cls.id,
          subject: cls.class_name || 'Unknown Subject',
          course: 'Course Name',
          time: cls.start_time.slice(0, 5), // Format as HH:MM
          room: cls.room_number || 'TBA',
          studentCount: Math.floor(Math.random() * 30) + 15, // This would be calculated from actual enrollments
          status
        };
      });

      // Mock recent activities (would be replaced with real data)
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'attendance',
          title: 'Attendance Marked',
          description: `Marked attendance for ${processedClasses[0]?.course || 'Morning Class'}`,
          timestamp: '2 hours ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'exam',
          title: 'Exam Scheduled',
          description: 'Mid-term exam scheduled for next week',
          timestamp: '1 day ago',
          status: 'pending'
        },
        {
          id: '3',
          type: 'assignment',
          title: 'Assignment Submitted',
          description: '15 students submitted assignments',
          timestamp: '2 days ago',
          status: 'review'
        }
      ];

      setStats({
        totalClasses: allClassesData?.length || 0,
        todayClasses: processedClasses.length,
        totalStudents,
        assignedSubjects: currentFaculty.designation ? 1 : 0, // This would be calculated from actual subject assignments
        pendingEvaluations: Math.floor(Math.random() * 10) + 5,
        averageAttendance: avgAttendance
      });

      setTodayClasses(processedClasses);
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'attendance': return <Users className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'exam': return <BookOpen className="h-4 w-4" />;
      case 'announcement': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'review': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getClassStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-success text-success-foreground';
      case 'upcoming': return 'bg-primary text-primary-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (facultyLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentFaculty) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No faculty profile found. Please contact administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-header rounded-lg p-4 sm:p-6 text-white shadow-header">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
          Welcome back, {currentFaculty.name}
        </h1>
        <p className="text-white/90 text-sm sm:text-base">
          {currentFaculty.designation} • {currentFaculty.department}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Today's Classes"
          value={stats.todayClasses.toString()}
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatsCard
          title="Average Attendance"
          value={`${stats.averageAttendance}%`}
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
          className={stats.averageAttendance >= 80 ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900" : "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setMarkAttendanceOpen(true)}
                className="hover:shadow-sm"
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            ) : (
              todayClasses.map((cls) => (
                <div key={cls.id} className="flex justify-between items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{cls.subject}</h4>
                      <Badge className={getClassStatusColor(cls.status)}>
                        {cls.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{cls.course} • Room {cls.room}</p>
                    <p className="text-sm text-muted-foreground">{cls.studentCount} students</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{cls.time}</p>
                    <p className="text-sm text-muted-foreground">60 min</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions userRole="teacher" className="lg:col-span-1" />
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{activity.title}</h4>
                  {activity.status && (
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hidden Attendance Dialog */}
      <div className="hidden">
        <AttendanceMarkingDialog />
      </div>
    </div>
  );
}
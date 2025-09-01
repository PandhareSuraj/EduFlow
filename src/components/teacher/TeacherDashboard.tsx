import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, BookOpen, FileText, Award, Bell, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeacherStats {
  totalClasses: number;
  todayClasses: number;
  totalStudents: number;
  assignedSubjects: number;
  pendingEvaluations: number;
  averageAttendance: number;
}

interface UpcomingClass {
  id: string;
  subject: string;
  course: string;
  time: string;
  duration: string;
  room: string;
  studentCount: number;
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'assignment' | 'exam' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    todayClasses: 0,
    totalStudents: 0,
    assignedSubjects: 0,
    pendingEvaluations: 0,
    averageAttendance: 0
  });
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, [user]);

  const fetchTeacherData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get teacher's faculty record
      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!facultyData) {
        toast({
          title: "Access Denied",
          description: "No faculty record found for your account.",
          variant: "destructive"
        });
        return;
      }

      // Get teacher's classes for today
      const today = new Date().toISOString().split('T')[0];
      const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const { data: todayClasses } = await supabase
        .from('class_schedules')
        .select(`
          id, class_name, room_number, start_time, end_time,
          course:courses(name, code),
          subject:subjects(name, code)
        `)
        .eq('faculty_id', facultyData.id)
        .eq('day_of_week', currentDay);

      // Get all classes for stats
      const { data: allClasses } = await supabase
        .from('class_schedules')
        .select('id, course_id')
        .eq('faculty_id', facultyData.id);

      // Get unique courses and student counts
      const courseIds = [...new Set(allClasses?.map(c => c.course_id) || [])];
      let totalStudents = 0;
      
      if (courseIds.length > 0) {
        const { data: studentCounts } = await supabase
          .from('students')
          .select('course_id')
          .in('course_id', courseIds)
          .eq('status', 'active');
        
        totalStudents = studentCounts?.length || 0;
      }

      // Get assigned subjects
      const assignedSubjects = facultyData.subjects?.length || 0;

      // Mock data for other stats and activities
      const teacherStats: TeacherStats = {
        totalClasses: allClasses?.length || 0,
        todayClasses: todayClasses?.length || 0,
        totalStudents,
        assignedSubjects,
        pendingEvaluations: Math.floor(Math.random() * 10) + 5,
        averageAttendance: Math.floor(Math.random() * 20) + 75
      };

      const upcoming: UpcomingClass[] = (todayClasses || []).map(cls => ({
        id: cls.id,
        subject: cls.subject?.name || 'Unknown Subject',
        course: cls.course?.name || 'Unknown Course',
        time: cls.start_time,
        duration: '60 min', // Calculate from start_time to end_time
        room: cls.room_number || 'TBA',
        studentCount: Math.floor(Math.random() * 30) + 15
      }));

      // Mock recent activities
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'attendance',
          title: 'Attendance Marked',
          description: 'Marked attendance for DMLT Semester 2 - Pathology',
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
          description: '15 students submitted Lab Report Assignment',
          timestamp: '2 days ago',
          status: 'review'
        }
      ];

      setStats(teacherStats);
      setUpcomingClasses(upcoming);
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error fetching teacher data:', error);
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
      case 'announcement': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your teaching overview</p>
        </div>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          Quick Actions
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.todayClasses}</div>
            <p className="text-xs text-muted-foreground">Total: {stats.totalClasses} classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across {stats.assignedSubjects} subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.averageAttendance >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {stats.averageAttendance}%
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingEvaluations}</div>
            <p className="text-xs text-muted-foreground">Assignments & exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assignedSubjects}</div>
            <p className="text-xs text-muted-foreground">Active subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">3</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your upcoming classes and sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No classes scheduled for today</p>
              </div>
            ) : (
              upcomingClasses.map((cls) => (
                <div key={cls.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">{cls.subject}</h4>
                    <p className="text-sm text-muted-foreground">{cls.course} • Room {cls.room}</p>
                    <p className="text-sm text-muted-foreground">{cls.studentCount} students</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{cls.time}</p>
                    <p className="text-sm text-muted-foreground">{cls.duration}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common teaching tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex-col">
              <Users className="h-6 w-6 mb-1" />
              Mark Attendance
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <FileText className="h-6 w-6 mb-1" />
              Create Assignment
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <BookOpen className="h-6 w-6 mb-1" />
              Schedule Exam
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Award className="h-6 w-6 mb-1" />
              Grade Papers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp,
  Calendar,
  DollarSign,
  UserCheck,
  ClipboardCheck,
  Building2,
  IndianRupee,
  TrendingDown,
  Activity
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useBranding } from "@/hooks/useBranding";
import { useDashboardNotifications } from '@/hooks/useDashboardNotifications';
import { useAMCConfig } from '@/hooks/useAMCConfig';
import { AddStudentDialog } from "@/components/forms/StudentDialogs";
import { CollectFeeDialog } from "@/components/forms/CollectFeeDialog";
import { AttendanceMarkingDialog } from "@/components/attendance/AttendanceMarkingDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { AccountantDashboard } from "@/components/dashboard/AccountantDashboard";
import { LibrarianDashboard } from "@/components/dashboard/LibrarianDashboard";
import StudentDashboard from './StudentDashboard';

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  monthlyRevenue: string;
  facultyMembers: number;
  totalColleges?: number;
  totalAMCRevenue?: string;
  totalUsers?: number;
}

interface CollegeAMCData {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  userCount: number;
  amcAmount: number;
  status: 'active' | 'inactive' | 'pending';
  lastPayment?: string;
}

export default function Dashboard() {
  const { userRole } = useAuth();
  const { collegeName } = useBranding();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    monthlyRevenue: "₹0",
    facultyMembers: 0,
  });
  const [collegeAMCData, setCollegeAMCData] = useState<CollegeAMCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingData, setClearingData] = useState(false);
  const { notifications, loading: notificationsLoading } = useDashboardNotifications();
  const { toast } = useToast();
  const { config: amcConfig, calculateAMC } = useAMCConfig();
  
  // Dialog states for Quick Actions
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [collectFeeOpen, setCollectFeeOpen] = useState(false);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);

  useEffect(() => {
    // Only fetch dashboard data for non-student users
    if (userRole !== 'student') {
      fetchDashboardData();
      
      // Set up real-time subscriptions for dashboard stats
      const channel = supabase
        .channel('dashboard-stats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'students'
          },
          () => fetchDashboardData()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'courses'
          },
          () => fetchDashboardData()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'faculty'
          },
          () => fetchDashboardData()
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'colleges'
          },
          () => fetchDashboardData()
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [userRole]);

  // Render student dashboard for student users - AFTER all hooks
  if (userRole === 'student') {
    return <StudentDashboard />;
  }

  const fetchDashboardData = async () => {
    try {
      if (userRole === 'super_admin') {
        // Fetch basic stats and college data for AMC calculation
        const [studentsResult, coursesResult, usersResult, collegesResult, collegeDetails] = await Promise.all([
          supabase.from('students').select('id, college_id', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('user_roles').select('user_id, college_id', { count: 'exact' }),
          supabase.from('colleges').select('id', { count: 'exact' }),
          supabase.from('colleges').select('id, name, code, status')
        ]);

        // Calculate AMC data for each college
        const collegeAMCs: CollegeAMCData[] = [];
        let totalAMCRevenue = 0;

        if (collegeDetails.data) {
          for (const college of collegeDetails.data) {
            // Count students for this college
            const collegeStudents = studentsResult.data?.filter(s => s.college_id === college.id) || [];
            const studentCount = collegeStudents.length;

            // Count users for this college
            const collegeUsers = usersResult.data?.filter(u => u.college_id === college.id) || [];
            const userCount = collegeUsers.length;

            // Calculate AMC amount
            const amcAmount = calculateAMC(studentCount, userCount);
            totalAMCRevenue += amcAmount;

            collegeAMCs.push({
              id: college.id,
              name: college.name,
              code: college.code,
              studentCount,
              userCount,
              amcAmount,
              status: college.status === 'active' ? 'active' : 'inactive',
              lastPayment: 'April 2024' // This would come from a payments table
            });
          }
        }

        setCollegeAMCData(collegeAMCs);
        setStats({
          totalStudents: studentsResult.count || 0,
          activeCourses: coursesResult.count || 0,
          monthlyRevenue: `₹${(totalAMCRevenue / 12).toLocaleString()}`, // Monthly AMC revenue
          facultyMembers: usersResult.count || 0,
          totalColleges: collegesResult.count || 0,
          totalAMCRevenue: `₹${totalAMCRevenue.toLocaleString()}`,
          totalUsers: usersResult.count || 0,
        });
      } else {
        // Fetch data for user's specific college
        const [studentsResult, coursesResult, facultyResult, feePaymentsResult] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase.from('faculty').select('id', { count: 'exact' }),
          supabase.from('fee_payments').select('amount, payment_date')
            .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
            .lte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0])
        ]);

        // Calculate monthly revenue from actual payments
        const monthlyRevenue = feePaymentsResult.data?.reduce((total, payment) => total + (payment.amount || 0), 0) || 0;

        setStats({
          totalStudents: studentsResult.count || 0,
          activeCourses: coursesResult.count || 0,
          monthlyRevenue: `₹${monthlyRevenue.toLocaleString()}`,
          facultyMembers: facultyResult.count || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async (collegeId: string, collegeName: string) => {
    if (!confirm(`Are you sure you want to clear all data for ${collegeName}? This action cannot be undone.`)) {
      return;
    }

    setClearingData(true);
    try {
      const { error } = await supabase.functions.invoke('clean-college-data', {
        body: {
          collegeId: collegeId,
          modules: ['all']
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Data cleared successfully",
        description: `All data for ${collegeName} has been cleared.`,
      });

      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error clearing data",
        description: error.message || "Failed to clear college data.",
        variant: "destructive",
      });
    } finally {
      setClearingData(false);
    }
  };

  const isSuperAdmin = userRole === 'super_admin';

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-header rounded-lg p-4 sm:p-6 text-white shadow-header">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
          {isSuperAdmin ? 'Multi-College Management Dashboard' : `Welcome to ${collegeName} ERP`}
        </h1>
        <p className="text-white/90 text-sm sm:text-base">
          {isSuperAdmin 
            ? 'Manage all colleges and monitor system-wide performance' 
            : 'Manage your institution efficiently with our comprehensive system'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-4'}`}>
        {isSuperAdmin && (
          <>
            <StatsCard
              title="Total Colleges"
              value={stats.totalColleges?.toString() || "0"}
              icon={Building2}
              trend={{ value: 0, isPositive: true }}
            />
            <StatsCard
              title="Total AMC Revenue"
              value={loading ? "..." : stats.totalAMCRevenue || "₹0"}
              icon={IndianRupee}
              trend={{ value: 15, isPositive: true }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
            />
          </>
        )}
        <StatsCard
          title={isSuperAdmin ? "Total Students" : "Total Students"}
          value={loading ? "..." : stats.totalStudents.toLocaleString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={isSuperAdmin ? "System Users" : "Active Courses"}
          value={loading ? "..." : (isSuperAdmin ? stats.totalUsers?.toString() || "0" : stats.activeCourses.toString())}
          icon={isSuperAdmin ? Activity : GraduationCap}
          trend={{ value: isSuperAdmin ? 8 : 0, isPositive: true }}
        />
        <StatsCard
          title={isSuperAdmin ? "Monthly AMC" : "Monthly Revenue"}
          value={loading ? "..." : stats.monthlyRevenue}
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title={isSuperAdmin ? "Active Courses" : "Faculty Members"}
          value={loading ? "..." : (isSuperAdmin ? stats.activeCourses.toString() : stats.facultyMembers.toString())}
          icon={isSuperAdmin ? GraduationCap : UserCheck}
          trend={{ value: 4, isPositive: true }}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              {isSuperAdmin ? (
                <>
                  <button className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left w-full"
                    onClick={() => window.location.href = '/colleges'}>
                    <Building2 className="mr-3 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">College Management</p>
                      <p className="text-sm text-muted-foreground">Manage college portfolios</p>
                    </div>
                  </button>
                  <button className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-left w-full"
                    onClick={() => window.location.href = '/college-performance'}>
                    <TrendingUp className="mr-3 h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium">Performance Monitor</p>
                      <p className="text-sm text-muted-foreground">Track college performance</p>
                    </div>
                  </button>
                  <button className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-colors text-left w-full"
                    onClick={() => window.location.href = '/multi-college-users'}>
                    <UserCheck className="mr-3 h-4 w-4 text-warning" />
                    <div>
                      <p className="font-medium">Multi-College Users</p>
                      <p className="text-sm text-muted-foreground">Manage users across colleges</p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left w-full"
                    onClick={() => setAddStudentOpen(true)}
                  >
                    <Users className="mr-3 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Add New Student</p>
                      <p className="text-sm text-muted-foreground">Register a new student</p>
                    </div>
                  </button>
                  
                  <button 
                    className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-left w-full"
                    onClick={() => setCollectFeeOpen(true)}
                  >
                    <DollarSign className="mr-3 h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium">Collect Fee</p>
                      <p className="text-sm text-muted-foreground">Process fee payment</p>
                    </div>
                  </button>
                  
                  <button 
                    className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-colors text-left w-full"
                    onClick={() => setMarkAttendanceOpen(true)}
                  >
                    <ClipboardCheck className="mr-3 h-4 w-4 text-warning" />
                    <div>
                      <p className="font-medium">Mark Attendance</p>
                      <p className="text-sm text-muted-foreground">Daily attendance entry</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role-based Dashboard Content */}
        <div className="lg:col-span-2">
          {userRole === 'admin' && <AdminDashboard />}
          {userRole === 'teacher' && <FacultyDashboard />}
          {userRole === 'accountant' && <AccountantDashboard />}
          {userRole === 'librarian' && <LibrarianDashboard />}
          {!['admin', 'teacher', 'accountant', 'librarian'].includes(userRole) && <RecentActivity />}
        </div>
      </div>

      {/* College AMC Management for Super Admin OR Events & Alerts for College Admin */}
      {isSuperAdmin ? (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <IndianRupee className="mr-2 h-5 w-5" />
              College AMC Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {collegeAMCData.map((college) => (
                <div key={college.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{college.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {college.code}</p>
                      </div>
                    </div>
                    <Badge variant={college.status === 'active' ? 'default' : 'secondary'}>
                      {college.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{college.studentCount}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">{college.userCount}</p>
                      <p className="text-xs text-muted-foreground">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">₹{college.amcAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Annual AMC</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{college.lastPayment}</p>
                      <p className="text-xs text-muted-foreground">Last Payment</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded flex-1 mr-3">
                      AMC Calculation: Base ₹{amcConfig.baseFee.toLocaleString()} + Students (₹{amcConfig.perStudent} × {college.studentCount}) + Users (₹{amcConfig.perUser} × {college.userCount})
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleClearData(college.id, college.name)}
                      disabled={clearingData}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      {clearingData ? 'Clearing...' : 'Clear Data'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingEventsCard />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-warning">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificationsLoading ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No pending actions at the moment</p>
                    <p className="text-sm text-muted-foreground mt-1">All systems are running smoothly</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                        notification.type === 'warning' ? 'bg-warning/10 border-warning/20' :
                        notification.type === 'error' ? 'bg-destructive/10 border-destructive/20' :
                        notification.type === 'info' ? 'bg-primary/10 border-primary/20' :
                        'bg-success/10 border-success/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${
                            notification.type === 'warning' ? 'text-warning' :
                            notification.type === 'error' ? 'text-destructive' :
                            notification.type === 'info' ? 'text-primary' :
                            'text-success'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">{notification.count}</span> {notification.message}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {notification.action_url ? 'View Details' : 'Info'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Dialog Components */}
      <AddStudentDialog 
        open={addStudentOpen} 
        onOpenChange={setAddStudentOpen}
        onStudentAdded={() => {
          setAddStudentOpen(false);
          fetchDashboardData();
        }} 
      />
      <CollectFeeDialog 
        open={collectFeeOpen} 
        onOpenChange={setCollectFeeOpen}
      />
      <AttendanceMarkingDialog 
        open={markAttendanceOpen} 
        onOpenChange={setMarkAttendanceOpen}
      />
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, TrendingUp, Building2, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function PlacementDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["placement-dashboard-stats"],
    queryFn: async () => {
      const [
        { count: activeJobs },
        { count: totalApplications },
        { count: pendingApplications },
        { count: scheduledInterviews },
        { count: totalPlacements },
        { count: totalCompanies },
        { data: recentApplications },
        { data: upcomingInterviews },
      ] = await Promise.all([
        supabase.from("job_postings").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("student_applications").select("*", { count: "exact", head: true }),
        supabase.from("student_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("interviews").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
        supabase.from("student_placements").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("student_applications").select("*, students(name), job_postings(title, companies(name))").order("created_at", { ascending: false }).limit(5),
        supabase.from("interviews").select("*, students(name), job_postings(title)").eq("status", "scheduled").order("interview_date", { ascending: true }).limit(5),
      ]);

      // Calculate placement rate
      const { count: totalStudents } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const placementRate = totalStudents ? ((totalPlacements || 0) / totalStudents * 100).toFixed(1) : 0;

      // Get average package
      const { data: placements } = await supabase
        .from("student_placements")
        .select("package_amount");
      
      const avgPackage = placements?.length 
        ? (placements.reduce((sum, p) => sum + (p.package_amount || 0), 0) / placements.length).toFixed(2)
        : 0;

      return {
        activeJobs: activeJobs || 0,
        totalApplications: totalApplications || 0,
        pendingApplications: pendingApplications || 0,
        scheduledInterviews: scheduledInterviews || 0,
        totalPlacements: totalPlacements || 0,
        totalCompanies: totalCompanies || 0,
        placementRate,
        avgPackage,
        recentApplications: recentApplications || [],
        upcomingInterviews: upcomingInterviews || [],
      };
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["monthly-placement-data"],
    queryFn: async () => {
      const { data } = await supabase
        .from("student_applications")
        .select("created_at")
        .order("created_at", { ascending: true });

      const monthCounts: Record<string, number> = {};
      data?.forEach(app => {
        const month = new Date(app.created_at).toLocaleString('default', { month: 'short' });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
    },
  });

  const { data: jobTypeData } = useQuery({
    queryKey: ["job-type-distribution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("job_postings")
        .select("job_type");

      const typeCounts: Record<string, number> = {};
      data?.forEach(job => {
        typeCounts[job.job_type] = (typeCounts[job.job_type] || 0) + 1;
      });

      return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    },
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Jobs"
          value={stats?.activeJobs || 0}
          icon={Briefcase}
        />
        <StatsCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          icon={Users}
        />
        <StatsCard
          title="Placement Rate"
          value={`${stats?.placementRate || 0}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Avg Package"
          value={`₹${stats?.avgPackage || 0} LPA`}
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.scheduledInterviews || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPlacements || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobTypeData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobTypeData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentApplications.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent applications</p>
              )}
              {stats?.recentApplications.map((app: any) => (
                <div key={app.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{app.students?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Applied for {app.job_postings?.title} at {app.job_postings?.companies?.name}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'selected' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.upcomingInterviews.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming interviews</p>
              )}
              {stats?.upcomingInterviews.map((interview: any) => (
                <div key={interview.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{interview.students?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {interview.job_postings?.title} - {new Date(interview.interview_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

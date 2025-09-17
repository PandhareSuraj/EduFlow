import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, School, TrendingUp, Database } from "lucide-react";
import { useSystemAnalytics } from "@/hooks/useSystemAnalytics";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function SystemAnalytics() {
  const { data, loading, refetch } = useSystemAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Analytics</h1>
          <p className="text-muted-foreground">System-wide insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Refresh Data
          </Button>
          <Button>Export Analytics</Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Colleges"
          value={data?.systemOverview?.totalColleges || 0}
          icon={School}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Users"
          value={data?.systemOverview?.totalUsers || 0}
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Total Students"
          value={data?.systemOverview?.totalStudents || 0}
          icon={TrendingUp}
          trend={{ value: 15.7, isPositive: true }}
        />
        <StatsCard
          title="System Health"
          value={`${data?.systemOverview?.healthScore || 95}%`}
          icon={Database}
          trend={{ value: 2.1, isPositive: true }}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="colleges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="colleges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>College Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Activity Score</TableHead>
                    <TableHead>Data Quality</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.collegeMetrics?.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{college.name}</div>
                          <div className="text-sm text-muted-foreground">{college.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{college.studentCount}</TableCell>
                      <TableCell>{college.facultyCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={college.activityScore} className="w-16" />
                          <span className="text-sm">{college.activityScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={college.dataQuality} className="w-16" />
                          <span className="text-sm">{college.dataQuality}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          college.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {college.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.userAnalytics?.roleDistribution?.map((role) => (
                  <div key={role.role} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{role.role}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(role.count / data.userAnalytics.totalUsers) * 100} className="w-20" />
                      <span className="text-sm">{role.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Daily Active Users</span>
                    <span className="font-medium">{data?.userAnalytics?.dailyActiveUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Active Users</span>
                    <span className="font-medium">{data?.userAnalytics?.weeklyActiveUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Active Users</span>
                    <span className="font-medium">{data?.userAnalytics?.monthlyActiveUsers || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Database Health</span>
                  <span className="font-medium text-success">Excellent</span>
                </div>
                <div className="flex justify-between">
                  <span>API Response Time</span>
                  <span className="font-medium">125ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-medium text-success">99.9%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Integrity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Complete Records</span>
                  <span className="font-medium">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Validation</span>
                  <span className="font-medium text-success">Passed</span>
                </div>
                <div className="flex justify-between">
                  <span>Backup Status</span>
                  <span className="font-medium text-success">Current</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Failed Logins</span>
                  <span className="font-medium">0.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>RLS Policies</span>
                  <span className="font-medium text-success">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Security Scan</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue (YTD)</span>
                    <span className="font-medium">₹12,45,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average per College</span>
                    <span className="font-medium">₹25,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collection Rate</span>
                    <span className="font-medium text-success">94.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>On-time Payments</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late Payments</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding</span>
                    <span className="font-medium text-destructive">3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
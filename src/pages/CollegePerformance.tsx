import React from 'react';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function CollegePerformance() {
  const { data, loading, refetch } = useSystemAnalytics();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">College Performance Dashboard</h1>
            <p className="text-muted-foreground">Monitor and compare college performance metrics</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getPerformanceScore = (college: any) => {
    // Calculate performance score based on multiple factors
    const studentRatio = Math.min(college.studentCount / 500, 1) * 25; // Max 25 points
    const activityScore = college.activityScore || 0; // Max 25 points  
    const dataQuality = college.dataQuality || 0; // Max 25 points
    const revenueScore = Math.min(college.revenue / 100000, 1) * 25; // Max 25 points
    
    return Math.round(studentRatio + activityScore + dataQuality + revenueScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">College Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor and compare college performance metrics</p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Colleges"
          value={data.systemOverview.totalColleges.toString()}
          icon={Building2}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Active Colleges"
          value={data.collegeMetrics.filter(c => c.status === 'active').length.toString()}
          icon={CheckCircle}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Total Students"
          value={data.systemOverview.totalStudents.toLocaleString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Avg Performance"
          value={`${Math.round(data.collegeMetrics.reduce((acc, c) => acc + getPerformanceScore(c), 0) / data.collegeMetrics.length)}%`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* College Performance Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.collegeMetrics.map((college) => {
          const performanceScore = getPerformanceScore(college);
          
          return (
            <Card key={college.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {college.name}
                  </CardTitle>
                  <Badge variant={getScoreBadgeVariant(performanceScore)}>
                    {performanceScore}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{college.code}</span>
                  <span>•</span>
                  <Badge variant={college.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {college.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{college.studentCount}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{college.userCount}</p>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                </div>

                {/* Performance Indicators */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Data Quality</span>
                      <span className="text-sm text-muted-foreground">{college.dataQuality}%</span>
                    </div>
                    <Progress value={college.dataQuality} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Activity Score</span>
                      <span className="text-sm text-muted-foreground">{college.activityScore}%</span>
                    </div>
                    <Progress value={college.activityScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">System Health</span>
                      <span className="text-sm text-muted-foreground">{college.systemHealth}%</span>
                    </div>
                    <Progress value={college.systemHealth} className="h-2" />
                  </div>
                </div>

                {/* Revenue & Growth */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">Monthly Revenue</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      ₹{college.revenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Growth Rate</span>
                    </div>
                    <span className={`text-sm font-bold ${college.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {college.growthRate >= 0 ? '+' : ''}{college.growthRate}%
                    </span>
                  </div>
                </div>

                {/* Alerts */}
                {college.alerts && college.alerts.length > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Alerts</span>
                    </div>
                    <div className="space-y-1">
                      {college.alerts.slice(0, 2).map((alert: string, index: number) => (
                        <p key={index} className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                          {alert}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.collegeMetrics.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No colleges found</h3>
          <p className="text-muted-foreground">
            Add colleges to start monitoring performance metrics.
          </p>
        </div>
      )}
    </div>
  );
}
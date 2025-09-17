import React from 'react';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database,
  Server,
  Shield,
  Users,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function SystemHealthMonitoring() {
  const { data, loading, refetch } = useSystemAnalytics();

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">System Health Monitoring</h1>
            <p className="text-muted-foreground">Monitor system performance and health metrics</p>
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

  const systemHealth = data.performanceMetrics.systemHealth;
  const securityMetrics = data.performanceMetrics.security;

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-emerald-600', variant: 'default' as const };
    if (score >= 75) return { status: 'Good', color: 'text-green-600', variant: 'default' as const };
    if (score >= 60) return { status: 'Fair', color: 'text-yellow-600', variant: 'secondary' as const };
    return { status: 'Poor', color: 'text-red-600', variant: 'destructive' as const };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health Monitoring</h1>
          <p className="text-muted-foreground">Monitor system performance, security, and operational metrics</p>
        </div>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Overall Health Score */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall System Health</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-emerald-600">
                  {systemHealth.overall}%
                </div>
                <Badge variant={getHealthStatus(systemHealth.overall).variant} className="text-sm">
                  {getHealthStatus(systemHealth.overall).status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <Activity className="h-12 w-12 text-emerald-600 mb-2" />
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Uptime"
          value={`${systemHealth.uptime}%`}
          icon={Server}
          trend={{ value: 0.2, isPositive: true }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatsCard
          title="Performance"
          value={`${systemHealth.performance}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatsCard
          title="Data Integrity"
          value={`${data.performanceMetrics.dataIntegrity.overall}%`}
          icon={Database}
          trend={{ value: 2, isPositive: true }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
        />
        <StatsCard
          title="Security Score"
          value={`${securityMetrics.overall}%`}
          icon={Shield}
          trend={{ value: 1, isPositive: true }}
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
        />
      </div>

      {/* Detailed Health Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Database Performance</span>
                <span className="text-sm text-muted-foreground">{systemHealth.database}%</span>
              </div>
              <Progress value={systemHealth.database} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-sm text-muted-foreground">{systemHealth.apiResponse}ms</span>
              </div>
              <Progress value={Math.max(0, 100 - (systemHealth.apiResponse / 10))} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">{systemHealth.memory}%</span>
              </div>
              <Progress value={systemHealth.memory} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-muted-foreground">{systemHealth.storage}%</span>
              </div>
              <Progress value={systemHealth.storage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Security Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Authentication Security</span>
                <span className="text-sm text-muted-foreground">{securityMetrics.authentication}%</span>
              </div>
              <Progress value={securityMetrics.authentication} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Data Encryption</span>
                <span className="text-sm text-muted-foreground">{securityMetrics.encryption}%</span>
              </div>
              <Progress value={securityMetrics.encryption} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Access Control</span>
                <span className="text-sm text-muted-foreground">{securityMetrics.accessControl}%</span>
              </div>
              <Progress value={securityMetrics.accessControl} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Audit Compliance</span>
                <span className="text-sm text-muted-foreground">{securityMetrics.auditCompliance}%</span>
              </div>
              <Progress value={securityMetrics.auditCompliance} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality by College */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Quality by College
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.collegeMetrics.map((college) => (
              <div key={college.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{college.name}</h3>
                    <p className="text-sm text-muted-foreground">{college.code}</p>
                  </div>
                  <Badge variant={getHealthStatus(college.dataQuality).variant}>
                    {college.dataQuality}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{college.studentCount}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-accent">{college.userCount}</p>
                    <p className="text-xs text-muted-foreground">Users</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{college.activityScore}%</p>
                    <p className="text-xs text-muted-foreground">Activity</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Progress value={college.dataQuality} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mock alerts - in real app these would come from monitoring system */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All systems are operating normally. No critical issues detected.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM IST
            </AlertDescription>
          </Alert>
          
          {systemHealth.overall < 80 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                System health below optimal threshold. Consider reviewing performance metrics.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
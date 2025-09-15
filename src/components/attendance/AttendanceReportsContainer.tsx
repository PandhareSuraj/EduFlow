import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText
} from "lucide-react";
import { DailyAttendanceReport } from "./DailyAttendanceReport";
import { StudentAttendanceReport } from "./StudentAttendanceReport";
import { CourseWiseAttendanceReport } from "./CourseWiseAttendanceReport";
import { LowAttendanceAlert } from "./LowAttendanceAlert";
import { useAttendanceReports } from "@/hooks/useAttendanceReports";
import { useCourses } from "@/hooks/useCourses";

interface AttendanceReportsContainerProps {
  onExportReport?: (reportType: string, format: 'pdf' | 'excel') => void;
}

export const AttendanceReportsContainer = ({ onExportReport }: AttendanceReportsContainerProps) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState({
    overallAttendance: 0,
    totalSessions: 0,
    activeCourses: 0,
    atRiskStudents: 0
  });
  
  const { courses } = useCourses();
  const { dailyData, lowAttendanceData, fetchDailyReport, fetchLowAttendanceAlert } = useAttendanceReports();

  // Fetch quick stats on mount
  useEffect(() => {
    const fetchQuickStats = async () => {
      // Fetch today's overall attendance
      const today = new Date();
      await fetchDailyReport({
        reportType: 'daily',
        courseId: 'all',
        dateRange: { from: today, to: today }
      });
      
      // Fetch low attendance alerts
      await fetchLowAttendanceAlert(75);
    };
    
    fetchQuickStats();
  }, [fetchDailyReport, fetchLowAttendanceAlert]);
  
  // Update quick stats when data changes
  useEffect(() => {
    setQuickStats({
      overallAttendance: dailyData?.overallAttendance || 0,
      totalSessions: dailyData?.totalSessions || 0,
      activeCourses: courses.length,
      atRiskStudents: lowAttendanceData?.summary.critical + lowAttendanceData?.summary.warning || 0
    });
  }, [dailyData, lowAttendanceData, courses.length]);

  const reportTypes = [
    {
      id: 'daily',
      title: 'Daily Attendance Report',
      description: 'Session-wise attendance tracking and hourly trends',
      icon: Calendar,
      color: 'bg-blue-500',
      component: DailyAttendanceReport
    },
    {
      id: 'student',
      title: 'Student Attendance Report',
      description: 'Individual student performance and trends',
      icon: Users,
      color: 'bg-green-500',
      component: StudentAttendanceReport
    },
    {
      id: 'course',
      title: 'Course-wise Report',
      description: 'Course and subject-level analytics',
      icon: BookOpen,
      color: 'bg-purple-500',
      component: CourseWiseAttendanceReport
    },
    {
      id: 'low-attendance',
      title: 'Low Attendance Alert',
      description: 'At-risk students and intervention tracking',
      icon: AlertTriangle,
      color: 'bg-red-500',
      component: LowAttendanceAlert
    }
  ];

  const handleReportCardClick = (reportId: string) => {
    setActiveReport(activeReport === reportId ? null : reportId);
  };

  if (activeReport) {
    const report = reportTypes.find(r => r.id === activeReport);
    if (report) {
      const ReportComponent = report.component;
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setActiveReport(null)}
                className="flex items-center gap-2"
              >
                ← Back to Reports
              </Button>
              <div>
                <h2 className="text-2xl font-bold">{report.title}</h2>
                <p className="text-muted-foreground">{report.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExportReport?.(activeReport, 'pdf')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExportReport?.(activeReport, 'excel')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          <ReportComponent />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Attendance Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Comprehensive attendance insights with visual analytics and actionable data
        </p>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card 
            key={report.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
            onClick={() => handleReportCardClick(report.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${report.color} text-white`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2">
                  View Report
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Analytics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Visual Charts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PieChart className="h-4 w-4" />
                    <span>Export Ready</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Analytics Overview</CardTitle>
          <CardDescription>
            High-level attendance metrics across all reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {quickStats.overallAttendance > 0 ? `${quickStats.overallAttendance.toFixed(1)}%` : '—'}
              </div>
              <div className="text-sm text-muted-foreground">Overall Attendance</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quickStats.totalSessions || '—'}
              </div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {quickStats.activeCourses || '—'}
              </div>
              <div className="text-sm text-muted-foreground">Active Courses</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {quickStats.atRiskStudents || '—'}
              </div>
              <div className="text-sm text-muted-foreground">At-Risk Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Features</CardTitle>
          <CardDescription>
            What you can expect from each report type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Visual Analytics</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Interactive charts and graphs</li>
                <li>• Trend analysis over time</li>
                <li>• Comparative performance metrics</li>
                <li>• Real-time data visualization</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Export & Sharing</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Professional PDF reports</li>
                <li>• Excel data exports</li>
                <li>• Email integration</li>
                <li>• Print-ready formats</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Advanced Filtering</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Date range selection</li>
                <li>• Course-wise filtering</li>
                <li>• Subject-level breakdowns</li>
                <li>• Custom threshold settings</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Actionable Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Risk identification</li>
                <li>• Intervention tracking</li>
                <li>• Performance comparisons</li>
                <li>• Predictive analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
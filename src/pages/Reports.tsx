import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, BarChart3, Users, CreditCard, FileText, Download, TrendingUp, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const reportCategories = [
  {
    title: "Student Reports",
    icon: Users,
    description: "Comprehensive student data and analytics",
    reports: [
      { name: "Student Enrollment Report", description: "Course-wise student enrollment statistics" },
      { name: "Student Performance Report", description: "Academic performance and results analysis" },
      { name: "Student Demographics Report", description: "Age, gender, and location distribution" },
      { name: "Course Completion Report", description: "Students who completed courses successfully" }
    ]
  },
  {
    title: "Financial Reports",
    icon: CreditCard,
    description: "Fees collection and financial analysis",
    reports: [
      { name: "Fees Collection Report", description: "Monthly and yearly fee collection summary" },
      { name: "Pending Dues Report", description: "Outstanding payments and overdue accounts" },
      { name: "Payment Method Analysis", description: "Breakdown by cash, online, installments" },
      { name: "Revenue Trend Report", description: "Financial performance over time" }
    ]
  },
  {
    title: "Attendance Reports",
    icon: Calendar,
    description: "Student and faculty attendance tracking",
    reports: [
      { name: "Daily Attendance Report", description: "Day-wise attendance for all courses" },
      { name: "Monthly Attendance Summary", description: "Course-wise monthly attendance rates" },
      { name: "Low Attendance Alert", description: "Students with attendance below 75%" },
      { name: "Faculty Attendance Report", description: "Teaching staff attendance and schedules" }
    ]
  },
  {
    title: "Academic Reports",
    icon: BarChart3,
    description: "Examination and academic performance",
    reports: [
      { name: "Exam Results Summary", description: "Pass rates and grade distribution" },
      { name: "Course Performance Analysis", description: "Subject-wise student performance" },
      { name: "Top Performers Report", description: "Merit list and distinction holders" },
      { name: "Certificate Issuance Report", description: "Certificates and documents issued" }
    ]
  },
  {
    title: "Operational Reports",
    icon: FileText,
    description: "Day-to-day operations and management",
    reports: [
      { name: "Enquiry Conversion Report", description: "Lead to admission conversion rates" },
      { name: "Faculty Workload Report", description: "Teaching hours and subject allocation" },
      { name: "Inventory Status Report", description: "Stock levels and equipment status" },
      { name: "Facility Utilization Report", description: "Lab and classroom usage statistics" }
    ]
  },
  {
    title: "Custom Reports",
    icon: PieChart,
    description: "Build your own custom reports",
    reports: [
      { name: "Custom Query Builder", description: "Create reports with custom filters" },
      { name: "Dashboard Analytics", description: "Real-time KPI and metrics dashboard" },
      { name: "Comparative Analysis", description: "Year-over-year comparison reports" },
      { name: "Export Templates", description: "Pre-built export formats for external use" }
    ]
  }
];

export default function Reports() {
  const { toast } = useToast();
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and insights</p>
        </div>
        <Button className="shadow-elegant">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Report Generator
          </CardTitle>
          <CardDescription>Select parameters to generate instant reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Reports</SelectItem>
                  <SelectItem value="financial">Financial Reports</SelectItem>
                  <SelectItem value="attendance">Attendance Reports</SelectItem>
                  <SelectItem value="academic">Academic Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="dmlt">DMLT</SelectItem>
                  <SelectItem value="rt">Radiology Technician</SelectItem>
                  <SelectItem value="pgdmlt">PGDMLT</SelectItem>
                  <SelectItem value="hm">Hospital Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast({
                    title: "PDF Generation",
                    description: "PDF report generation feature coming soon!"
                  })}
                >
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast({
                    title: "Excel Export", 
                    description: "Excel export feature coming soon!"
                  })}
                >
                  Excel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => toast({
                    title: "Report Generated",
                    description: "Sample report generated successfully!"
                  })}
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.reports.map((report, reportIndex) => (
                <div key={reportIndex} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toast({
                        title: "Report Preview",
                        description: `Viewing ${report.name}`
                      })}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toast({
                        title: "Download Started", 
                        description: `Downloading ${report.name}`
                      })}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Generated Reports</CardTitle>
          <CardDescription>Your latest report downloads and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Monthly Fees Collection Report", date: "2024-01-22", type: "Financial", format: "PDF", size: "2.3 MB" },
              { name: "Student Attendance Summary", date: "2024-01-21", type: "Attendance", format: "Excel", size: "1.8 MB" },
              { name: "Course Enrollment Report", date: "2024-01-20", type: "Student", format: "PDF", size: "3.1 MB" },
              { name: "Exam Results Analysis", date: "2024-01-19", type: "Academic", format: "Excel", size: "2.7 MB" }
            ].map((report, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on {report.date} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{report.type}</Badge>
                  <Badge variant="secondary">{report.format}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
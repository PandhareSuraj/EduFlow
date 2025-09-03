import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BarChart3, Users, CreditCard, FileText, Download, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReportData } from "@/hooks/useReportData";
import { ReportGenerator, ReportConfigs } from "@/utils/reportGenerator";
import { ReportFilters, FilterValues } from "@/components/reports/ReportFilters";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { format as formatDate } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const reportCategories = [
  {
    title: "Student Reports",
    icon: Users,
    description: "Comprehensive student data and analytics",
    reports: [
      { name: "Student Enrollment Report", description: "Course-wise student enrollment statistics", type: "student_enrollment" },
      { name: "Student Performance Report", description: "Academic performance and results analysis", type: "student_enrollment" },
      { name: "Student Demographics Report", description: "Age, gender, and location distribution", type: "student_enrollment" },
      { name: "Course Completion Report", description: "Students who completed courses successfully", type: "student_enrollment" }
    ]
  },
  {
    title: "Financial Reports",
    icon: CreditCard,
    description: "Fees collection and financial analysis",
    reports: [
      { name: "Fees Collection Report", description: "Monthly and yearly fee collection summary", type: "fees_collection" },
      { name: "Pending Dues Report", description: "Outstanding payments and overdue accounts", type: "fees_collection" },
      { name: "Payment Method Analysis", description: "Breakdown by cash, online, installments", type: "fees_collection" },
      { name: "Revenue Trend Report", description: "Financial performance over time", type: "fees_collection" }
    ]
  },
  {
    title: "Attendance Reports",
    icon: Calendar,
    description: "Student and faculty attendance tracking",
    reports: [
      { name: "Daily Attendance Report", description: "Day-wise attendance for all courses", type: "attendance_summary" },
      { name: "Monthly Attendance Summary", description: "Course-wise monthly attendance rates", type: "attendance_summary" },
      { name: "Low Attendance Alert", description: "Students with attendance below 75%", type: "attendance_summary" },
      { name: "Faculty Attendance Report", description: "Teaching staff attendance and schedules", type: "attendance_summary" }
    ]
  },
  {
    title: "Academic Reports",
    icon: BarChart3,
    description: "Examination and academic performance",
    reports: [
      { name: "Exam Results Summary", description: "Pass rates and grade distribution", type: "exam_results" },
      { name: "Course Performance Analysis", description: "Subject-wise student performance", type: "exam_results" },
      { name: "Top Performers Report", description: "Merit list and distinction holders", type: "exam_results" },
      { name: "Certificate Issuance Report", description: "Certificates and documents issued", type: "exam_results" }
    ]
  },
  {
    title: "Operational Reports",
    icon: FileText,
    description: "Day-to-day operations and management",
    reports: [
      { name: "Enquiry Conversion Report", description: "Lead to admission conversion rates", type: "enquiry_report" },
      { name: "Faculty Workload Report", description: "Teaching hours and subject allocation", type: "enquiry_report" },
      { name: "Inventory Status Report", description: "Stock levels and equipment status", type: "enquiry_report" },
      { name: "Facility Utilization Report", description: "Lab and classroom usage statistics", type: "enquiry_report" }
    ]
  },
  {
    title: "Custom Reports",
    icon: PieChart,
    description: "Build your own custom reports",
    reports: [
      { name: "Custom Query Builder", description: "Create reports with custom filters", type: "student_enrollment" },
      { name: "Dashboard Analytics", description: "Real-time KPI and metrics dashboard", type: "student_enrollment" },
      { name: "Comparative Analysis", description: "Year-over-year comparison reports", type: "student_enrollment" },
      { name: "Export Templates", description: "Pre-built export formats for external use", type: "student_enrollment" }
    ]
  }
];

export default function Reports() {
  const { toast } = useToast();
  const { data, loading, fetchData } = useReportData();
  const [currentFilters, setCurrentFilters] = useState<FilterValues | null>(null);

  const handleFiltersChange = (filters: FilterValues) => {
    setCurrentFilters(filters);
    fetchData({
      reportType: filters.reportType,
      courseId: filters.courseId,
      dateRange: filters.dateRange
    });
  };

  const generateReport = async (format: 'pdf' | 'excel') => {
    if (!currentFilters || !currentFilters.reportType) {
      toast({
        title: "Error",
        description: "Please select a report type first",
        variant: "destructive"
      });
      return;
    }

    try {
      let reportData: any[] = [];
      let config;
      let reportName = "";

      switch (currentFilters.reportType) {
        case 'student_enrollment':
          reportData = data.students;
          reportName = "Student Enrollment Report";
          config = ReportConfigs.studentEnrollment(reportData, currentFilters);
          break;
        case 'fees_collection':
          reportData = data.fees;
          reportName = "Fees Collection Report";
          config = ReportConfigs.feesCollection(reportData, currentFilters);
          break;
        case 'attendance_summary':
          reportData = data.attendance;
          reportName = "Attendance Summary Report";
          config = ReportConfigs.attendanceSummary(reportData, currentFilters);
          break;
        case 'exam_results':
          reportData = data.exams;
          reportName = "Exam Results Report";
          config = {
            title: reportName,
            type: 'academic' as const,
            data: reportData,
            columns: [
              { key: 'name', label: 'Exam Name' },
              { key: 'courses.name', label: 'Course' },
              { key: 'exam_date', label: 'Date', formatter: (value: any) => value ? formatDate(new Date(value), 'PPP') : '' },
              { key: 'total_marks', label: 'Total Marks' },
              { key: 'status', label: 'Status' }
            ],
            filters: currentFilters,
            summary: {
              totalRecords: reportData.length,
              additionalInfo: {
                'Completed Exams': reportData.filter(e => e.status === 'completed').length,
                'Scheduled Exams': reportData.filter(e => e.status === 'scheduled').length
              }
            }
          };
          break;
        case 'enquiry_report':
          reportData = data.enquiries;
          reportName = "Enquiry Report";
          config = {
            title: reportName,
            type: 'operational' as const,
            data: reportData,
            columns: [
              { key: 'name', label: 'Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
              { key: 'course', label: 'Course' },
              { key: 'source', label: 'Source' },
              { key: 'status', label: 'Status' },
              { key: 'created_at', label: 'Date', formatter: (value: any) => value ? formatDate(new Date(value), 'PPP') : '' }
            ],
            filters: currentFilters,
            summary: {
              totalRecords: reportData.length,
              additionalInfo: {
                'New Enquiries': reportData.filter(e => e.status === 'new').length,
                'Converted': reportData.filter(e => e.status === 'converted').length,
                'Follow-up Required': reportData.filter(e => e.status === 'follow_up').length
              }
            }
          };
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (format === 'pdf') {
        ReportGenerator.generatePDF(config);
      } else {
        ReportGenerator.generateExcel(config);
      }

      // Log report generation to database
      await supabase.from('report_history').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        name: reportName,
        report_type: currentFilters.reportType,
        export_format: format.toUpperCase(),
        size_bytes: null,
        filters: currentFilters as any
      });

      toast({
        title: "Report Generated",
        description: `${reportName} has been downloaded successfully`
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReportCardClick = (reportType: string, reportName: string) => {
    const newFilters = { 
      ...currentFilters, 
      reportType 
    } as FilterValues;
    
    setCurrentFilters(newFilters);
    handleFiltersChange(newFilters);
    
    toast({
      title: "Report Selected",
      description: `${reportName} data is being loaded...`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports and insights</p>
        </div>
      </div>

      {/* Report Filters */}
      <ReportFilters 
        onFiltersChange={handleFiltersChange}
        onGenerate={generateReport}
        loading={loading}
      />

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
                      onClick={() => handleReportCardClick(report.type, report.name)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        handleReportCardClick(report.type, report.name);
                        setTimeout(() => generateReport('pdf'), 100);
                      }}
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

      {/* Data Preview */}
      {currentFilters?.reportType && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Preview of data for {currentFilters.reportType.replace('_', ' ')} report
              {currentFilters.courseId !== 'all' && ` (Course: ${data.courses.find(c => c.id.toString() === currentFilters.courseId)?.name})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {currentFilters.reportType === 'student_enrollment' && data.students.length}
                      {currentFilters.reportType === 'fees_collection' && data.fees.length}
                      {currentFilters.reportType === 'attendance_summary' && data.attendance.length}
                      {currentFilters.reportType === 'exam_results' && data.exams.length}
                      {currentFilters.reportType === 'enquiry_report' && data.enquiries.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  
                  {currentFilters.reportType === 'fees_collection' && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{data.fees.reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Collected</div>
                    </div>
                  )}
                  
                  {currentFilters.reportType === 'attendance_summary' && data.attendance.length > 0 && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(data.attendance.reduce((sum, session) => sum + (session.attendance_percentage || 0), 0) / data.attendance.length).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Attendance</div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatDate(currentFilters.dateRange.from, 'MMM d')} - {formatDate(currentFilters.dateRange.to, 'MMM d')}
                    </div>
                    <div className="text-sm text-muted-foreground">Date Range</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Ready to generate report with {' '}
                    {currentFilters.reportType === 'student_enrollment' && data.students.length}
                    {currentFilters.reportType === 'fees_collection' && data.fees.length}
                    {currentFilters.reportType === 'attendance_summary' && data.attendance.length}
                    {currentFilters.reportType === 'exam_results' && data.exams.length}
                    {currentFilters.reportType === 'enquiry_report' && data.enquiries.length}
                    {' '} records
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

        {/* Report History */}
        <ReportHistory onRegenerateReport={(filters, format) => {
          setCurrentFilters(filters);
          handleFiltersChange(filters);
          setTimeout(() => generateReport(format as 'pdf' | 'excel'), 100);
        }} />
    </div>
  );
}
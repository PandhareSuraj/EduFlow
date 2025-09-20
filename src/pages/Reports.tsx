import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, BarChart3, Users, CreditCard, FileText, Download, PieChart, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReportData } from "@/hooks/useReportData";
import { ReportGenerator, ReportConfigs } from "@/utils/reportGenerator";
import { ReportFilters, FilterValues } from "@/components/reports/ReportFilters";
import { ReportHistory } from "@/components/reports/ReportHistory";
import { ReportDataTable } from "@/components/reports/ReportDataTable";
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
    title: "Security & Authentication Reports",
    icon: Shield,
    description: "OTP verification and security analytics",
    reports: [
      { name: "OTP Verification Report", description: "Phone numbers that requested OTP for signup", type: "otp_verification" },
      { name: "Failed Login Attempts", description: "Unsuccessful authentication attempts", type: "otp_verification" },
      { name: "Signup Conversion Rate", description: "OTP to successful registration ratio", type: "otp_verification" },
      { name: "Security Activity Log", description: "All authentication-related activities", type: "otp_verification" }
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

  const handleFiltersChange = useCallback((filters: FilterValues) => {
    setCurrentFilters(filters);
    fetchData({
      reportType: filters.reportType,
      courseId: filters.courseId,
      dateRange: filters.dateRange,
      searchTerm: filters.searchTerm,
      status: filters.status,
      semester: filters.semester,
      year: filters.year
    });
  }, [fetchData]);

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
        case 'otp_verification':
          reportData = data.otpVerifications;
          reportName = "OTP Verification Report";
          config = ReportConfigs.otpVerification(reportData, currentFilters);
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

      {/* Data Preview Table */}
      {currentFilters?.reportType && (
        <>
          {currentFilters.reportType === 'student_enrollment' && (
            <ReportDataTable
              title="Student Enrollment Data"
              description={`Showing ${data.students.length} student records${currentFilters.courseId !== 'all' ? ` for ${data.courses.find(c => c.id.toString() === currentFilters.courseId)?.name}` : ''}`}
              data={data.students}
              columns={[
                { key: 'student_id', label: 'Student ID' },
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'courses.name', label: 'Course' },
                { key: 'semester', label: 'Semester' },
                { key: 'year', label: 'Year' },
                { key: 'admission_date', label: 'Admission Date' },
                { key: 'status', label: 'Status', formatter: (value) => <Badge variant={value === 'active' ? 'default' : 'secondary'}>{value}</Badge> }
              ]}
              loading={loading}
              onExport={generateReport}
              searchPlaceholder="Search students by name, ID, or email..."
            />
          )}

          {currentFilters.reportType === 'fees_collection' && (
            <ReportDataTable
              title="Fees Collection Data"
              description={`Showing ${data.fees.length} fee payment records`}
              data={data.fees}
              columns={[
                { key: 'receipt_number', label: 'Receipt No.' },
                { key: 'students.name', label: 'Student' },
                { key: 'students.student_id', label: 'Student ID' },
                { key: 'amount', label: 'Amount' },
                { key: 'payment_date', label: 'Payment Date' },
                { key: 'payment_method', label: 'Method' },
                { key: 'transaction_id', label: 'Transaction ID' }
              ]}
              loading={loading}
              onExport={generateReport}
              searchPlaceholder="Search by receipt number, student name..."
            />
          )}

          {currentFilters.reportType === 'attendance_summary' && (
            <ReportDataTable
              title="Attendance Summary Data"
              description={`Showing ${data.attendance.length} attendance session records`}
              data={data.attendance}
              columns={[
                { key: 'courses.name', label: 'Course' },
                { key: 'subject', label: 'Subject' },
                { key: 'session_date', label: 'Date' },
                { key: 'total_students', label: 'Total Students' },
                { key: 'present_count', label: 'Present' },
                { key: 'absent_count', label: 'Absent' },
                { key: 'attendance_percentage', label: 'Attendance %', formatter: (value) => value ? `${value}%` : '-' }
              ]}
              loading={loading}
              onExport={generateReport}
              searchPlaceholder="Search by course or subject..."
            />
          )}

          {currentFilters.reportType === 'exam_results' && (
            <ReportDataTable
              title="Exam Results Data"
              description={`Showing ${data.exams.length} exam records`}
              data={data.exams}
              columns={[
                { key: 'name', label: 'Exam Name' },
                { key: 'courses.name', label: 'Course' },
                { key: 'exam_date', label: 'Date' },
                { key: 'total_marks', label: 'Total Marks' },
                { key: 'duration_minutes', label: 'Duration (min)' },
                { key: 'status', label: 'Status', formatter: (value) => <Badge variant={value === 'completed' ? 'default' : 'secondary'}>{value}</Badge> }
              ]}
              loading={loading}
              onExport={generateReport}
              searchPlaceholder="Search exams by name or course..."
            />
          )}

          {currentFilters.reportType === 'enquiry_report' && (
            <ReportDataTable
              title="Enquiry Report Data"
              description={`Showing ${data.enquiries.length} enquiry records`}
              data={data.enquiries}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'course', label: 'Course of Interest' },
                { key: 'source', label: 'Source' },
                { key: 'status', label: 'Status', formatter: (value) => <Badge variant={value === 'converted' ? 'default' : 'secondary'}>{value}</Badge> },
                { key: 'created_at', label: 'Created Date' }
              ]}
              loading={loading}
              onExport={generateReport}
              searchPlaceholder="Search by name, phone, email..."
            />
          )}

          {currentFilters.reportType === 'otp_verification' && (
            <ReportDataTable
              title="OTP Verification Report"
              description={`Showing ${data.otpVerifications.length} OTP verification attempts`}
              data={data.otpVerifications}
              columns={[
                { key: 'phone_number', label: 'Phone Number' },
                { key: 'verified', label: 'Verified', formatter: (value) => <Badge variant={value ? 'default' : 'destructive'}>{value ? 'Yes' : 'No'}</Badge> },
                { key: 'attempts', label: 'Attempts' },
                { key: 'created_at', label: 'Requested At', formatter: (value) => value ? formatDate(new Date(value), 'PPP p') : '' },
                { key: 'updated_at', label: 'Last Updated', formatter: (value) => value ? formatDate(new Date(value), 'PPP p') : '' },
                { key: 'colleges.name', label: 'College' },
                { key: 'expires_at', label: 'Expires At', formatter: (value) => value ? formatDate(new Date(value), 'PPP p') : '' }
              ]}
              loading={loading}
              onExport={generateReport}
              searchPlaceholder="Search by phone number..."
            />
          )}
        </>
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
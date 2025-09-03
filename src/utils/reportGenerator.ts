import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export type ReportType = 'student' | 'financial' | 'attendance' | 'academic' | 'operational';
export type ExportFormat = 'pdf' | 'excel';

export interface ReportConfig {
  title: string;
  type: ReportType;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    formatter?: (value: any) => string;
  }>;
  filters?: any;
  summary?: {
    totalRecords: number;
    additionalInfo?: Record<string, any>;
  };
}

export class ReportGenerator {
  static generatePDF(config: ReportConfig): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, pageWidth / 2, 20, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 30, { align: 'center' });
    
    // Add filters info if available
    let startY = 40;
    if (config.filters) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Filters Applied:', 14, startY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      Object.entries(config.filters).forEach(([key, value], index) => {
        if (value && value !== 'all') {
          doc.text(`${key}: ${value}`, 14, startY + 10 + (index * 8));
        }
      });
      startY += 30;
    }
    
    // Prepare table data
    const tableColumns = config.columns.map(col => col.label);
    const tableRows = config.data.map(row => 
      config.columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        return col.formatter ? col.formatter(value) : String(value || '');
      })
    );
    
    // Add table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    // Add summary if available
    if (config.summary) {
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary:', 14, finalY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Records: ${config.summary.totalRecords}`, 14, finalY + 10);
      
      if (config.summary.additionalInfo) {
        let yOffset = 20;
        Object.entries(config.summary.additionalInfo).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 14, finalY + yOffset);
          yOffset += 8;
        });
      }
    }
    
    // Save the PDF
    const fileName = `${config.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  }
  
  static generateExcel(config: ReportConfig): void {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Prepare data with headers
    const headers = config.columns.map(col => col.label);
    const data = config.data.map(row => 
      config.columns.reduce((acc, col) => {
        const value = this.getNestedValue(row, col.key);
        acc[col.label] = col.formatter ? col.formatter(value) : value;
        return acc;
      }, {} as any)
    );
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    
    // Add filters and summary info at the top
    if (config.filters || config.summary) {
      const infoData = [];
      infoData.push([config.title]);
      infoData.push([`Generated on: ${format(new Date(), 'PPP')}`]);
      infoData.push(['']);
      
      if (config.filters) {
        infoData.push(['Filters Applied:']);
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value && value !== 'all') {
            infoData.push([`${key}: ${value}`]);
          }
        });
        infoData.push(['']);
      }
      
      if (config.summary) {
        infoData.push(['Summary:']);
        infoData.push([`Total Records: ${config.summary.totalRecords}`]);
        if (config.summary.additionalInfo) {
          Object.entries(config.summary.additionalInfo).forEach(([key, value]) => {
            infoData.push([`${key}: ${value}`]);
          });
        }
        infoData.push(['']);
      }
      
      // Insert info at the beginning
      XLSX.utils.sheet_add_aoa(ws, infoData, { origin: 'A1' });
      
      // Add data starting after info section
      XLSX.utils.sheet_add_json(ws, data, { 
        origin: `A${infoData.length + 2}`,
        header: headers,
        skipHeader: false 
      });
    }
    
    // Auto-size columns
    const cols = config.columns.map(() => ({ wch: 20 }));
    ws['!cols'] = cols;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    // Save the Excel file
    const fileName = `${config.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
  
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return current[key];
      }
      return current;
    }, obj);
  }
}

// Predefined report configurations
export const ReportConfigs = {
  studentEnrollment: (data: any[], filters: any): ReportConfig => ({
    title: 'Student Enrollment Report',
    type: 'student',
    data,
    columns: [
      { key: 'student_id', label: 'Student ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile_number', label: 'Phone' },
      { key: 'courses.name', label: 'Course' },
      { key: 'year', label: 'Year' },
      { key: 'semester', label: 'Semester' },
      { key: 'admission_date', label: 'Admission Date', formatter: (value) => value ? format(new Date(value), 'PPP') : '' },
      { key: 'status', label: 'Status' }
    ],
    filters,
    summary: {
      totalRecords: data.length,
      additionalInfo: {
        'Active Students': data.filter(s => s.status === 'active').length,
        'Inactive Students': data.filter(s => s.status === 'inactive').length
      }
    }
  }),
  
  feesCollection: (data: any[], filters: any): ReportConfig => ({
    title: 'Fees Collection Report',
    type: 'financial',
    data,
    columns: [
      { key: 'receipt_number', label: 'Receipt No.' },
      { key: 'students.name', label: 'Student Name' },
      { key: 'students.student_id', label: 'Student ID' },
      { key: 'amount', label: 'Amount', formatter: (value) => `₹${value?.toLocaleString() || 0}` },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'payment_date', label: 'Payment Date', formatter: (value) => value ? format(new Date(value), 'PPP') : '' },
      { key: 'transaction_id', label: 'Transaction ID' }
    ],
    filters,
    summary: {
      totalRecords: data.length,
      additionalInfo: {
        'Total Amount Collected': `₹${data.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString()}`,
        'Cash Payments': data.filter(p => p.payment_method === 'cash').length,
        'Online Payments': data.filter(p => p.payment_method === 'online').length
      }
    }
  }),
  
  attendanceSummary: (data: any[], filters: any): ReportConfig => ({
    title: 'Attendance Summary Report',
    type: 'attendance',
    data,
    columns: [
      { key: 'session_date', label: 'Date', formatter: (value) => value ? format(new Date(value), 'PPP') : '' },
      { key: 'class_name', label: 'Class' },
      { key: 'courses.name', label: 'Course' },
      { key: 'total_students', label: 'Total Students' },
      { key: 'present_count', label: 'Present' },
      { key: 'absent_count', label: 'Absent' },
      { key: 'attendance_percentage', label: 'Attendance %', formatter: (value) => `${value || 0}%` }
    ],
    filters,
    summary: {
      totalRecords: data.length,
      additionalInfo: {
        'Average Attendance': `${(data.reduce((sum, item) => sum + (item.attendance_percentage || 0), 0) / data.length || 0).toFixed(2)}%`,
        'Total Sessions': data.length
      }
    }
  })
};
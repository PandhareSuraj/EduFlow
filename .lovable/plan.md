
# Data Export and Backup Functionality Implementation

## Overview

This plan implements comprehensive data export and backup functionality across the EduFlow application, adding "Export to Excel" and "Export to PDF" buttons to key pages with date range filters, progress indicators, and print stylesheets for clean printing.

---

## Current State Analysis

| Feature | Current Status | Gap |
|---------|---------------|-----|
| Excel Export | Exists in `reportGenerator.ts` | Not integrated into all pages |
| PDF Export | Exists in `reportGenerator.ts` and `pdfGenerator.ts` | Not integrated into all pages |
| Date Range Filters | Exists in `ReportFilters.tsx` | Not available on individual pages |
| Export Progress | Not implemented | No visual feedback during export |
| Print Stylesheet | Not implemented | No `@media print` styles |
| CSV Export | Basic implementation on Students/Fees | Should be upgraded to Excel |
| Fee Receipts PDF | Basic in `PaymentReceipt.tsx` | Uses basic window.print(), needs proper PDF |
| Certificates | Uses `reportGenerator.ts` | Already implemented in Exams.tsx |

### Existing Export Infrastructure
- **`src/utils/reportGenerator.ts`**: Has `ReportGenerator.generatePDF()` and `ReportGenerator.generateExcel()` with predefined configs
- **`src/utils/pdfGenerator.ts`**: ID card specific PDF generation
- **xlsx library**: Already installed and used
- **jspdf + jspdf-autotable**: Already installed and used

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/exports/ExportButton.tsx` | Unified export button with progress |
| Create | `src/components/exports/DateRangeExportDialog.tsx` | Dialog with date range filter before export |
| Create | `src/components/exports/ExportProgress.tsx` | Progress indicator component |
| Create | `src/components/exports/pdfTemplates/StudentReportCard.tsx` | Student report card PDF template |
| Create | `src/components/exports/pdfTemplates/FeeReceiptPDF.tsx` | Professional fee receipt PDF |
| Create | `src/components/exports/pdfTemplates/CertificatePDF.tsx` | Enhanced certificate template |
| Create | `src/components/exports/index.ts` | Barrel exports |
| Modify | `src/utils/reportGenerator.ts` | Add new report configs and async support |
| Modify | `src/index.css` | Add print stylesheet |
| Modify | `src/pages/Students.tsx` | Replace CSV with Excel export |
| Modify | `src/pages/Fees.tsx` | Replace CSV with Excel, add PDF receipts |
| Modify | `src/pages/Attendance.tsx` | Add Excel export buttons |
| Modify | `src/pages/Exams.tsx` | Enhance existing exports |
| Modify | `src/components/forms/PaymentReceipt.tsx` | Use proper PDF generation |

---

## Implementation Details

### 1. ExportButton Component

A reusable export button with loading state and format selection:

```typescript
// src/components/exports/ExportButton.tsx
interface ExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title: string;
  formats?: ('excel' | 'pdf' | 'csv')[];
  filters?: Record<string, any>;
  summary?: ExportSummary;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  disabled?: boolean;
}

export function ExportButton({
  data,
  columns,
  filename,
  title,
  formats = ['excel', 'pdf'],
  filters,
  summary,
  onExportStart,
  onExportComplete,
  disabled
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setIsExporting(true);
    setExportFormat(format);
    onExportStart?.();

    try {
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const safeFilename = `${filename}_${dateStr}`;

      if (format === 'excel') {
        await exportToExcel(data, columns, safeFilename, title, filters, summary);
      } else if (format === 'pdf') {
        await exportToPDF(data, columns, safeFilename, title, filters, summary);
      } else {
        await exportToCSV(data, columns, safeFilename);
      }

      toast({ title: "Export Successful", description: `${title} exported as ${format.toUpperCase()}` });
    } catch (error) {
      toast({ title: "Export Failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsExporting(false);
      setExportFormat(null);
      onExportComplete?.();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting || data.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {formats.includes('excel') && (
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Excel (.xlsx)
          </DropdownMenuItem>
        )}
        {formats.includes('pdf') && (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Export to PDF
          </DropdownMenuItem>
        )}
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileDown className="mr-2 h-4 w-4" />
            Export to CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 2. DateRangeExportDialog Component

Dialog with date range picker for filtering exports:

```typescript
// src/components/exports/DateRangeExportDialog.tsx
interface DateRangeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onExport: (format: 'excel' | 'pdf', dateRange: { from: Date; to: Date }) => Promise<void>;
}

export function DateRangeExportDialog({
  open,
  onOpenChange,
  title,
  onExport
}: DateRangeExportDialogProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date()
  });
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setIsExporting(true);
    setProgress(0);
    
    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      await onExport(format, dateRange);
      setProgress(100);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
        onOpenChange(false);
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export {title}</DialogTitle>
          <DialogDescription>
            Select a date range and export format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.from, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateRange.to, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Generating export... {progress}%
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={() => handleExport('excel')} disabled={isExporting}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={() => handleExport('pdf')} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Student Report Card PDF Template

Professional PDF template for individual student report cards:

```typescript
// src/components/exports/pdfTemplates/StudentReportCard.tsx
export async function generateStudentReportCard(student: StudentData, results: ResultData[], college: CollegeData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with college name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(college.name, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(college.address, pageWidth / 2, 28, { align: 'center' });
  
  // Student Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT REPORT CARD', pageWidth / 2, 45, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Student info table
  const studentInfo = [
    ['Student Name', student.name],
    ['Student ID', student.student_id],
    ['Course', student.course_name],
    ['Semester', `Semester ${student.semester}`],
    ['Academic Year', student.academic_year]
  ];
  
  autoTable(doc, {
    body: studentInfo,
    startY: 55,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 60 }
    }
  });
  
  // Results Table
  const resultsData = results.map((r, idx) => [
    idx + 1,
    r.exam_name,
    r.subject_name || '-',
    r.marks_obtained,
    r.total_marks,
    `${r.percentage.toFixed(1)}%`,
    r.grade
  ]);
  
  autoTable(doc, {
    head: [['#', 'Examination', 'Subject', 'Marks', 'Total', 'Percentage', 'Grade']],
    body: resultsData,
    startY: doc.lastAutoTable.finalY + 15,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Summary
  const avgPercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
  const overallGrade = getGradeFromPercentage(avgPercentage);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const summaryY = doc.lastAutoTable.finalY + 15;
  doc.text(`Overall Percentage: ${avgPercentage.toFixed(1)}%`, 14, summaryY);
  doc.text(`Overall Grade: ${overallGrade}`, 14, summaryY + 8);
  doc.text(`Result: ${avgPercentage >= 40 ? 'PASS' : 'FAIL'}`, 14, summaryY + 16);
  
  // Footer with signature
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('_________________________', pageWidth - 60, footerY);
  doc.text('Principal Signature', pageWidth - 55, footerY + 8);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, footerY + 8);
  
  // Save
  doc.save(`Report_Card_${student.student_id}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
```

### 4. Enhanced Fee Receipt PDF

Proper jsPDF-based fee receipt generation:

```typescript
// src/components/exports/pdfTemplates/FeeReceiptPDF.tsx
export async function generateFeeReceiptPDF(receipt: ReceiptData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // College Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(receipt.college.name, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.college.address, pageWidth / 2, 28, { align: 'center' });
  doc.text(`Phone: ${receipt.college.phone} | Email: ${receipt.college.email}`, pageWidth / 2, 35, { align: 'center' });
  
  // Receipt Title
  doc.setDrawColor(0);
  doc.line(14, 42, pageWidth - 14, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageWidth / 2, 52, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Receipt No: ${receipt.receipt_number}`, pageWidth / 2, 60, { align: 'center' });
  
  // Student & Payment Details
  const details = [
    ['Student Name', receipt.student.name, 'Payment Date', format(new Date(receipt.payment_date), 'PPP')],
    ['Student ID', receipt.student.student_id, 'Payment Method', receipt.payment_method.toUpperCase()],
    ['Course', `${receipt.student.course.name} (${receipt.student.course.code})`, 'Transaction ID', receipt.transaction_id || 'N/A'],
    ['Mobile', receipt.student.mobile_number, 'Cheque No.', receipt.cheque_number || 'N/A']
  ];
  
  autoTable(doc, {
    body: details,
    startY: 70,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35 },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35 },
      3: { cellWidth: 55 }
    }
  });
  
  // Amount Box
  const amountY = doc.lastAutoTable.finalY + 15;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, amountY, pageWidth - 28, 30, 3, 3, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Paid:', 24, amountY + 12);
  doc.setFontSize(20);
  doc.text(`₹${receipt.amount.toLocaleString('en-IN')}`, 24, amountY + 24);
  
  // Amount in words
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`(${numberToWords(receipt.amount)} Rupees Only)`, pageWidth / 2, amountY + 40, { align: 'center' });
  
  // Signature
  const sigY = amountY + 60;
  if (receipt.college.signature_url) {
    // Add signature image if available
    try {
      doc.addImage(receipt.college.signature_url, 'PNG', pageWidth - 70, sigY, 50, 20);
    } catch (e) {
      console.log('Could not add signature image');
    }
  }
  doc.line(pageWidth - 80, sigY + 25, pageWidth - 20, sigY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(receipt.college.signature_title || 'Authorized Signature', pageWidth - 50, sigY + 32, { align: 'center' });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer generated receipt.', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Save
  doc.save(`Fee_Receipt_${receipt.receipt_number}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
```

### 5. Print Stylesheet

Add comprehensive print styles to index.css:

```css
/* src/index.css - Print Stylesheet */

@media print {
  /* Hide non-printable elements */
  .no-print,
  .skip-link,
  nav,
  aside,
  button:not(.print-button),
  .sidebar,
  [data-radix-popper-content-wrapper],
  .fixed.bottom-0,
  .toaster {
    display: none !important;
  }
  
  /* Reset backgrounds for printing */
  body {
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Main content takes full width */
  main {
    margin: 0 !important;
    padding: 20px !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* Card styling for print */
  .card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  /* Table styling for print */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  
  th, td {
    border: 1px solid #ddd !important;
    padding: 8px !important;
    font-size: 10pt !important;
  }
  
  th {
    background-color: #f5f5f5 !important;
    font-weight: bold !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* Badge styling for print */
  .badge {
    border: 1px solid currentColor !important;
    background: transparent !important;
  }
  
  /* Ensure links show URLs */
  a[href]:after {
    content: none !important;
  }
  
  /* Page breaks */
  h1, h2, h3 {
    page-break-after: avoid;
  }
  
  /* Receipt specific styles */
  .receipt-container {
    max-width: 100% !important;
    margin: 0 !important;
  }
  
  /* Report card styles */
  .report-card {
    page-break-after: always;
  }
  
  /* Chart hiding - charts don't print well */
  .recharts-wrapper {
    display: none !important;
  }
  
  /* Print header/footer */
  @page {
    margin: 1cm;
    size: A4;
  }
  
  /* First page */
  @page :first {
    margin-top: 2cm;
  }
}
```

### 6. Enhanced ReportGenerator

Add async support and new configurations:

```typescript
// src/utils/reportGenerator.ts - additions

// Add async version with progress callback
static async generateExcelAsync(
  config: ReportConfig, 
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(10);
  
  const wb = XLSX.utils.book_new();
  onProgress?.(30);
  
  // ... existing Excel generation logic ...
  
  onProgress?.(70);
  
  // Save the Excel file
  const fileName = `${config.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  onProgress?.(100);
}

// Add new report configurations
export const ReportConfigs = {
  // ... existing configs ...
  
  studentList: (data: any[], filters: any): ReportConfig => ({
    title: 'Student List Export',
    type: 'student',
    data,
    columns: [
      { key: 'student_id', label: 'Student ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile_number', label: 'Mobile' },
      { key: 'courses.name', label: 'Course' },
      { key: 'courses.code', label: 'Course Code' },
      { key: 'semester', label: 'Semester' },
      { key: 'year', label: 'Year' },
      { key: 'admission_date', label: 'Admission Date', formatter: (value) => value ? format(new Date(value), 'PPP') : '' },
      { key: 'status', label: 'Status' }
    ],
    filters,
    summary: {
      totalRecords: data.length,
      additionalInfo: {
        'Active': data.filter(s => s.status === 'active').length,
        'Graduated': data.filter(s => s.status === 'graduated').length,
        'Inactive': data.filter(s => s.status === 'inactive').length
      }
    }
  }),

  attendanceRecords: (data: any[], filters: any): ReportConfig => ({
    title: 'Attendance Records Export',
    type: 'attendance',
    data,
    columns: [
      { key: 'student_number', label: 'Student ID' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'course_name', label: 'Course' },
      { key: 'total_sessions', label: 'Total Sessions' },
      { key: 'present_count', label: 'Present' },
      { key: 'absent_count', label: 'Absent' },
      { key: 'late_count', label: 'Late' },
      { key: 'attendance_percentage', label: 'Attendance %', formatter: (value) => `${value}%` }
    ],
    filters,
    summary: {
      totalRecords: data.length,
      additionalInfo: {
        'Average Attendance': `${(data.reduce((sum, s) => sum + s.attendance_percentage, 0) / data.length || 0).toFixed(1)}%`,
        'Low Attendance (<75%)': data.filter(s => s.attendance_percentage < 75).length
      }
    }
  }),

  feeCollectionReport: (data: any[], filters: any): ReportConfig => ({
    title: 'Fee Collection Report',
    type: 'financial',
    data,
    columns: [
      { key: 'students.student_id', label: 'Student ID' },
      { key: 'students.name', label: 'Student Name' },
      { key: 'students.courses.code', label: 'Course' },
      { key: 'total_amount', label: 'Total Fee', formatter: (value) => `₹${value?.toLocaleString() || 0}` },
      { key: 'paid_amount', label: 'Paid', formatter: (value) => `₹${value?.toLocaleString() || 0}` },
      { key: 'balance_amount', label: 'Balance', formatter: (value) => `₹${value?.toLocaleString() || 0}` },
      { key: 'status', label: 'Status' },
      { key: 'due_date', label: 'Due Date', formatter: (value) => value ? format(new Date(value), 'PPP') : '' }
    ],
    filters,
    summary: {
      totalRecords: data.length,
      additionalInfo: {
        'Total Fee': `₹${data.reduce((sum, r) => sum + (r.total_amount || 0), 0).toLocaleString()}`,
        'Total Collected': `₹${data.reduce((sum, r) => sum + (r.paid_amount || 0), 0).toLocaleString()}`,
        'Total Pending': `₹${data.reduce((sum, r) => sum + (r.balance_amount || 0), 0).toLocaleString()}`
      }
    }
  })
};
```

---

## File Structure

```text
src/
├── components/
│   └── exports/
│       ├── ExportButton.tsx           # NEW: Unified export button
│       ├── DateRangeExportDialog.tsx  # NEW: Date range filter dialog
│       ├── ExportProgress.tsx         # NEW: Progress indicator
│       ├── pdfTemplates/
│       │   ├── StudentReportCard.tsx  # NEW: Report card PDF
│       │   ├── FeeReceiptPDF.tsx      # NEW: Receipt PDF
│       │   └── CertificatePDF.tsx     # NEW: Certificate PDF
│       └── index.ts                   # NEW: Barrel exports
├── utils/
│   └── reportGenerator.ts             # Modified: Add new configs
├── pages/
│   ├── Students.tsx                   # Modified: Add Excel export
│   ├── Fees.tsx                       # Modified: Add Excel/PDF export
│   ├── Attendance.tsx                 # Modified: Add export buttons
│   └── Exams.tsx                      # Modified: Enhance exports
└── index.css                          # Modified: Add print stylesheet
```

---

## Implementation Checklist

### Phase 1: Core Export Infrastructure
1. Create ExportButton component with dropdown menu
2. Create DateRangeExportDialog component
3. Create ExportProgress component
4. Create exports/index.ts barrel file

### Phase 2: PDF Templates
5. Create StudentReportCard PDF generator
6. Create FeeReceiptPDF generator
7. Create CertificatePDF generator (enhanced)

### Phase 3: ReportGenerator Enhancements
8. Add async versions with progress callbacks
9. Add new report configurations (studentList, attendanceRecords, feeCollectionReport)
10. Add helper functions for number-to-words conversion

### Phase 4: Page Integration
11. Update Students.tsx - replace CSV with ExportButton
12. Update Fees.tsx - add Excel export and PDF receipt button
13. Update Attendance.tsx - add export buttons to student records tab
14. Update Exams.tsx - enhance existing export functionality

### Phase 5: Print Stylesheet
15. Add comprehensive @media print styles to index.css
16. Add print-specific classes (.no-print, .print-only)
17. Test print output on major pages

---

## Export Functionality by Page

| Page | Excel Export | PDF Export | Individual PDF |
|------|-------------|------------|----------------|
| Students | Student list with filters | Student list report | Report card per student |
| Fees | Fee collection with date range | Fee summary report | Receipt per payment |
| Attendance | Attendance records | Attendance summary | - |
| Exams/Results | Results with filters | Results summary | Marksheet, Certificate |

---

## Filename Convention

All exports will follow this naming pattern:
```
{type}_{identifier}_{YYYY-MM-DD}.{ext}
```

Examples:
- `students_export_2026-02-01.xlsx`
- `fee_collection_2026-01-01_to_2026-02-01.xlsx`
- `attendance_records_2026-02-01.pdf`
- `Fee_Receipt_RCP-2026-0001_2026-02-01.pdf`
- `Report_Card_STU001_2026-02-01.pdf`
- `Certificate_Achievement_STU001_2026-02-01.pdf`

---

## Progress Indicator Behavior

1. **Quick exports (<100 records)**: Show button loading state only
2. **Medium exports (100-500 records)**: Show inline progress bar
3. **Large exports (>500 records)**: Show dialog with detailed progress

Progress stages:
- 0-20%: Preparing data
- 20-50%: Generating document
- 50-80%: Formatting and styling
- 80-100%: Saving file

---

## Dependencies

Already installed and available:
- `xlsx` - Excel generation
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF tables
- `html2canvas` - HTML to image conversion
- `date-fns` - Date formatting

No new dependencies required.

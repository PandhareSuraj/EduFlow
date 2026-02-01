import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface StudentData {
  student_id: string;
  name: string;
  email?: string;
  course_name?: string;
  course_code?: string;
  semester?: number;
  year?: number;
  academic_year?: string;
}

interface ResultData {
  exam_name: string;
  subject_name?: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
}

interface CollegeData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  signature_url?: string;
  signature_title?: string;
}

// Helper to get grade from percentage
const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

export async function generateStudentReportCard(
  student: StudentData,
  results: ResultData[],
  college: CollegeData
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with college name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(college.name, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (college.address) {
    doc.text(college.address, pageWidth / 2, 28, { align: "center" });
  }
  if (college.phone || college.email) {
    doc.text(
      `${college.phone ? `Phone: ${college.phone}` : ""} ${college.email ? `| Email: ${college.email}` : ""}`.trim(),
      pageWidth / 2,
      35,
      { align: "center" }
    );
  }

  // Line separator
  doc.setDrawColor(0);
  doc.line(14, 40, pageWidth - 14, 40);

  // Report Card Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT REPORT CARD", pageWidth / 2, 50, { align: "center" });

  // Student Details
  const studentInfo = [
    ["Student Name", student.name],
    ["Student ID", student.student_id],
    ["Course", student.course_name || "N/A"],
    ["Semester", student.semester ? `Semester ${student.semester}` : "N/A"],
    ["Academic Year", student.academic_year || `${new Date().getFullYear()}`],
  ];

  autoTable(doc, {
    body: studentInfo,
    startY: 58,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: 80 },
    },
  });

  // Results Table
  if (results.length > 0) {
    const resultsData = results.map((r, idx) => [
      idx + 1,
      r.exam_name,
      r.subject_name || "-",
      r.marks_obtained,
      r.total_marks,
      `${r.percentage.toFixed(1)}%`,
      r.grade,
    ]);

    autoTable(doc, {
      head: [["#", "Examination", "Subject", "Marks", "Total", "Percentage", "Grade"]],
      body: resultsData,
      startY: (doc as any).lastAutoTable.finalY + 15,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Summary
    const avgPercentage =
      results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    const overallGrade = getGradeFromPercentage(avgPercentage);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryY = (doc as any).lastAutoTable.finalY + 15;
    doc.text(`Overall Percentage: ${avgPercentage.toFixed(1)}%`, 14, summaryY);
    doc.text(`Overall Grade: ${overallGrade}`, 14, summaryY + 8);
    doc.text(`Result: ${avgPercentage >= 40 ? "PASS" : "FAIL"}`, 14, summaryY + 16);
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("No exam results available.", 14, (doc as any).lastAutoTable.finalY + 15);
  }

  // Footer with signature
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Signature area
  if (college.signature_url) {
    try {
      doc.addImage(college.signature_url, "PNG", pageWidth - 70, footerY - 10, 50, 20);
    } catch (e) {
      console.log("Could not add signature image");
    }
  }
  doc.line(pageWidth - 80, footerY + 15, pageWidth - 20, footerY + 15);
  doc.text(
    college.signature_title || "Principal Signature",
    pageWidth - 50,
    footerY + 22,
    { align: "center" }
  );

  doc.text(`Generated on: ${format(new Date(), "PPP")}`, 14, footerY + 22);

  // Save
  doc.save(
    `Report_Card_${student.student_id}_${format(new Date(), "yyyy-MM-dd")}.pdf`
  );
}

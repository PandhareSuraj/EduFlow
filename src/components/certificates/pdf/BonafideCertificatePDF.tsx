import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import type { CertificateCollege } from "./TransferCertificatePDF";

const val = (v?: string | null) => (v && v.trim() !== "" ? v : "________________");
const fmtDate = (d?: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "________________");

export async function generateBonafideCertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 20;
  const right = pageWidth - 20;

  // Border
  doc.setDrawColor(60, 60, 120);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Top row: college code & registration
  let y = 24;
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`College Code: ${val(student.college_code)}`, left, y);
  doc.text(`No: ${val(student.bonafide_no)}`, right, y, { align: "right" });
  y += 10;

  // Header
  doc.setTextColor(30, 30, 90);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(college.name || "College Name", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setTextColor(40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (college.address) {
    doc.text(college.address, pageWidth / 2, y, { align: "center" });
    y += 6;
  }

  // Title
  y += 6;
  doc.setTextColor(30, 30, 90);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Bonafide Certificate", pageWidth / 2, y, { align: "center" });
  doc.setLineWidth(0.4);
  const titleW = doc.getTextWidth("Bonafide Certificate");
  doc.line(pageWidth / 2 - titleW / 2, y + 1.5, pageWidth / 2 + titleW / 2, y + 1.5);
  y += 18;

  // Body
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const body =
    `This is to certify that Mr./Miss. ${val(student.full_name)}, Register No. ${val(student.register_no)}, ` +
    `is/was a bonafide student of ${val(student.course)} ${student.class ? "(" + student.class + ")" : ""} ` +
    `during the academic year ${val(student.academic_year)}. ` +
    `His/Her Date of Birth as per college register is ${fmtDate(student.date_of_birth)}. ` +
    `His/Her character is ${val(student.character || student.conduct)}.`;

  const lines = doc.splitTextToSize(body, right - left);
  doc.text(lines, left, y, { lineHeightFactor: 1.8 });
  y += lines.length * 9 + 10;

  if (student.remarks) {
    const r = doc.splitTextToSize(student.remarks, right - left);
    doc.text(r, left, y, { lineHeightFactor: 1.6 });
  }

  // Footer
  const footerY = pageHeight - 35;
  doc.setFontSize(10);
  doc.text(`Date: ${format(new Date(), "dd/MM/yyyy")}`, left, footerY);
  doc.text("Clerk", pageWidth / 2, footerY, { align: "center" });
  doc.text(college.signatureTitle || "Principal", right, footerY, { align: "right" });

  doc.save(
    `Bonafide_${(student.full_name || "student").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`
  );
}

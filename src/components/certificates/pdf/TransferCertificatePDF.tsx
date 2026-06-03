import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";

export interface CertificateCollege {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  signatureTitle?: string;
}

const fmtDate = (d?: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "________________");
const val = (v?: string | null) => (v && v.trim() !== "" ? v : "________________");

export async function generateTransferCertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 18;
  const right = pageWidth - 18;

  // Outer border
  doc.setDrawColor(120, 20, 20);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.3);
  doc.rect(12.5, 12.5, pageWidth - 25, pageHeight - 25);

  // Header
  let y = 22;
  doc.setTextColor(120, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(college.name || "College Name", pageWidth / 2, y, { align: "center" });
  y += 7;
  doc.setTextColor(40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (college.address) {
    doc.text(college.address, pageWidth / 2, y, { align: "center" });
    y += 5;
  }
  const contact = [
    college.phone ? `Phone: ${college.phone}` : "",
    college.email ? `Email: ${college.email}` : "",
  ]
    .filter(Boolean)
    .join("   |   ");
  if (contact) {
    doc.setFontSize(9);
    doc.text(contact, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  // Title
  doc.setDrawColor(120, 20, 20);
  doc.setLineWidth(0.4);
  doc.line(left, y, right, y);
  y += 7;
  doc.setTextColor(120, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TRANSFER / LEAVING CERTIFICATE", pageWidth / 2, y, { align: "center" });
  y += 8;

  // T.C. No and College Code row
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`T.C. No: ${val(student.tc_no)}`, left, y);
  doc.text(`College Code: ${val(student.college_code)}`, right, y, { align: "right" });
  y += 6;
  doc.text(`Register No / PRN: ${val(student.register_no)}`, left, y);
  y += 8;

  const lineH = 8;
  const writeRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, left, y);
    const labelW = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.text(value, left + labelW + 2, y);
    y += lineH;
  };

  writeRow("1) Name of the Student: ", val(student.full_name));
  writeRow("2) Mother's Name: ", val(student.mother_name));
  writeRow("3) Father's / Guardian Name: ", val(student.father_name));
  writeRow("4) Caste / Sub-Caste: ", `${val(student.caste)}    Religion: ${val(student.religion)}`);
  writeRow("5) Nationality: ", `${val(student.nationality)}    Place of Birth: ${val(student.place_of_birth)}`);
  writeRow("6) Date of Birth (figures): ", fmtDate(student.date_of_birth));
  writeRow("    Date of Birth (in words): ", val(student.date_of_birth_words));
  writeRow("7) Date of Admission: ", `${fmtDate(student.date_of_admission)}    Class: ${val(student.class)}`);
  writeRow("8) Date of Leaving: ", `${fmtDate(student.date_of_leaving)}    Course: ${val(student.course)}`);

  // Subjects (wrapped)
  doc.setFont("helvetica", "bold");
  doc.text("9) Subjects studied: ", left, y);
  const subjLabelW = doc.getTextWidth("9) Subjects studied: ");
  doc.setFont("helvetica", "normal");
  const subjLines = doc.splitTextToSize(val(student.subjects), right - left - subjLabelW - 2);
  doc.text(subjLines, left + subjLabelW + 2, y);
  y += lineH * Math.max(1, subjLines.length);

  writeRow("10) Conduct: ", val(student.conduct));

  // Remarks block
  doc.setFont("helvetica", "bold");
  doc.text("11) Remarks:", left, y);
  y += lineH;
  doc.setFont("helvetica", "normal");
  const appeared = student.exam_appeared ? "has appeared" : "has not appeared";
  const result = student.result ? `and has ${student.result}` : "";
  const remarkText = `a) He/She ${appeared} for the ${val(student.exam_name)} examination held in ${val(
    student.exam_session
  )} ${result} under Seat No. ${val(student.seat_no)}.`;
  const remarkLines = doc.splitTextToSize(remarkText, right - left - 6);
  doc.text(remarkLines, left + 6, y);
  y += lineH * remarkLines.length;
  if (student.remarks) {
    const bLines = doc.splitTextToSize(`b) ${student.remarks}`, right - left - 6);
    doc.text(bLines, left + 6, y);
    y += lineH * bLines.length;
  }

  // Footer signatures
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.text(`Date: ${format(new Date(), "dd/MM/yyyy")}`, left, footerY);
  doc.text("Clerk", pageWidth / 2, footerY, { align: "center" });
  doc.text(college.signatureTitle || "Principal", right, footerY, { align: "right" });

  doc.save(`TC_${(student.full_name || "student").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

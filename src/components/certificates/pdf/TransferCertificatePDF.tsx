import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import { loadImageAsDataUrl } from "./pdfUtils";

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

// Classic maroon accent tone
const ACCENT: [number, number, number] = [120, 20, 20];

export async function generateTransferCertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 20;
  const right = pageWidth - 20;
  const center = pageWidth / 2;

  const logo = await loadImageAsDataUrl(college.logoUrl);

  // ---- Double ornate border ----
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.1);
  doc.rect(9, 9, pageWidth - 18, pageHeight - 18);
  doc.setLineWidth(0.3);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Corner accent marks
  const corner = (x: number, y: number, dx: number, dy: number) => {
    doc.setLineWidth(0.8);
    doc.line(x, y, x + dx, y);
    doc.line(x, y, x, y + dy);
  };
  corner(14, 14, 8, 8);
  corner(pageWidth - 14, 14, -8, 8);
  corner(14, pageHeight - 14, 8, -8);
  corner(pageWidth - 14, pageHeight - 14, -8, -8);

  // ---- Header ----
  let y = 20;
  const hasLogo = !!logo;
  if (hasLogo && logo) {
    const lw = 22;
    const lh = (logo.height / logo.width) * lw || lw;
    try {
      doc.addImage(logo.dataUrl, "PNG", left, y, lw, Math.min(lh, 24));
    } catch {
      /* ignore */
    }
  }

  doc.setTextColor(...ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(college.name || "College Name", center, y + 6, { align: "center" });
  y += 12;
  doc.setTextColor(40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  if (college.address) {
    doc.text(college.address, center, y, { align: "center" });
    y += 4.5;
  }
  const contact = [
    college.phone ? `Phone: ${college.phone}` : "",
    college.email ? `Email: ${college.email}` : "",
  ]
    .filter(Boolean)
    .join("   |   ");
  if (contact) {
    doc.setFontSize(9);
    doc.text(contact, center, y, { align: "center" });
    y += 4.5;
  }
  if (college.code) {
    doc.setFontSize(8.5);
    doc.setTextColor(90);
    doc.text(`College Code: ${college.code}`, center, y, { align: "center" });
    y += 4.5;
  }

  // Header divider
  y += 1;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(left, y, right, y);
  y += 8;

  // ---- Title ----
  doc.setTextColor(...ACCENT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const title = "TRANSFER / LEAVING CERTIFICATE";
  doc.text(title, center, y, { align: "center", charSpace: 0.6 });
  const titleW = doc.getTextWidth(title) + 0.6 * (title.length - 1);
  doc.setLineWidth(0.4);
  doc.line(center - titleW / 2, y + 1.8, center + titleW / 2, y + 1.8);
  y += 10;

  // ---- Reference row ----
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`T.C. No: ${val(student.tc_no)}`, left, y);
  doc.text(`Register No / PRN: ${val(student.register_no)}`, right, y, { align: "right" });
  y += 8;

  // ---- Fields ----
  const lineH = 7.6;
  const writeRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
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

  // Closing certification line
  y += 2;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(60);
  const closing = doc.splitTextToSize(
    "Certified that the above information is true as per the college records.",
    right - left
  );
  doc.text(closing, left, y);

  // ---- Footer: Seal + Principal ----
  const footerY = pageHeight - 42;
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Date: ${format(new Date(), "dd/MM/yyyy")}`, left, footerY - 6);
  doc.text("Place: ____________", left, footerY);

  // Seal box (left)
  doc.setDrawColor(120);
  doc.setLineWidth(0.4);
  doc.circle(left + 14, footerY + 14, 13);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("Office Seal", left + 14, footerY + 14, { align: "center" });

  // Principal signature (right)
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(right - 55, footerY + 16, right, footerY + 16);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Principal", right, footerY + 21, { align: "right" });
  if (college.signatureTitle && college.signatureTitle !== "Principal") {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90);
    doc.text(college.signatureTitle, right, footerY + 26, { align: "right" });
  }

  doc.save(`TC_${(student.full_name || "student").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

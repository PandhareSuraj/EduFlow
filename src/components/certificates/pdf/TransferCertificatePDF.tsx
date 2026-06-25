import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import { loadImageAsDataUrl, setLangFont, type CertificateLang } from "./pdfUtils";
import { getCertStrings } from "./certificateStrings";

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
  college: CertificateCollege,
  lang: CertificateLang = "en"
): Promise<void> {
  const t = getCertStrings(lang);
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
  if (logo) {
    const lw = 22;
    const lh = (logo.height / logo.width) * lw || lw;
    try {
      doc.addImage(logo.dataUrl, "PNG", left, y, lw, Math.min(lh, 24));
    } catch {
      /* ignore */
    }
  }

  doc.setTextColor(...ACCENT);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(19);
  doc.text(college.name || "College Name", center, y + 6, { align: "center" });
  y += 12;
  doc.setTextColor(40);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(9.5);
  if (college.address) {
    doc.text(college.address, center, y, { align: "center" });
    y += 4.5;
  }
  const contact = [
    college.phone ? `${t.phone}: ${college.phone}` : "",
    college.email ? `${t.email}: ${college.email}` : "",
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
    doc.text(t.collegeCode(college.code), center, y, { align: "center" });
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
  setLangFont(doc, lang, "bold");
  doc.setFontSize(15);
  const title = t.tcTitle;
  doc.text(title, center, y, { align: "center" });
  const titleW = doc.getTextWidth(title);
  doc.setLineWidth(0.4);
  doc.line(center - titleW / 2, y + 1.8, center + titleW / 2, y + 1.8);
  y += 10;

  // ---- Reference row ----
  doc.setTextColor(0);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(10);
  doc.text(`${t.tcNo}: ${val(student.tc_no)}`, left, y);
  doc.text(`${t.registerNo}: ${val(student.register_no)}`, right, y, { align: "right" });
  y += 8;

  // ---- Fields ----
  const lineH = 7.6;
  const writeRow = (label: string, value: string) => {
    setLangFont(doc, lang, "bold");
    doc.setFontSize(10);
    doc.text(label, left, y);
    const labelW = doc.getTextWidth(label);
    setLangFont(doc, lang, "normal");
    doc.text(value, left + labelW + 2, y);
    y += lineH;
  };

  writeRow(t.tcName, val(student.full_name));
  writeRow(t.tcMother, val(student.mother_name));
  writeRow(t.tcFather, val(student.father_name));
  // Caste / Nationality combined rows
  setLangFont(doc, lang, "normal");
  doc.text(t.tcCaste(val(student.caste), val(student.religion)), left, y);
  y += lineH;
  doc.text(t.tcNationality(val(student.nationality), val(student.place_of_birth)), left, y);
  y += lineH;
  writeRow(t.tcDobFigures, fmtDate(student.date_of_birth));
  writeRow(t.tcDobWords, val(student.date_of_birth_words));
  setLangFont(doc, lang, "normal");
  doc.text(t.tcAdmission(fmtDate(student.date_of_admission), val(student.class)), left, y);
  y += lineH;
  doc.text(t.tcLeaving(fmtDate(student.date_of_leaving), val(student.course)), left, y);
  y += lineH;

  // Subjects (wrapped)
  setLangFont(doc, lang, "bold");
  doc.text(t.tcSubjects, left, y);
  const subjLabelW = doc.getTextWidth(t.tcSubjects);
  setLangFont(doc, lang, "normal");
  const subjLines = doc.splitTextToSize(val(student.subjects), right - left - subjLabelW - 2);
  doc.text(subjLines, left + subjLabelW + 2, y);
  y += lineH * Math.max(1, subjLines.length);

  writeRow(t.tcConduct, val(student.conduct));

  // Remarks block
  setLangFont(doc, lang, "bold");
  doc.text(t.tcRemarks, left, y);
  y += lineH;
  setLangFont(doc, lang, "normal");
  const remarkText = t.tcRemarkBody({
    appeared: !!student.exam_appeared,
    examName: val(student.exam_name),
    session: val(student.exam_session),
    result: student.result || "",
    seatNo: val(student.seat_no),
  });
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
  setLangFont(doc, lang, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60);
  const closing = doc.splitTextToSize(t.tcClosing, right - left);
  doc.text(closing, left, y);

  // ---- Footer: Seal + Principal ----
  const footerY = pageHeight - 42;
  doc.setTextColor(0);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(10);
  doc.text(`${t.date}: ${format(new Date(), "dd/MM/yyyy")}`, left, footerY - 6);
  doc.text(`${t.place}: ____________`, left, footerY);

  // Seal box (left)
  doc.setDrawColor(120);
  doc.setLineWidth(0.4);
  doc.circle(left + 14, footerY + 14, 13);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(t.officeSeal, left + 14, footerY + 14, { align: "center" });

  // Principal signature (right)
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(right - 55, footerY + 16, right, footerY + 16);
  doc.setTextColor(0);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(10);
  doc.text(t.principal, right, footerY + 21, { align: "right" });
  if (lang === "en" && college.signatureTitle && college.signatureTitle !== "Principal") {
    setLangFont(doc, lang, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90);
    doc.text(college.signatureTitle, right, footerY + 26, { align: "right" });
  }

  doc.save(`TC_${(student.full_name || "student").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

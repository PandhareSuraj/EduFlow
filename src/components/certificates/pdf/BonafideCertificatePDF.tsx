import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import type { CertificateCollege } from "./TransferCertificatePDF";
import { loadImageAsDataUrl, setLangFont, type CertificateLang } from "./pdfUtils";
import { getCertStrings } from "./certificateStrings";

const val = (v?: string | null) => (v && v.trim() !== "" ? v : "________________");
const fmtDate = (d?: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "________________");

// Classic navy accent tone
const ACCENT: [number, number, number] = [30, 30, 90];

export async function generateBonafideCertificatePDF(
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
  y += 10;

  // ---- Title ----
  doc.setTextColor(...ACCENT);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(16);
  const title = t.bonafideTitle;
  doc.text(title, center, y, { align: "center" });
  const titleW = doc.getTextWidth(title);
  doc.setLineWidth(0.4);
  doc.line(center - titleW / 2, y + 1.8, center + titleW / 2, y + 1.8);
  y += 8;

  // ---- Reference row ----
  doc.setTextColor(0);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(10);
  doc.text(`${t.no}: ${val(student.bonafide_no)}`, left, y);
  doc.text(`${t.date}: ${format(new Date(), "dd/MM/yyyy")}`, right, y, { align: "right" });
  y += 14;

  // ---- Body ----
  doc.setTextColor(0);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(12);

  const body = t.bonafideBody({
    name: val(student.full_name),
    registerNo: val(student.register_no),
    course: val(student.course),
    cls: student.class || "",
    academicYear: val(student.academic_year),
    dob: fmtDate(student.date_of_birth),
    dobWords: student.date_of_birth_words || "",
    caste: val(student.caste),
    conduct: val(student.character || student.conduct),
  });

  const lines = doc.splitTextToSize(body, right - left);
  doc.text(lines, left, y, { lineHeightFactor: 1.9 });
  y += lines.length * 8.5 + 8;

  // Formal closing line
  doc.setFontSize(11);
  doc.text(t.bonafidePurposeLine, left, y);
  y += 8;
  setLangFont(doc, lang, "normal");
  doc.setTextColor(60);
  doc.setFontSize(10.5);
  doc.text(t.bonafidePurpose(val(student.remarks)), left, y);
  y += 6;

  // ---- Footer: Seal + Principal ----
  const footerY = pageHeight - 42;

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

  doc.save(
    `Bonafide_${(student.full_name || "student").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`
  );
}

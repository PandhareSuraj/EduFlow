import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import {
  buildCertificateFileName,
  loadImageAsDataUrl,
  setLangFont,
  type CertificateLang,
} from "./pdfUtils";
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
const val = (v?: string | null) => (v && v.trim() !== "" ? v.trim() : "________________");

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

  // ---- Fields (official 21-point format) ----
  const lineH = 6.8;
  setLangFont(doc, lang, "normal");
  doc.setFontSize(10);
  doc.setTextColor(0);

  const writeLine = (text: string) => {
    const lines = doc.splitTextToSize(text, right - left);
    doc.text(lines, left, y);
    y += lineH * lines.length;
  };

  writeLine(t.tcRowName(val(student.full_name)));
  writeLine(t.tcRowFather(val(student.father_name)));
  writeLine(t.tcRowMother(val(student.mother_name)));
  writeLine(t.tcNationality(val(student.nationality)));
  writeLine(t.tcMotherTongue(val(student.mother_tongue)));
  writeLine(t.tcReligionCasteSub(val(student.religion), val(student.caste), val(student.sub_caste)));
  writeLine(t.tcBirthplaceTaluka(val(student.place_of_birth), val(student.taluka)));
  writeLine(
    t.tcDistrictStateCountry(
      val(student.district),
      student.state && student.state.trim() !== "" ? student.state : (lang === "mr" ? "महाराष्ट्र" : "Maharashtra"),
      lang === "mr" ? "भारत" : "India"
    )
  );
  writeLine(t.tcDobFigures(fmtDate(student.date_of_birth)));
  writeLine(t.tcDobWords(val(student.date_of_birth_words)));
  writeLine(t.tcPrevSchool(val(student.previous_school)));
  writeLine(t.tcAdmissionClass(fmtDate(student.date_of_admission), val(student.class)));
  writeLine(t.tcProgressConduct(val(student.study_progress), val(student.conduct)));
  writeLine(t.tcLeavingDate(fmtDate(student.date_of_leaving)));
  writeLine(t.tcStudyingSince(val(student.studying_since)));
  writeLine(t.tcLeavingReason(val(student.leaving_reason)));
  writeLine(t.tcRemarks(val(student.remarks)));

  // Closing certification line
  y += 2;
  setLangFont(doc, lang, "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60);
  const closing = doc.splitTextToSize(t.tcClosing(val(student.general_register_no)), right - left);
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

  doc.save(buildCertificateFileName(student.full_name, "TC Certificate", lang));
}

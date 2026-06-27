import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import type { CertificateCollege } from "./TransferCertificatePDF";
import { getAdditionalCertificateText } from "./additionalCertificateTranslations";
import {
  buildCertificateFileName,
  loadImageAsDataUrl,
  setLangFont,
  type CertificateLang,
} from "./pdfUtils";

const RED: [number, number, number] = [130, 28, 36];
const BLACK: [number, number, number] = [25, 25, 25];
const value = (input?: string | null) => input?.trim() || "";
const dateValue = (input?: string | null) =>
  input ? format(new Date(input), "dd/MM/yyyy") : "";

function drawValueOrBlank(
  doc: jsPDF,
  lang: CertificateLang,
  text: string,
  x: number,
  y: number,
  width: number,
  align: "left" | "center" = "left"
) {
  if (text) {
    setLangFont(doc, lang, "bold");
    const fitted = doc.splitTextToSize(text, width - 2)[0] || text;
    doc.text(fitted, align === "center" ? x + width / 2 : x + 1, y, { align });
  } else {
    doc.setDrawColor(45);
    doc.setLineWidth(0.3);
    doc.line(x, y + 1.2, x + width, y + 1.2);
  }
}

async function drawSchoolIdentity(
  doc: jsPDF,
  college: CertificateCollege,
  lang: CertificateLang,
  y: number,
  compact = false
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const center = pageWidth / 2;
  const logo = await loadImageAsDataUrl(college.logoUrl);
  if (logo) {
    try {
      doc.addImage(logo.dataUrl, "PNG", 18, y, compact ? 20 : 25, compact ? 20 : 25);
    } catch {
      // The certificate remains usable if a remote logo cannot be embedded.
    }
  }

  setLangFont(doc, lang, "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(compact ? 16 : 19);
  const schoolName = college.name ||
    (lang === "mr"
      ? "गोकुळनाथ माध्यमिक व उच्च माध्यमिक विद्यालय पिंगळी"
      : "Gokulnath Secondary & Higher Secondary School, Pingli");
  doc.text(doc.splitTextToSize(schoolName, 142), center, y + 8, {
    align: "center",
    lineHeightFactor: 1.05,
  });

  setLangFont(doc, lang, "normal");
  doc.setTextColor(...BLACK);
  doc.setFontSize(9.5);
  if (college.address) doc.text(college.address, center, y + (compact ? 19 : 24), { align: "center" });
}

export async function generateCharacterCertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege,
  lang: CertificateLang = "en"
): Promise<void> {
  const t = getAdditionalCertificateText(lang).character;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const boxWidth = 190;
  const boxHeight = 138;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxY = (pageHeight - boxHeight) / 2;
  const left = boxX + 15;
  const right = boxX + boxWidth - 15;
  const center = pageWidth / 2;

  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.75);
  doc.rect(boxX, boxY, boxWidth, boxHeight);
  doc.setLineWidth(0.25);
  doc.rect(boxX + 3, boxY + 3, boxWidth - 6, boxHeight - 6);

  setLangFont(doc, lang, "bold");
  doc.setTextColor(...BLACK);
  doc.setFontSize(lang === "mr" ? 16 : 17);
  doc.text(t.title, center, boxY + 17, { align: "center" });
  const titleWidth = doc.getTextWidth(t.title);
  doc.setLineWidth(0.35);
  doc.line(center - titleWidth / 2, boxY + 19, center + titleWidth / 2, boxY + 19);

  doc.setFontSize(11.5);
  doc.text(t.certify, left, boxY + 31);

  setLangFont(doc, lang, "normal");
  doc.setFontSize(10.8);
  doc.text(`${t.honorific}:`, left, boxY + 43);
  drawValueOrBlank(doc, lang, value(student.full_name), left + 22, boxY + 43, 120);

  setLangFont(doc, lang, "normal");
  doc.text(doc.splitTextToSize(t.bonafide, right - left), left, boxY + 55);

  const school = college.name || "";
  drawValueOrBlank(doc, lang, school, left, boxY + 66, right - left);

  setLangFont(doc, lang, "normal");
  doc.text(t.studying, left, boxY + 78);

  drawValueOrBlank(doc, lang, value(student.class), left + 45, boxY + 78, 30);
  drawValueOrBlank(doc, lang, value(student.course), left + 78, boxY + 78, 64);

  setLangFont(doc, lang, "normal");
  doc.text(t.during, left, boxY + 90);
  drawValueOrBlank(doc, lang, value(student.academic_year), left + 65, boxY + 90, 42);

  setLangFont(doc, lang, "bold");
  doc.setFontSize(10.8);
  doc.text(t.character, left, boxY + 103);

  doc.text(`${t.dob}:`, left, boxY + 115);
  drawValueOrBlank(doc, lang, dateValue(student.date_of_birth), left + 31, boxY + 115, 45);

  setLangFont(doc, lang, "bold");
  doc.text(t.clerk, left, boxY + 129);
  doc.text(t.signature, right, boxY + 129, { align: "right" });

  doc.save(buildCertificateFileName(student.full_name, "Character Certificate", lang));
}

export async function generateForm15ACertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege,
  lang: CertificateLang = "en"
): Promise<void> {
  const t = getAdditionalCertificateText(lang).form15a;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const left = 24;
  const right = width - 24;
  const lineWidth = right - left;

  setLangFont(doc, lang, "bold");
  doc.setTextColor(...BLACK);
  doc.setFontSize(16);
  doc.text(t.form, width / 2, 31, { align: "center" });
  doc.setFontSize(lang === "mr" ? 14 : 15);
  doc.text(t.title, width / 2, 43, { align: "center" });
  doc.line(35, 46, width - 35, 46);

  setLangFont(doc, lang, "normal");
  doc.setFontSize(12.5);
  doc.text(t.certify, left, 80);
  drawValueOrBlank(doc, lang, value(student.full_name), left + 66, 80, lineWidth - 66);

  setLangFont(doc, lang, "normal");
  doc.text(t.studentOf, left, 96);
  doc.text(t.year, left, 110);
  drawValueOrBlank(doc, lang, value(student.academic_year), left + 42, 110, 36);
  setLangFont(doc, lang, "normal");
  doc.text(t.studying, left + 82, 110);
  drawValueOrBlank(doc, lang, value(student.class), left + 122, 110, 39);

  drawValueOrBlank(doc, lang, value(student.course), left, 125, 48);
  setLangFont(doc, lang, "normal");
  doc.text(t.faculty, left + 51, 125);
  drawValueOrBlank(doc, lang, value(student.general_register_no || student.register_no), left, 140, 48);
  setLangFont(doc, lang, "normal");
  doc.text(t.register, left + 51, 140);

  doc.text(t.caste, left, 159);
  drawValueOrBlank(doc, lang, value(student.caste), left, 174, 112);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(10.5);
  doc.text(t.strike, left + 116, 174);

  doc.setFontSize(11.5);
  setLangFont(doc, lang, "bold");
  doc.text(`${t.place}:`, left, 223);
  drawValueOrBlank(doc, lang, "", left + 22, 223, 48);
  doc.text(`${t.date}:`, left, 238);
  drawValueOrBlank(doc, lang, format(new Date(), "dd/MM/yyyy"), left + 22, 238, 48);

  doc.text(t.signature, right, 242, { align: "right" });
  doc.save(buildCertificateFileName(student.full_name, "Form 15A Certificate", lang));
}

export async function generateAdmissionLeavingExtractPDF(
  student: CertificateStudent,
  college: CertificateCollege,
  lang: CertificateLang = "en"
): Promise<void> {
  const t = getAdditionalCertificateText(lang).extract;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const x = 12;
  const tableWidth = width - 24;
  const labelWidth = 61;

  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.7);
  doc.roundedRect(9, 8, width - 18, height - 16, 4, 4);

  setLangFont(doc, lang, "bold");
  doc.setFontSize(9.5);
  doc.text(t.management, width / 2, 17, { align: "center" });
  await drawSchoolIdentity(doc, college, lang, 15, true);
  doc.setFontSize(17);
  doc.setTextColor(...BLACK);
  doc.text(t.title, width / 2, 46, { align: "center" });

  const boxX = width - 61;
  doc.setLineWidth(0.45);
  doc.rect(boxX, 31, 47, 19);
  doc.line(boxX, 40.5, boxX + 47, 40.5);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(8.5);
  doc.text(`${t.extractNo}:`, boxX + 2, 37);
  doc.text(`${t.pageNo}:`, boxX + 2, 46.5);

  let y = 54;
  const drawRow = (label: string, fieldValue: string, rowHeight = 8, splitLabel = false) => {
    doc.setDrawColor(30);
    doc.setLineWidth(0.35);
    doc.rect(x, y, tableWidth, rowHeight);
    doc.line(x + labelWidth, y, x + labelWidth, y + rowHeight);
    setLangFont(doc, lang, "bold");
    doc.setTextColor(...BLACK);
    doc.setFontSize(7.8);
    const labelLines = splitLabel ? doc.splitTextToSize(label, labelWidth - 5) : [label];
    doc.text(labelLines, x + 3, y + (rowHeight - labelLines.length * 3.5) / 2 + 3.5);
    drawValueOrBlank(doc, lang, fieldValue, x + labelWidth + 2, y + rowHeight / 2 + 1.5, tableWidth - labelWidth - 5);
    y += rowHeight;
  };

  drawRow(t.admissionSerial, value(student.register_no));
  drawRow(t.fullName, value(student.full_name), 10);
  drawRow(t.aadhaar, "");
  drawRow(t.fatherGuardian, value(student.father_name), 10, true);
  drawRow(t.motherName, value(student.mother_name));

  doc.rect(x, y, tableWidth, 9);
  doc.line(x + labelWidth, y, x + labelWidth, y + 9);
  doc.line(x + 119, y, x + 119, y + 9);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(8.5);
  doc.text(t.religion, x + 3, y + 6);
  drawValueOrBlank(doc, lang, value(student.religion), x + labelWidth + 2, y + 6, 52);
  doc.text(t.caste, x + 122, y + 6);
  drawValueOrBlank(doc, lang, value(student.caste), x + 138, y + 6, tableWidth - 141);
  y += 9;

  drawRow(t.subCaste, value(student.sub_caste));
  drawRow(t.birthPlace, value(student.place_of_birth));
  drawRow(t.guardianOccupation, "", 10, true);
  drawRow(t.motherTongue, value(student.mother_tongue));
  drawRow(t.admissionDate, dateValue(student.date_of_admission));

  doc.rect(x, y, tableWidth, 14);
  doc.line(x + 38, y, x + 38, y + 14);
  doc.line(x + labelWidth, y, x + labelWidth, y + 14);
  doc.line(x + 38, y + 7, x + tableWidth, y + 7);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(8.3);
  doc.text(t.birthDate, x + 3, y + 8);
  doc.text(t.figures, x + 40, y + 5);
  doc.text(t.words, x + 40, y + 12);
  drawValueOrBlank(doc, lang, dateValue(student.date_of_birth), x + labelWidth + 2, y + 5, tableWidth - labelWidth - 5);
  drawValueOrBlank(doc, lang, value(student.date_of_birth_words), x + labelWidth + 2, y + 12, tableWidth - labelWidth - 5);
  y += 14;

  drawRow(t.admissionClass, value(student.class));
  drawRow(t.previousSchool, value(student.previous_school), 10);
  drawRow(t.admittingOfficer, "", 10, true);
  drawRow(t.leavingClass, value(student.class));
  drawRow(t.leavingDate, dateValue(student.date_of_leaving));
  drawRow(t.leavingReason, value(student.leaving_reason), 10);
  drawRow(t.identification, "", 9);
  drawRow(t.leavingOfficer, "", 10, true);
  drawRow(t.headSignature, "", 9);
  drawRow(t.remarks, value(student.remarks), 10);

  setLangFont(doc, lang, "bold");
  doc.setFontSize(9.5);
  doc.text(t.place, x + 3, height - 17);
  doc.text(t.headmistress, width - 16, height - 17, { align: "right" });

  doc.save(buildCertificateFileName(student.full_name, "Admission Leaving Extract", lang));
}

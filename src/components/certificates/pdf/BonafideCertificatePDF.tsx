import jsPDF from "jspdf";
import { format } from "date-fns";
import i18n from "@/i18n";
import type { CertificateStudent } from "../CertificateStudentForm";
import type { CertificateCollege } from "./TransferCertificatePDF";
import { loadImageAsDataUrl, setLangFont, type CertificateLang } from "./pdfUtils";

const RED: [number, number, number] = [135, 28, 38];
const DARK: [number, number, number] = [35, 35, 35];

const val = (v?: string | null) => (v && v.trim() !== "" ? v.trim() : "");
const fmtDate = (d?: string | null) => (d ? format(new Date(d), "dd/MM/yyyy") : "");
const safeFilePart = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_");

interface RichTextSegment {
  text: string;
  bold?: boolean;
}

export async function generateBonafideCertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege,
  lang: CertificateLang = "en"
): Promise<void> {
  const lng = lang === "mr" ? "mr" : "en";
  const t = (key: string, options?: Record<string, string>) =>
    i18n.t(`certificates.bonafide.${key}`, { lng, ...options });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const boxW = 190;
  const boxH = 136;
  const boxX = (pageWidth - boxW) / 2;
  const boxY = (pageHeight - boxH) / 2;
  const left = boxX + 8;
  const right = boxX + boxW - 8;
  const center = boxX + boxW / 2;

  const logo = await loadImageAsDataUrl(college.logoUrl);
  const date = format(new Date(), "dd/MM/yyyy");
  const name = val(student.full_name);
  const admissionNo = val(student.register_no);
  const cls = val(student.class);
  const course = val(student.course);
  const academicYear = val(student.academic_year);
  const dob = fmtDate(student.date_of_birth);
  const dobWords = val(student.date_of_birth_words);
  const certNo = val(student.bonafide_no);
  const signature = t("signature");

  const writeRichText = (
    segments: RichTextSegment[],
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    let cursorX = x;
    let cursorY = y;

    segments.forEach((segment) => {
      setLangFont(doc, lang, segment.bold ? "bold" : "normal");
      const tokens = segment.text.split(/(\s+)/);

      tokens.forEach((token) => {
        if (!token) return;
        const isSpace = /^\s+$/.test(token);
        if (isSpace && cursorX === x) return;

        const tokenWidth = doc.getTextWidth(token);
        if (cursorX + tokenWidth > x + maxWidth && !isSpace) {
          cursorX = x;
          cursorY += lineHeight;
        }

        doc.text(token, cursorX, cursorY);
        cursorX += tokenWidth;
      });
    });

    return cursorY;
  };

  doc.setFillColor(255, 255, 248);
  doc.rect(boxX, boxY, boxW, boxH, "F");

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.9);
  doc.rect(boxX, boxY, boxW, boxH);
  doc.setLineWidth(0.35);
  doc.rect(boxX + 3, boxY + 3, boxW - 6, boxH - 6);

  const logoX = left;
  const logoY = boxY + 11;
  const logoSize = 22;
  if (logo) {
    try {
      doc.addImage(logo.dataUrl, "PNG", logoX, logoY, logoSize, logoSize);
    } catch {
      doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2);
    }
  } else {
    doc.setDrawColor(100);
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2);
    setLangFont(doc, lang, "normal");
    doc.setFontSize(7);
    doc.text(t("logo"), logoX + logoSize / 2, logoY + 13, { align: "center" });
  }

  const photoX = right - 25;
  const photoY = boxY + 10;
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.45);
  doc.roundedRect(photoX, photoY, 22, 30, 2, 2);

  setLangFont(doc, lang, "normal");
  doc.setTextColor(...DARK);
  doc.setFontSize(lang === "mr" ? 10 : 11);
  doc.text(t("management"), center, boxY + 16, { align: "center" });

  setLangFont(doc, lang, "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(lang === "mr" ? 17 : 18);
  const schoolName = college.name || t("schoolNameFallback");
  doc.text(doc.splitTextToSize(schoolName, 105), center, boxY + 26, {
    align: "center",
    lineHeightFactor: 1.1,
  });

  setLangFont(doc, lang, "normal");
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.text(college.address || t("placeFallback"), center, boxY + 44, { align: "center" });

  setLangFont(doc, lang, "bold");
  doc.setFontSize(10);
  doc.text(`${t("numberLabel")}:`, left, boxY + 50);
  doc.setTextColor(...RED);
  doc.setFontSize(15);
  doc.text(certNo, left + 17, boxY + 50);

  doc.setTextColor(...DARK);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(9.5);
  const admY = boxY + 61;
  doc.rect(left, admY - 6, 22, 8);
  doc.rect(left + 22, admY - 6, 26, 8);
  doc.text(t("admissionNoLabel"), left + 2, admY - 1);
  setLangFont(doc, lang, "bold");
  doc.text(admissionNo, left + 24, admY - 1);

  const pillW = 74;
  const pillH = 13;
  const pillX = center - pillW / 2;
  const pillY = boxY + 55;
  doc.setFillColor(...RED);
  doc.setDrawColor(...RED);
  doc.roundedRect(pillX, pillY, pillW, pillH, 6, 6, "FD");
  setLangFont(doc, lang, "bold");
  doc.setFontSize(lang === "mr" ? 14 : 15);
  doc.setTextColor(255, 255, 255);
  doc.text(t("title"), center, pillY + 8.8, { align: "center" });

  const bodyTop = boxY + 78;
  const lineW = right - left;
  doc.setTextColor(...DARK);
  doc.setFontSize(lang === "mr" ? 10.8 : 11);

  writeRichText(
    [
      { text: t("bodyPrefix") },
      { text: name, bold: true },
      { text: t("bodyAfterName") },
      { text: cls, bold: true },
      { text: t("bodyBetweenClassCourse") },
      { text: course, bold: true },
      { text: t("bodyAfterCourse") },
      { text: academicYear, bold: true },
      { text: t("bodyAfterAcademicYear") },
      { text: dob, bold: true },
      { text: t("bodyAfterDob") },
      { text: dobWords, bold: true },
      { text: t("bodyAfterDobWords") },
    ],
    left,
    bodyTop,
    lineW,
    7.2
  );

  const footerY = boxY + boxH - 14;
  setLangFont(doc, lang, "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(10);
  doc.text(`${t("dateLabel")}: ${date}`, left, footerY);
  doc.text(signature, right - 11, footerY, { align: "right" });

  doc.save(`${safeFilePart(student.full_name || "student")}_bonafide_${lng === "mr" ? "marathi" : "english"}.pdf`);
}

import jsPDF from "jspdf";
import { format } from "date-fns";
import type { CertificateStudent } from "../CertificateStudentForm";
import {
  buildCertificateFileName,
  loadImageAsDataUrl,
  setLangFont,
  type CertificateLang,
} from "./pdfUtils";

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

const RED: [number, number, number] = [130, 32, 42];
const BLACK: [number, number, number] = [28, 28, 28];
const clean = (input?: string | null) => input?.trim() || "";
const date = (input?: string | null) =>
  input ? format(new Date(input), "dd/MM/yyyy") : "";

const LC_TEXT = {
  en: {
    management: "Nath Shikshan Prasarak Mandal, Pingli, Tq. & Dist. Parbhani",
    fallbackSchool: "Gokulnath Secondary & Higher Secondary School, Pingli",
    department: "(Arts and Science) Tq. & Dist. Parbhani",
    original: "ORIGINAL COPY",
    established: "Established: 2001",
    recognition: "School Recognition No.",
    udise: "UDISE No. 27170508104",
    board: "Board Divisional Code, Aurangabad: J 60.01.019",
    admissionNo: "Admission No.",
    certificateNo: "Certificate No.",
    title: "SCHOOL LEAVING CERTIFICATE",
    studentId: "STUDENT ID",
    aadhaar: "UID No. (Aadhaar No.)",
    name: "1) Student's Name",
    father: "Father's Name",
    surname: "Surname",
    mother: "Mother's Name",
    nationality: "2) Nationality",
    motherTongue: "3) Mother Tongue",
    religion: "4) Religion",
    caste: "5) Caste",
    subCaste: "6) Sub-Caste",
    birthPlace: "7) Place of Birth (Village/Town)",
    taluka: "8) Taluka",
    district: "9) District",
    state: "10) State",
    country: "11) Country",
    dobFigures: "12) Date of Birth (in figures)",
    dobWords: "Date of Birth (in words)",
    previousSchool: "13) Previous School and Class",
    admissionDate: "14) Date of Admission in this School",
    class: "15) Class",
    progress: "16) Progress in Studies",
    conduct: "17) Conduct",
    leavingDate: "18) Date of Leaving School",
    studyingSince: "19) Class studied in and since when (in words and figures)",
    reason: "20) Reason for Leaving School",
    request: "On the written request of Student / Parent",
    remarks: "21) Remarks",
    closingStart: "Certified that the above information is correct as per the School General Register No.",
    date: "Date",
    classTeacher: "Class Teacher",
    clerk: "Clerk",
    headmistress: "Headmistress",
    footer: "Unauthorized alteration in the School Leaving Certificate is liable for legal action.",
    indian: "Indian",
    maharashtra: "Maharashtra",
    india: "India",
    good: "Good",
  },
  mr: {
    management: "नाथ शिक्षण प्रसारक मंडळ, पिंगळी ता. जि. परभणी संचलित",
    fallbackSchool: "गोकुळनाथ माध्यमिक व उच्च माध्यमिक विद्यालय पिंगळी",
    department: "(कला व विज्ञान) ता. जि. परभणी",
    original: "मूळ प्रत",
    established: "स्थापना वर्ष - २००१",
    recognition: "शाळा मान्यता क्रमांक",
    udise: "यू डायस क्र. २७१७०५०८१०४",
    board: "बोर्ड विभागीय मंडळ औरंगाबाद संलग्नता क्र. J 60.01.019",
    admissionNo: "प्रवेश क्र.",
    certificateNo: "प्रमाणपत्र क्रमांक",
    title: "शाळा सोडल्याचे प्रमाणपत्र",
    studentId: "स्टुडंट आय डी.",
    aadhaar: "यू आय डी नं. (आधार क्र.)",
    name: "१) विद्यार्थ्याचे नाव",
    father: "वडिलांचे नाव",
    surname: "आडनाव",
    mother: "आईचे नाव",
    nationality: "२) राष्ट्रीयत्व",
    motherTongue: "३) मातृभाषा",
    religion: "४) धर्म",
    caste: "५) जात",
    subCaste: "६) पोटजात",
    birthPlace: "७) जन्मस्थळ (गाव/शहर)",
    taluka: "८) तालुका",
    district: "९) जिल्हा",
    state: "१०) राज्य",
    country: "११) देश",
    dobFigures: "१२) इ. सनाप्रमाणे जन्म दिनांक अंकी",
    dobWords: "जन्म दिनांक अक्षरी",
    previousSchool: "१३) या पूर्वीची शाळा व इयत्ता",
    admissionDate: "१४) या शाळेत प्रवेश घेतल्याचा दिनांक",
    class: "१५) इयत्ता",
    progress: "१६) अभ्यासातील प्रगती",
    conduct: "१७) वर्तणूक",
    leavingDate: "१८) शाळा सोडल्याचा दिनांक",
    studyingSince: "१९) कोणत्या इयत्तेत शिकत होता व केव्हापासून (अक्षरी व अंकी)",
    reason: "२०) शाळा सोडण्याचे कारण",
    request: "विद्यार्थी / पालक यांच्या विनंती अर्जावरून",
    remarks: "२१) शेरा",
    closingStart: "दाखला देण्यात येतो की, वरील सर्व माहिती शाळेतील जनरल रजिस्टर नं.",
    date: "दिनांक",
    classTeacher: "वर्ग शिक्षक",
    clerk: "लिपिक",
    headmistress: "मुख्याध्यापिका",
    footer: "शाळा सोडल्याच्या दाखल्यामध्ये अनधिकृतरीत्या बदल केल्यास संबंधितांवर कायदेशीर कारवाई करण्यात येईल.",
    indian: "भारतीय",
    maharashtra: "महाराष्ट्र",
    india: "भारत",
    good: "चांगली",
  },
} as const;

function fitText(doc: jsPDF, text: string, width: number): string {
  if (!text) return "";
  let result = text;
  while (doc.getTextWidth(result) > width && result.length > 3) {
    result = `${result.slice(0, -4).trim()}...`;
  }
  return result;
}

function drawField(
  doc: jsPDF,
  lang: CertificateLang,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  labelWidth?: number
) {
  setLangFont(doc, lang, "bold");
  doc.setFontSize(lang === "mr" ? 8.2 : 8.5);
  doc.setTextColor(...BLACK);
  doc.text(label, x, y);
  const valueX = x + (labelWidth ?? doc.getTextWidth(label) + 2.5);
  const available = Math.max(8, width - (valueX - x));

  if (value) {
    setLangFont(doc, lang, "bold");
    doc.text(fitText(doc, value, available), valueX, y);
  } else {
    doc.setDrawColor(55);
    doc.setLineWidth(0.25);
    doc.line(valueX, y + 1, x + width, y + 1);
  }
}

function drawDigitBoxes(doc: jsPDF, value: string, x: number, y: number, count: number, boxWidth = 6) {
  const characters = value.replace(/\s/g, "").slice(0, count).split("");
  doc.setDrawColor(45);
  doc.setLineWidth(0.3);
  for (let index = 0; index < count; index += 1) {
    doc.rect(x + index * boxWidth, y, boxWidth, 7);
    if (characters[index]) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(characters[index], x + index * boxWidth + boxWidth / 2, y + 5, { align: "center" });
    }
  }
}

function drawDateBoxes(doc: jsPDF, value: string, x: number, y: number) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  let digitIndex = 0;
  let currentX = x;
  [2, 2, 4].forEach((groupSize, groupIndex) => {
    for (let index = 0; index < groupSize; index += 1) {
      doc.rect(currentX, y, 6, 7);
      const digit = digits[digitIndex];
      if (digit) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text(digit, currentX + 3, y + 5, { align: "center" });
      }
      currentX += 6;
      digitIndex += 1;
    }
    if (groupIndex < 2) currentX += 3;
  });
}

export async function generateLeavingCertificatePDF(
  student: CertificateStudent,
  college: CertificateCollege,
  lang: CertificateLang = "en"
): Promise<void> {
  const t = LC_TEXT[lang];
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 12;
  const right = pageWidth - 12;
  const contentWidth = right - left;
  const center = pageWidth / 2;
  const logo = await loadImageAsDataUrl(college.logoUrl);

  doc.setDrawColor(...RED);
  doc.setLineWidth(0.85);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.28);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  if (logo) {
    try {
      doc.addImage(logo.dataUrl, "PNG", 13, 13, 22, 22);
    } catch {
      // Keep the official form usable when a remote logo cannot be embedded.
    }
  }

  doc.setFillColor(...RED);
  doc.roundedRect(right - 29, 10, 29, 9, 0, 0, "F");
  setLangFont(doc, lang, "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.text(t.original, right - 14.5, 16.2, { align: "center" });

  doc.setTextColor(...BLACK);
  doc.setFontSize(lang === "mr" ? 9.5 : 8.5);
  doc.text(t.management, center, 17, { align: "center" });
  doc.setTextColor(...RED);
  const schoolName = college.name || t.fallbackSchool;
  let schoolFontSize = lang === "mr" ? 17 : 16;
  doc.setFontSize(schoolFontSize);
  while (doc.getTextWidth(schoolName) > 158 && schoolFontSize > 11.5) {
    schoolFontSize -= 0.5;
    doc.setFontSize(schoolFontSize);
  }
  doc.text(schoolName, center, 27.5, { align: "center" });
  doc.setTextColor(...BLACK);
  doc.setFontSize(8.5);
  doc.text(t.department, center, 35, { align: "center" });
  doc.text(t.established, left, 39);

  const rule = (y: number) => {
    doc.setDrawColor(40);
    doc.setLineWidth(0.3);
    doc.line(10, y, pageWidth - 10, y);
  };
  rule(41);
  setLangFont(doc, lang, "normal");
  doc.setFontSize(8.2);
  doc.text(`Email: ${college.email || "gokulnathpingli@gmail.com"}`, left, 46.5);
  doc.text(`Phone: ${college.phone || "02452-266820"}`, right, 46.5, { align: "right" });
  rule(49);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(7.4);
  doc.text(`${t.recognition}:`, left, 54.5);
  drawField(doc, lang, "", "", left + 35, 54.5, 59, 0);
  rule(57);
  doc.text(t.udise, left, 62.5);
  doc.text(t.board, right, 62.5, { align: "right" });
  rule(65);
  doc.text(`${t.admissionNo}:`, left, 70.5);
  drawField(doc, lang, "", clean(student.register_no), left + 23, 70.5, 55, 0);
  doc.text(`${t.certificateNo}:`, right - 53, 70.5);
  setLangFont(doc, lang, "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(12);
  doc.text(clean(student.tc_no), right, 70.5, { align: "right" });
  rule(73);

  doc.setDrawColor(...BLACK);
  doc.setFillColor(250, 250, 246);
  doc.roundedRect(center - 41, 76, 82, 12, 6, 6, "FD");
  setLangFont(doc, lang, "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(lang === "mr" ? 13 : 12.5);
  doc.text(t.title, center, 84.1, { align: "center" });
  rule(91);

  setLangFont(doc, lang, "bold");
  doc.setTextColor(...RED);
  doc.setFontSize(7.5);
  doc.text(t.studentId, left, 98);
  drawDigitBoxes(doc, clean(student.register_no), left + 25, 93.5, 18, 5.8);
  doc.text(t.aadhaar, left, 107);
  drawDigitBoxes(doc, "", left + 39, 102.5, 12, 5.8);
  rule(112);

  let y = 120;
  const rowGap = 8.1;
  drawField(doc, lang, t.name, clean(student.full_name), left, y, 105, 40);
  drawField(doc, lang, t.father, clean(student.father_name), 119, y, 78, 29);
  y += rowGap;
  drawField(doc, lang, t.surname, "", left + 7, y, 98, 27);
  drawField(doc, lang, t.mother, clean(student.mother_name), 119, y, 78, 25);
  y += rowGap;
  drawField(doc, lang, t.nationality, clean(student.nationality) || t.indian, left, y, 91, 35);
  drawField(doc, lang, t.motherTongue, clean(student.mother_tongue), 119, y, 78, 34);
  y += rowGap;
  drawField(doc, lang, t.religion, clean(student.religion), left, y, 58, 24);
  drawField(doc, lang, t.caste, clean(student.caste), 72, y, 57, 22);
  drawField(doc, lang, t.subCaste, clean(student.sub_caste), 139, y, 58, 25);
  y += rowGap;
  drawField(doc, lang, t.birthPlace, clean(student.place_of_birth), left, y, 117, 50);
  drawField(doc, lang, t.taluka, clean(student.taluka), 139, y, 58, 23);
  y += rowGap;
  drawField(doc, lang, t.district, clean(student.district), left, y, 58, 24);
  drawField(doc, lang, t.state, clean(student.state) || t.maharashtra, 72, y, 57, 24);
  drawField(doc, lang, t.country, t.india, 139, y, 58, 25);
  y += rowGap;

  setLangFont(doc, lang, "bold");
  doc.setFontSize(lang === "mr" ? 8.2 : 8.5);
  doc.text(t.dobFigures, left, y);
  drawDateBoxes(doc, date(student.date_of_birth), left + 61, y - 5.5);
  y += rowGap;
  drawField(doc, lang, t.dobWords, clean(student.date_of_birth_words), left + 7, y, contentWidth - 7, 42);
  y += rowGap;
  drawField(doc, lang, t.previousSchool, clean(student.previous_school), left, y, contentWidth, 54);
  y += rowGap;
  drawField(doc, lang, t.admissionDate, date(student.date_of_admission), left, y, 117, 61);
  drawField(
    doc,
    lang,
    t.class,
    [clean(student.class), clean(student.course)].filter(Boolean).join(" "),
    139,
    y,
    58,
    20
  );
  y += rowGap;
  drawField(doc, lang, t.progress, clean(student.study_progress) || t.good, left, y, 117, 43);
  drawField(doc, lang, t.conduct, clean(student.conduct) || t.good, 139, y, 58, 26);
  y += rowGap;
  drawField(doc, lang, t.leavingDate, date(student.date_of_leaving), left, y, contentWidth, 50);
  y += rowGap;
  drawField(doc, lang, t.studyingSince, clean(student.studying_since), left, y, contentWidth, 90);
  y += rowGap;
  drawField(doc, lang, t.reason, clean(student.leaving_reason), left, y, 104, 49);
  setLangFont(doc, lang, "bold");
  doc.setFontSize(8.1);
  doc.text(t.request, right, y, { align: "right" });
  y += rowGap;
  drawField(doc, lang, t.remarks, clean(student.remarks), left, y, contentWidth, 25);

  y += 12;
  setLangFont(doc, lang, "bold");
  doc.setFontSize(lang === "mr" ? 8.1 : 8.4);
  doc.setTextColor(...BLACK);
  doc.text(t.closingStart, left, y);
  const closingX = left + doc.getTextWidth(t.closingStart) + 2;
  const registerNumber = clean(student.general_register_no);
  if (registerNumber) {
    doc.text(registerNumber, closingX, y);
  } else {
    doc.line(closingX, y + 1, Math.min(right, closingX + 25), y + 1);
  }
  y += 10;
  doc.text(`${t.date}: ${format(new Date(), "dd/MM/yyyy")}`, left, y);

  const signatureY = pageHeight - 24;
  doc.text(t.classTeacher, left + 4, signatureY, { align: "left" });
  doc.text(t.clerk, center, signatureY, { align: "center" });
  doc.text(t.headmistress, right - 4, signatureY, { align: "right" });
  rule(pageHeight - 19);
  doc.setFontSize(6.8);
  doc.text(t.footer, center, pageHeight - 14, { align: "center" });

  doc.save(buildCertificateFileName(student.full_name, "LC Certificate", lang));
}

// Kept as an alias so existing imports outside the certificate registry do not break.
export const generateTransferCertificatePDF = generateLeavingCertificatePDF;

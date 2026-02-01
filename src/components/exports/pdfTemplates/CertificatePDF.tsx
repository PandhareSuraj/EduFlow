import jsPDF from "jspdf";
import { format } from "date-fns";

interface CertificateData {
  type: "achievement" | "merit" | "participation" | "completion";
  studentName: string;
  studentId: string;
  courseName?: string;
  examName?: string;
  grade?: string;
  percentage?: number;
  rank?: number;
  date?: string;
  description?: string;
}

interface CollegeData {
  name: string;
  address?: string;
  signature_url?: string;
  signature_title?: string;
}

export async function generateCertificatePDF(
  certificate: CertificateData,
  college: CollegeData
): Promise<void> {
  // Create landscape A4 document
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Border design
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Certificate Type Badge
  const getCertificateTitle = () => {
    switch (certificate.type) {
      case "achievement":
        return "CERTIFICATE OF ACHIEVEMENT";
      case "merit":
        return "CERTIFICATE OF MERIT";
      case "participation":
        return "CERTIFICATE OF PARTICIPATION";
      case "completion":
        return "CERTIFICATE OF COMPLETION";
      default:
        return "CERTIFICATE";
    }
  };

  // Title
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185);
  doc.text(getCertificateTitle(), pageWidth / 2, 45, { align: "center" });

  // Institution name
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text(college.name, pageWidth / 2, 60, { align: "center" });

  if (college.address) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(college.address, pageWidth / 2, 68, { align: "center" });
  }

  // Main content
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text("This is to certify that", pageWidth / 2, 90, { align: "center" });

  // Student name
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(certificate.studentName, pageWidth / 2, 105, { align: "center" });

  // Underline for name
  const nameWidth = doc.getTextWidth(certificate.studentName);
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(
    pageWidth / 2 - nameWidth / 2 - 10,
    108,
    pageWidth / 2 + nameWidth / 2 + 10,
    108
  );

  // Student ID
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Student ID: ${certificate.studentId}`, pageWidth / 2, 118, { align: "center" });

  // Certificate details
  let detailsY = 130;
  doc.setFontSize(14);
  doc.setTextColor(60);

  if (certificate.courseName) {
    doc.text(
      `has successfully completed the course "${certificate.courseName}"`,
      pageWidth / 2,
      detailsY,
      { align: "center" }
    );
    detailsY += 10;
  }

  if (certificate.examName) {
    doc.text(
      `in the "${certificate.examName}" examination`,
      pageWidth / 2,
      detailsY,
      { align: "center" }
    );
    detailsY += 10;
  }

  if (certificate.grade || certificate.percentage) {
    const gradeText = [];
    if (certificate.percentage) gradeText.push(`${certificate.percentage.toFixed(1)}%`);
    if (certificate.grade) gradeText.push(`Grade: ${certificate.grade}`);
    if (certificate.rank) gradeText.push(`Rank: ${certificate.rank}`);
    
    doc.setFont("helvetica", "bold");
    doc.text(`with ${gradeText.join(" | ")}`, pageWidth / 2, detailsY, { align: "center" });
    detailsY += 10;
  }

  if (certificate.description) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.text(certificate.description, pageWidth / 2, detailsY + 5, { align: "center" });
  }

  // Date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const displayDate = certificate.date
    ? format(new Date(certificate.date), "do MMMM, yyyy")
    : format(new Date(), "do MMMM, yyyy");
  doc.text(`Date: ${displayDate}`, 40, pageHeight - 40);

  // Signature
  if (college.signature_url) {
    try {
      doc.addImage(college.signature_url, "PNG", pageWidth - 90, pageHeight - 55, 50, 20);
    } catch (e) {
      console.log("Could not add signature image");
    }
  }
  doc.setDrawColor(0);
  doc.line(pageWidth - 100, pageHeight - 30, pageWidth - 40, pageHeight - 30);
  doc.setFontSize(10);
  doc.text(
    college.signature_title || "Principal",
    pageWidth - 70,
    pageHeight - 24,
    { align: "center" }
  );

  // Certificate number/ID at bottom
  doc.setFontSize(8);
  doc.setTextColor(150);
  const certId = `CERT-${certificate.studentId}-${format(new Date(), "yyyyMMdd")}`;
  doc.text(certId, pageWidth / 2, pageHeight - 15, { align: "center" });

  // Save
  doc.save(
    `Certificate_${certificate.type}_${certificate.studentId}_${format(new Date(), "yyyy-MM-dd")}.pdf`
  );
}

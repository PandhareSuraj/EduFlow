import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ReceiptData {
  receipt_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id?: string;
  cheque_number?: string;
  bank_name?: string;
  remarks?: string;
  student: {
    name: string;
    student_id: string;
    email?: string;
    mobile_number?: string;
    course: {
      name: string;
      code: string;
    };
  };
  college: {
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    signature_url?: string;
    signature_title?: string;
  };
}

// Helper to convert number to words (for Indian currency)
const numberToWords = (num: number): string => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  const convertLessThanThousand = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertLessThanThousand(n % 100) : "");
  };

  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    const remaining = num % 10000000;
    return convertLessThanThousand(crore) + " Crore" + (remaining ? " " + numberToWords(remaining) : "");
  }
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    const remaining = num % 100000;
    return convertLessThanThousand(lakh) + " Lakh" + (remaining ? " " + numberToWords(remaining) : "");
  }
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    const remaining = num % 1000;
    return convertLessThanThousand(thousand) + " Thousand" + (remaining ? " " + convertLessThanThousand(remaining) : "");
  }
  return convertLessThanThousand(num);
};

export async function generateFeeReceiptPDF(receipt: ReceiptData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // College Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(receipt.college.name, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (receipt.college.address) {
    doc.text(receipt.college.address, pageWidth / 2, 28, { align: "center" });
  }
  if (receipt.college.phone || receipt.college.email) {
    doc.text(
      `Phone: ${receipt.college.phone || "N/A"} | Email: ${receipt.college.email || "N/A"}`,
      pageWidth / 2,
      35,
      { align: "center" }
    );
  }

  // Receipt Title
  doc.setDrawColor(0);
  doc.line(14, 42, pageWidth - 14, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", pageWidth / 2, 52, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Receipt No: ${receipt.receipt_number}`, pageWidth / 2, 60, { align: "center" });

  // Student & Payment Details
  const details = [
    ["Student Name", receipt.student.name, "Payment Date", format(new Date(receipt.payment_date), "PPP")],
    ["Student ID", receipt.student.student_id, "Payment Method", receipt.payment_method.toUpperCase()],
    [
      "Course",
      `${receipt.student.course.name} (${receipt.student.course.code})`,
      "Transaction ID",
      receipt.transaction_id || "N/A",
    ],
    ["Mobile", receipt.student.mobile_number || "N/A", "Cheque No.", receipt.cheque_number || "N/A"],
  ];

  autoTable(doc, {
    body: details,
    startY: 70,
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 },
      1: { cellWidth: 55 },
      2: { fontStyle: "bold", cellWidth: 35 },
      3: { cellWidth: 55 },
    },
  });

  // Amount Box
  const amountY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, amountY, pageWidth - 28, 30, 3, 3, "F");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Amount Paid:", 24, amountY + 12);
  doc.setFontSize(20);
  doc.text(`₹${receipt.amount.toLocaleString("en-IN")}`, 24, amountY + 24);

  // Amount in words
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    `(${numberToWords(Math.floor(receipt.amount))} Rupees Only)`,
    pageWidth / 2,
    amountY + 40,
    { align: "center" }
  );

  // Remarks if any
  if (receipt.remarks) {
    doc.setFont("helvetica", "normal");
    doc.text(`Remarks: ${receipt.remarks}`, 14, amountY + 52);
  }

  // Signature
  const sigY = amountY + 65;
  if (receipt.college.signature_url) {
    try {
      doc.addImage(receipt.college.signature_url, "PNG", pageWidth - 70, sigY, 50, 20);
    } catch (e) {
      console.log("Could not add signature image");
    }
  }
  doc.line(pageWidth - 80, sigY + 25, pageWidth - 20, sigY + 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    receipt.college.signature_title || "Authorized Signature",
    pageWidth - 50,
    sigY + 32,
    { align: "center" }
  );

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This is a computer generated receipt.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Save
  doc.save(`Fee_Receipt_${receipt.receipt_number}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

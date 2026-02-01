import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Calendar, CreditCard, User, GraduationCap } from "lucide-react";
import { generateFeeReceiptPDF } from "@/components/exports/pdfTemplates/FeeReceiptPDF";

interface PaymentReceiptProps {
  receipt: {
    id: string;
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
      email: string;
      mobile_number: string;
      course: {
        name: string;
        code: string;
      };
    };
    college: {
      name: string;
      code: string;
      address: string;
      phone: string;
      email: string;
      signature_url?: string;
      signature_title?: string;
    };
  };
  onClose?: () => void;
}

export function PaymentReceipt({ receipt, onClose }: PaymentReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    await generateFeeReceiptPDF(receipt);
  };
  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return 'Cash';
      case 'online': return 'Online Payment';
      case 'cheque': return 'Cheque';
      case 'card': return 'Card Payment';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold">{receipt.college.name}</CardTitle>
        <p className="text-muted-foreground">{receipt.college.address}</p>
        <p className="text-sm text-muted-foreground">
          Phone: {receipt.college.phone} | Email: {receipt.college.email}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">PAYMENT RECEIPT</h2>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {receipt.receipt_number}
          </Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Student Details</span>
            </div>
            <div className="pl-6 space-y-1">
              <p><span className="font-medium">Name:</span> {receipt.student.name}</p>
              <p><span className="font-medium">ID:</span> {receipt.student.student_id}</p>
              <p><span className="font-medium">Email:</span> {receipt.student.email}</p>
              <p><span className="font-medium">Mobile:</span> {receipt.student.mobile_number}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Course Details</span>
            </div>
            <div className="pl-6 space-y-1">
              <p><span className="font-medium">Course:</span> {receipt.student.course.name}</p>
              <p><span className="font-medium">Code:</span> {receipt.student.course.code}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Payment Information</span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount Paid:</span>
              <span className="text-2xl font-bold text-primary">
                ₹{receipt.amount.toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Date: {new Date(receipt.payment_date).toLocaleDateString('en-IN')}</span>
              </div>
              <div>
                <span className="font-medium">Method: </span>
                <Badge variant="secondary">{formatPaymentMethod(receipt.payment_method)}</Badge>
              </div>
            </div>

            {receipt.transaction_id && (
              <div>
                <span className="font-medium">Transaction ID: </span>
                <code className="bg-background px-2 py-1 rounded text-xs">{receipt.transaction_id}</code>
              </div>
            )}

            {receipt.cheque_number && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Cheque No: </span>
                  <span>{receipt.cheque_number}</span>
                </div>
                {receipt.bank_name && (
                  <div>
                    <span className="font-medium">Bank: </span>
                    <span>{receipt.bank_name}</span>
                  </div>
                )}
              </div>
            )}

            {receipt.remarks && (
              <div>
                <span className="font-medium">Remarks: </span>
                <span className="italic">{receipt.remarks}</span>
              </div>
            )}
          </div>
        </div>

        {/* Signature Section */}
        {receipt.college.signature_url && (
          <>
            <Separator />
            <div className="flex justify-end items-end">
              <div className="text-center space-y-2">
                <img
                  src={receipt.college.signature_url}
                  alt="Authorized Signature"
                  className="w-36 h-14 object-contain mx-auto"
                />
                <div className="border-t border-foreground/20 pt-1 px-4">
                  <p className="text-sm font-medium">
                    {receipt.college.signature_title || 'Authorized Signature'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Date: {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Generated on: {new Date().toLocaleString('en-IN')}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {onClose && (
              <Button variant="default" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
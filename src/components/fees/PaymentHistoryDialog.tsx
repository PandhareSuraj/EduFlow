import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, FileText, Download, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EditFeePaymentDialog } from "./EditFeePaymentDialog";
import { DeleteFeePaymentDialog } from "./DeleteFeePaymentDialog";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: number;
  studentName: string;
}

interface PaymentHistoryRecord {
  payment_id: string;
  payment_date: string;
  payment_amount: number;
  payment_method: string;
  receipt_number: string;
  transaction_id?: string;
  cheque_number?: string;
  bank_name?: string;
  remarks?: string;
  cumulative_paid: number;
  running_balance: number;
  payment_sequence: number;
}

export function PaymentHistoryDialog({ 
  open, 
  onOpenChange, 
  studentId, 
  studentName 
}: PaymentHistoryDialogProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && studentId) {
      fetchPaymentHistory();
    }
  }, [open, studentId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_payment_ledger')
        .select('*')
        .eq('student_id', studentId)
        .not('payment_id', 'is', null)
        .order('payment_date', { ascending: false })
        .order('payment_sequence', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        toast({
          title: "Error",
          description: "Failed to fetch payment history",
          variant: "destructive",
        });
        return;
      }

      setPaymentHistory(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPaymentHistory = () => {
    if (paymentHistory.length === 0) return;

    const csvContent = [
      ['Date', 'Amount', 'Method', 'Receipt No.', 'Transaction ID', 'Cumulative Paid', 'Balance', 'Remarks'].join(','),
      ...paymentHistory.map(payment => [
        format(new Date(payment.payment_date), 'dd/MM/yyyy'),
        payment.payment_amount,
        payment.payment_method,
        payment.receipt_number || '',
        payment.transaction_id || payment.cheque_number || '',
        payment.cumulative_paid,
        payment.running_balance,
        payment.remarks || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${studentName.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'default';
      case 'cheque': return 'secondary';
      case 'bank_transfer': return 'outline';
      case 'online': return 'default';
      case 'card': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History - {studentName}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={exportPaymentHistory}
              disabled={paymentHistory.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading payment history...</div>
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">No payment history found for this student.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {paymentHistory.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Payments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{paymentHistory[0]?.cumulative_paid.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{paymentHistory[0]?.running_balance.toLocaleString('en-IN') || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Current Balance</div>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <div
                  key={payment.payment_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                      {paymentHistory.length - index}
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-6 gap-4">
                    <div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Date
                      </div>
                      <div className="font-medium">
                        {format(new Date(payment.payment_date), 'dd MMM yyyy')}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CreditCard className="h-3 w-3" />
                        Amount
                      </div>
                      <div className="font-medium text-green-600">
                        ₹{payment.payment_amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Method</div>
                      <Badge variant={getPaymentMethodColor(payment.payment_method)}>
                        {payment.payment_method.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Receipt</div>
                      <div className="font-mono text-sm">
                        {payment.receipt_number || 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Running Total</div>
                      <div className="font-medium">
                        ₹{payment.cumulative_paid.toLocaleString('en-IN')}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className="font-medium text-orange-600">
                        ₹{payment.running_balance.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <PermissionWrapper permission="FEES_COLLECT">
                      <EditFeePaymentDialog
                        payment={{
                          id: payment.payment_id,
                          amount: payment.payment_amount,
                          payment_method: payment.payment_method,
                          payment_date: payment.payment_date,
                          transaction_id: payment.transaction_id,
                          cheque_number: payment.cheque_number,
                          bank_name: payment.bank_name,
                          remarks: payment.remarks,
                          receipt_number: payment.receipt_number,
                        }}
                        maxAmount={payment.payment_amount + payment.running_balance}
                        onSuccess={fetchPaymentHistory}
                      />
                      <DeleteFeePaymentDialog
                        paymentId={payment.payment_id}
                        receiptNumber={payment.receipt_number}
                        amount={payment.payment_amount}
                        onSuccess={fetchPaymentHistory}
                      />
                    </PermissionWrapper>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
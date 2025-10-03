import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditFeePaymentDialogProps {
  payment: {
    id: string;
    amount: number;
    payment_method: string;
    payment_date: string;
    transaction_id?: string | null;
    cheque_number?: string | null;
    bank_name?: string | null;
    remarks?: string | null;
    receipt_number: string;
  };
  maxAmount?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditFeePaymentDialog({ payment, maxAmount, trigger, onSuccess }: EditFeePaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: payment.amount,
    payment_method: payment.payment_method,
    payment_date: new Date(payment.payment_date),
    transaction_id: payment.transaction_id || "",
    cheque_number: payment.cheque_number || "",
    bank_name: payment.bank_name || "",
    remarks: payment.remarks || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    if (maxAmount && formData.amount > maxAmount) {
      toast({
        title: "Validation Error",
        description: `Amount cannot exceed ₹${maxAmount.toLocaleString('en-IN')}`,
        variant: "destructive",
      });
      return;
    }

    if (formData.payment_method === 'cheque' && !formData.cheque_number) {
      toast({
        title: "Validation Error",
        description: "Cheque number is required for cheque payments",
        variant: "destructive",
      });
      return;
    }

    if (['bank_transfer', 'online'].includes(formData.payment_method) && !formData.transaction_id) {
      toast({
        title: "Validation Error",
        description: "Transaction ID is required for this payment method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('fee_payments')
        .update({
          amount: formData.amount,
          payment_method: formData.payment_method,
          payment_date: format(formData.payment_date, 'yyyy-MM-dd'),
          transaction_id: formData.transaction_id || null,
          cheque_number: formData.cheque_number || null,
          bank_name: formData.bank_name || null,
          remarks: formData.remarks || null,
        })
        .eq('id', payment.id);

      if (error) {
        console.error('Error updating payment:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update payment",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Payment record updated successfully. Changes are logged in audit trail.",
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Payment Record
          </DialogTitle>
          <DialogDescription>
            Receipt: <strong>{payment.receipt_number}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All changes will be automatically logged in the audit trail. Receipt number cannot be changed.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
            />
            {maxAmount && (
              <p className="text-sm text-muted-foreground">
                Maximum: ₹{maxAmount.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
                <SelectItem value="card">Card Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Payment Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.payment_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.payment_date ? format(formData.payment_date, "PPP") : "Pick payment date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.payment_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, payment_date: date || new Date() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {(formData.payment_method === 'bank_transfer' || formData.payment_method === 'online') && (
            <div className="space-y-2">
              <Label htmlFor="transaction_id">Transaction ID *</Label>
              <Input
                id="transaction_id"
                placeholder="Enter transaction ID"
                value={formData.transaction_id}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
              />
            </div>
          )}

          {formData.payment_method === 'cheque' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cheque_number">Cheque Number *</Label>
                <Input
                  id="cheque_number"
                  placeholder="Enter cheque number"
                  value={formData.cheque_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, cheque_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  placeholder="Enter bank name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Add any notes or remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

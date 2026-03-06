import { useState, useEffect } from "react";
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

interface EditStudentFeeDialogProps {
  feeRecord: {
    id: string;
    student_id: number;
    original_amount: number;
    discount_amount: number;
    discount_percentage: number;
    discount_reason: string | null;
    total_amount: number;
    due_date: string;
    students?: {
      name: string;
      student_id: string;
    } | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditStudentFeeDialog({ feeRecord, trigger, onSuccess }: EditStudentFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    discount_amount: feeRecord.discount_amount || 0,
    discount_percentage: feeRecord.discount_percentage || 0,
    discount_reason: feeRecord.discount_reason || "",
    due_date: feeRecord.due_date ? new Date(feeRecord.due_date) : null as Date | null,
  });

  // Recalculate total when discount changes
  const calculateTotal = () => {
    const originalAmount = feeRecord.original_amount || feeRecord.total_amount;
    if (formData.discount_percentage > 0) {
      return originalAmount - (originalAmount * formData.discount_percentage / 100);
    }
    return originalAmount - formData.discount_amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.discount_amount < 0 || formData.discount_percentage < 0) {
      toast({
        title: "Validation Error",
        description: "Discount values cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (formData.discount_percentage > 100) {
      toast({
        title: "Validation Error",
        description: "Discount percentage cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    const newTotal = calculateTotal();
    if (newTotal < 0) {
      toast({
        title: "Validation Error",
        description: "Total amount cannot be negative after discount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('student_fees')
        .update({
          discount_amount: formData.discount_amount,
          discount_percentage: formData.discount_percentage,
          discount_reason: formData.discount_reason || null,
          total_amount: newTotal,
          // balance_amount will be recalculated by the recalc_balance_on_fee_update trigger
          due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : feeRecord.due_date,
        })
        .eq('id', feeRecord.id);

      if (error) {
        console.error('Error updating fee record:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update fee record",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Fee record updated successfully. Changes are logged in audit trail.",
      });

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error updating fee record:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, discount_amount: amount, discount_percentage: 0 }));
  };

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, discount_percentage: percentage, discount_amount: 0 }));
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
            Edit Fee Record
          </DialogTitle>
          <DialogDescription>
            {feeRecord.students ? (
              <>
                Student: <strong>{feeRecord.students.name}</strong> ({feeRecord.students.student_id})
              </>
            ) : (
              "Update discount and due date for this fee record"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              All changes will be automatically logged in the audit trail for accountability.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Original Amount</Label>
            <div className="text-2xl font-bold">
              ₹{(feeRecord.original_amount || feeRecord.total_amount).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_amount">Discount Amount (₹)</Label>
              <Input
                id="discount_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.discount_amount || ''}
                onChange={(e) => handleDiscountAmountChange(e.target.value)}
                disabled={formData.discount_percentage > 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_percentage">Discount (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="0"
                value={formData.discount_percentage || ''}
                onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                disabled={formData.discount_amount > 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount_reason">Discount Reason</Label>
            <Textarea
              id="discount_reason"
              placeholder="Enter reason for discount (optional)"
              value={formData.discount_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, discount_reason: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(formData.due_date, "PPP") : "Pick a due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">New Total Amount:</span>
              <span className="text-xl font-bold">₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>
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

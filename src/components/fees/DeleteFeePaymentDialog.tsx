import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DeleteFeePaymentDialogProps {
  paymentId: string;
  receiptNumber: string;
  amount: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteFeePaymentDialog({ 
  paymentId, 
  receiptNumber, 
  amount, 
  trigger, 
  onSuccess 
}: DeleteFeePaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('fee_payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        console.error('Error deleting payment:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete payment record",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Payment Deleted",
        description: `Payment record (${receiptNumber}) has been deleted. This action is logged in audit trail.`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error deleting payment:', error);
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Payment Record?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this payment record?</p>
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="font-medium">Receipt: {receiptNumber}</p>
              <p>Amount: ₹{amount.toLocaleString('en-IN')}</p>
            </div>
            <p className="text-destructive font-medium">
              This action will be logged in the audit trail but cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

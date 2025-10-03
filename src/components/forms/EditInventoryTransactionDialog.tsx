import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit } from "lucide-react";
import { format } from "date-fns";

interface InventoryTransaction {
  id: string;
  transaction_code: string;
  transaction_type: string;
  quantity: number;
  department?: string;
  issued_to?: string;
  purpose?: string;
  notes?: string;
  transaction_date: string;
}

interface EditInventoryTransactionDialogProps {
  transaction: InventoryTransaction;
  itemName?: string;
  onUpdate?: () => void;
  trigger?: React.ReactNode;
}

export function EditInventoryTransactionDialog({ transaction, itemName, onUpdate, trigger }: EditInventoryTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: transaction.transaction_type,
    quantity: transaction.quantity.toString(),
    department: transaction.department || "",
    issued_to: transaction.issued_to || "",
    purpose: transaction.purpose || "",
    notes: transaction.notes || ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        transaction_type: formData.transaction_type,
        quantity: parseInt(formData.quantity),
        department: formData.department || null,
        issued_to: formData.issued_to || null,
        purpose: formData.purpose || null,
        notes: formData.notes || null
      };

      const { error } = await supabase
        .from('inventory_transactions')
        .update(updateData)
        .eq('id', transaction.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
      
      setOpen(false);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Transaction - {transaction.transaction_code}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Transaction Date (Cannot be changed)</Label>
            <div className="text-sm text-muted-foreground mt-1">
              {format(new Date(transaction.transaction_date), 'PPP')}
            </div>
          </div>

          {itemName && (
            <div>
              <Label>Item (Cannot be changed)</Label>
              <div className="text-sm text-muted-foreground mt-1">{itemName}</div>
            </div>
          )}

          <div>
            <Label htmlFor="transaction_type">Transaction Type *</Label>
            <Select 
              value={formData.transaction_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, transaction_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              required
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              placeholder="e.g., Radiology, Lab"
            />
          </div>

          <div>
            <Label htmlFor="issued_to">Issued To</Label>
            <Input
              id="issued_to"
              value={formData.issued_to}
              onChange={(e) => setFormData(prev => ({ ...prev, issued_to: e.target.value }))}
              placeholder="Person or department name"
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Reason for transaction"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
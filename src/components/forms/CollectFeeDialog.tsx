import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CollectFeeDialogProps {
  trigger?: React.ReactNode;
}

export function CollectFeeDialog({ trigger }: CollectFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    amount: "",
    paymentMode: "",
    transactionId: "",
    chequeNumber: "",
    remarks: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Collected",
      description: `₹${formData.amount} payment collected from ${formData.studentName}.`,
    });
    setFormData({
      studentId: "",
      studentName: "",
      amount: "",
      paymentMode: "",
      transactionId: "",
      chequeNumber: "",
      remarks: ""
    });
    setOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Collect Fee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Collect Fee Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              placeholder="Enter student ID"
              required
            />
          </div>
          <div>
            <Label htmlFor="studentName">Student Name *</Label>
            <Input
              id="studentName"
              value={formData.studentName}
              onChange={(e) => handleChange("studentName", e.target.value)}
              placeholder="Enter student name"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          <div>
            <Label htmlFor="paymentMode">Payment Mode *</Label>
            <Select value={formData.paymentMode} onValueChange={(value) => handleChange("paymentMode", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Net Banking">Net Banking</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.paymentMode === "UPI" || formData.paymentMode === "Net Banking" || formData.paymentMode === "Card" ? (
            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => handleChange("transactionId", e.target.value)}
                placeholder="Enter transaction ID"
              />
            </div>
          ) : null}
          {formData.paymentMode === "Cheque" ? (
            <div>
              <Label htmlFor="chequeNumber">Cheque Number</Label>
              <Input
                id="chequeNumber"
                value={formData.chequeNumber}
                onChange={(e) => handleChange("chequeNumber", e.target.value)}
                placeholder="Enter cheque number"
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              placeholder="Additional remarks"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Collect Payment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
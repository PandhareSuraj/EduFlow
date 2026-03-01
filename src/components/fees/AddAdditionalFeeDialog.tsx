import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCollege } from "@/contexts/CollegeContext";
import { StudentSearchCombobox } from "@/components/ui/student-search-combobox";
import { StudentSearchResult } from "@/hooks/useStudentSearch";

const FEE_CATEGORIES = [
  { value: "exam", label: "Exam Fee" },
  { value: "lab", label: "Lab Fee" },
  { value: "library", label: "Library Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "hostel", label: "Hostel Fee" },
  { value: "sports", label: "Sports Fee" },
  { value: "development", label: "Development Fee" },
  { value: "other", label: "Other / Custom" },
];

interface AddAdditionalFeeDialogProps {
  trigger?: React.ReactNode;
  studentId?: number;
  onSuccess?: () => void;
}

export function AddAdditionalFeeDialog({ trigger, studentId, onSuccess }: AddAdditionalFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const { toast } = useToast();
  const { college } = useCollege();

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    dueDate: undefined as Date | undefined,
    discountAmount: "",
    discountPercentage: "",
    discountReason: "",
  });

  const resetForm = () => {
    setSelectedStudent(null);
    setFormData({
      category: "",
      description: "",
      amount: "",
      dueDate: undefined,
      discountAmount: "",
      discountPercentage: "",
      discountReason: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const studentToUse = selectedStudent?.id || studentId;
    if (!studentToUse) {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }
    if (!formData.category) {
      toast({ title: "Error", description: "Please select a fee category", variant: "destructive" });
      return;
    }
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid positive amount", variant: "destructive" });
      return;
    }
    if (!formData.dueDate) {
      toast({ title: "Error", description: "Please select a due date", variant: "destructive" });
      return;
    }
    if (!college?.id) {
      toast({ title: "Error", description: "No college context found", variant: "destructive" });
      return;
    }

    // Calculate discount
    const discountAmt = parseFloat(formData.discountAmount) || 0;
    const discountPct = parseFloat(formData.discountPercentage) || 0;
    let finalDiscount = discountAmt;
    if (discountPct > 0) {
      finalDiscount = amount * (discountPct / 100);
    }
    const finalAmount = Math.max(amount - finalDiscount, 0);

    setLoading(true);
    try {
      const { error } = await supabase.from("student_fees").insert({
        student_id: studentToUse,
        fee_structure_id: null,
        fee_category: formData.category,
        fee_description: formData.category === "other" ? formData.description : (FEE_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category),
        original_amount: amount,
        discount_amount: finalDiscount,
        discount_percentage: discountPct,
        discount_reason: formData.discountReason || null,
        total_amount: finalAmount,
        paid_amount: 0,
        balance_amount: finalAmount,
        due_date: format(formData.dueDate, "yyyy-MM-dd"),
        college_id: college.id,
        status: "pending",
      });

      if (error) {
        console.error("Error adding fee:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: "Fee Added",
        description: `${FEE_CATEGORIES.find(c => c.value === formData.category)?.label || formData.category} of ₹${finalAmount.toLocaleString("en-IN")} added successfully.`,
      });
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Fee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Additional Fee
          </DialogTitle>
          <DialogDescription>
            Add a new fee category to a student (e.g., Exam Fee, Lab Fee). All changes are audit-logged.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!studentId && (
            <div className="space-y-2">
              <Label>Select Student *</Label>
              <StudentSearchCombobox
                value={selectedStudent?.id}
                onSelect={setSelectedStudent}
                placeholder="Search student by name, ID..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Fee Category *</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee category" />
              </SelectTrigger>
              <SelectContent>
                {FEE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category === "other" && (
            <div className="space-y-2">
              <Label>Custom Description *</Label>
              <Input
                placeholder="e.g., Convocation Fee"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={100}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount (₹) *</Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter fee amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !formData.dueDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Optional Discount Section */}
          <div className="border rounded-md p-3 space-y-3">
            <Label className="text-sm font-medium">Discount (Optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Amount (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value, discountPercentage: "" }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Or Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: e.target.value, discountAmount: "" }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Discount Reason</Label>
              <Textarea
                placeholder="Reason for discount..."
                value={formData.discountReason}
                onChange={(e) => setFormData(prev => ({ ...prev, discountReason: e.target.value }))}
                maxLength={200}
                rows={2}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Fee
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

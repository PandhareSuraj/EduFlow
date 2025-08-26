import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CollectFeeDialogProps {
  trigger?: React.ReactNode;
  studentId?: number;
  onSuccess?: () => void;
}

interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
}

interface StudentFee {
  id: string;
  balance_amount: number;
  total_amount: number;
  paid_amount: number;
}

export function CollectFeeDialog({ trigger, studentId, onSuccess }: CollectFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    studentId: studentId?.toString() || '',
    studentName: '',
    studentFeeId: '',
    amount: '',
    paymentMode: 'cash',
    transactionId: '',
    chequeNumber: '',
    bankName: '',
    paymentDate: new Date(),
    remarks: ''
  });

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  useEffect(() => {
    if (formData.studentId) {
      fetchStudentFees(parseInt(formData.studentId));
    }
  }, [formData.studentId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, name, email')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentFees = async (studentId: number) => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('id, balance_amount, total_amount, paid_amount')
        .eq('student_id', studentId)
        .gt('balance_amount', 0);

      if (error) {
        console.error('Error fetching student fees:', error);
        return;
      }

      setStudentFees(data || []);
      
      // Auto-select first fee record if only one exists
      if (data && data.length === 1) {
        setFormData(prev => ({ ...prev, studentFeeId: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching student fees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.studentId || !formData.studentFeeId) {
      toast({
        title: "Validation Error",
        description: "Please select a student and fee record",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Check if amount exceeds balance
    const selectedFee = studentFees.find(fee => fee.id === formData.studentFeeId);
    if (selectedFee && amount > selectedFee.balance_amount) {
      toast({
        title: "Validation Error",
        description: `Amount cannot exceed balance of ₹${selectedFee.balance_amount}`,
        variant: "destructive",
      });
      return;
    }

    // Validate payment method specific fields
    if (formData.paymentMode === 'cheque' && !formData.chequeNumber) {
      toast({
        title: "Validation Error",
        description: "Cheque number is required for cheque payments",
        variant: "destructive",
      });
      return;
    }

    if (['bank_transfer', 'online'].includes(formData.paymentMode) && !formData.transactionId) {
      toast({
        title: "Validation Error",
        description: "Transaction ID is required for this payment method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's college_id
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('college_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userRoleData?.college_id) {
        toast({
          title: "Error",
          description: "Unable to determine your college association",
          variant: "destructive",
        });
        return;
      }

      // Generate receipt number
      const receiptNumber = `RCP${Date.now()}`;

      // Insert payment record
      const { error } = await supabase
        .from('fee_payments')
        .insert([{
          student_fee_id: formData.studentFeeId,
          student_id: parseInt(formData.studentId),
          amount: amount,
          payment_method: formData.paymentMode,
          transaction_id: formData.transactionId || null,
          cheque_number: formData.chequeNumber || null,
          bank_name: formData.bankName || null,
          payment_date: format(formData.paymentDate, 'yyyy-MM-dd'),
          remarks: formData.remarks || null,
          receipt_number: receiptNumber,
          college_id: userRoleData.college_id,
        }]);

      if (error) {
        console.error('Error recording payment:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to record payment",
          variant: "destructive",
        });
        return;
      }

      const selectedStudent = students.find(s => s.id === parseInt(formData.studentId));
      
      toast({
        title: "Payment Recorded",
        description: `Payment of ₹${amount} collected from ${selectedStudent?.name}. Receipt: ${receiptNumber}`,
      });
      
      // Reset form
      setFormData({
        studentId: '',
        studentName: '',
        studentFeeId: '',
        amount: '',
        paymentMode: 'cash',
        transactionId: '',
        chequeNumber: '',
        bankName: '',
        paymentDate: new Date(),
        remarks: ''
      });
      
      setOpen(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill student name when student is selected
    if (field === 'studentId') {
      const selectedStudent = students.find(s => s.id === parseInt(value));
      if (selectedStudent) {
        setFormData(prev => ({ ...prev, studentName: selectedStudent.name }));
      }
    }
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
          <div className="space-y-2">
            <Label htmlFor="studentId">Select Student *</Label>
            <Select value={formData.studentId} onValueChange={(value) => handleChange('studentId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.student_id} - {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.studentId && studentFees.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="studentFeeId">Fee Record *</Label>
              <Select value={formData.studentFeeId} onValueChange={(value) => handleChange('studentFeeId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee record" />
                </SelectTrigger>
                <SelectContent>
                  {studentFees.map((fee) => (
                    <SelectItem key={fee.id} value={fee.id}>
                      Balance: ₹{fee.balance_amount.toLocaleString('en-IN')} (Total: ₹{fee.total_amount.toLocaleString('en-IN')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.studentId && studentFees.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                No pending fee records found for this student.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
            {formData.studentFeeId && (
              <p className="text-sm text-muted-foreground">
                Maximum: ₹{studentFees.find(f => f.id === formData.studentFeeId)?.balance_amount.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMode">Payment Method *</Label>
            <Select value={formData.paymentMode} onValueChange={(value) => handleChange('paymentMode', value)}>
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
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.paymentDate ? format(formData.paymentDate, "PPP") : "Pick payment date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  className="p-3 pointer-events-auto"
                  mode="single"
                  selected={formData.paymentDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, paymentDate: date || new Date() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {formData.paymentMode === 'bank_transfer' || formData.paymentMode === 'online' ? (
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID *</Label>
              <Input
                id="transactionId"
                placeholder="Enter transaction ID"
                value={formData.transactionId}
                onChange={(e) => handleChange('transactionId', e.target.value)}
              />
            </div>
          ) : null}

          {formData.paymentMode === 'cheque' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chequeNumber">Cheque Number *</Label>
                <Input
                  id="chequeNumber"
                  placeholder="Enter cheque number"
                  value={formData.chequeNumber}
                  onChange={(e) => handleChange('chequeNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter bank name"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter any additional remarks"
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.studentFeeId}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
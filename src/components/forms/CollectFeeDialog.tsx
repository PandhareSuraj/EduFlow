import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { CalendarIcon, DollarSign, CreditCard, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PaymentReceipt } from "./PaymentReceipt";

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
  mobile_number: string;
  courses: {
    name: string;
    code: string;
  } | null;
}

interface StudentFee {
  id: string;
  balance_amount: number;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
  original_amount?: number;
  discount_amount?: number;
  discount_percentage?: number;
  discount_reason?: string;
}

interface PaymentReceiptData {
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
  };
}

export function CollectFeeDialog({ trigger, studentId, onSuccess }: CollectFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptData | null>(null);
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
        .select(`
          id, 
          student_id, 
          name, 
          email, 
          mobile_number,
          courses!students_course_id_fkey (
            name,
            code
          )
        `)
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        });
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
        .select(`
          id, 
          balance_amount, 
          total_amount, 
          paid_amount, 
          due_date, 
          status,
          original_amount,
          discount_amount,
          discount_percentage,
          discount_reason
        `)
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
      // Get user's college_id using RPC function
      const { data: collegeId, error: collegeError } = await supabase
        .rpc('get_user_college');

      if (collegeError || !collegeId) {
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
      const { data: paymentData, error } = await supabase
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
          college_id: collegeId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error recording payment:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to record payment",
          variant: "destructive",
        });
        return;
      }

      // Get student data separately
      const selectedStudent = students.find(s => s.id === parseInt(formData.studentId));
      
      // Get college information for receipt
      const { data: collegeData } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single();

      // Generate receipt data
      if (selectedStudent && paymentData) {
        const receiptData: PaymentReceiptData = {
          id: paymentData.id,
          receipt_number: paymentData.receipt_number,
          amount: paymentData.amount,
          payment_date: paymentData.payment_date,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id,
          cheque_number: paymentData.cheque_number,
          bank_name: paymentData.bank_name,
          remarks: paymentData.remarks,
          student: {
            name: selectedStudent.name,
            student_id: selectedStudent.student_id,
            email: selectedStudent.email,
            mobile_number: selectedStudent.mobile_number,
            course: {
              name: selectedStudent.courses?.name || 'N/A',
              code: selectedStudent.courses?.code || 'N/A'
            }
          },
          college: {
            name: collegeData?.name || 'College',
            code: collegeData?.code || '',
            address: collegeData?.address || '',
            phone: collegeData?.phone || '',
            email: collegeData?.email || ''
          }
        };

        setPaymentReceipt(receiptData);
        setShowReceipt(true);
      }

      
      toast({
        title: "Payment Recorded",
        description: `Payment of ₹${amount.toLocaleString('en-IN')} collected successfully. Receipt: ${receiptNumber}`,
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
            <CreditCard className="mr-2 h-4 w-4" />
            Collect Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Collect Fee Payment
          </DialogTitle>
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
                      <div>
                        <div>Balance: ₹{fee.balance_amount.toLocaleString('en-IN')} | Total: ₹{fee.total_amount.toLocaleString('en-IN')}</div>
                        {fee.discount_amount > 0 && (
                          <div className="text-xs text-muted-foreground">
                            (Original: ₹{fee.original_amount?.toLocaleString('en-IN')} - Discount: ₹{fee.discount_amount.toLocaleString('en-IN')})
                          </div>
                        )}
                      </div>
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
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      {/* Payment Receipt Dialog */}
      {showReceipt && paymentReceipt && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <PaymentReceipt 
              receipt={paymentReceipt} 
              onClose={() => setShowReceipt(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, FileText, DollarSign, Trash2, Download, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollege } from "@/contexts/CollegeContext";
import { format } from "date-fns";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidationHelpers } from "@/lib/validationSchemas";

interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  course_id?: number;
  admission_date: string;
  year?: number;
  semester?: number;
  status: string;
  class?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface FeeStructure {
  id: string;
  total_fee: number;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  registration_fee: number;
  other_fees: number;
  due_date: string | null;
}

interface StudentFee {
  id: string;
  original_amount: number;
  discount_amount: number;
  discount_percentage: number;
  discount_reason: string | null;
  total_amount: number;
  balance_amount: number;
  paid_amount: number;
  due_date: string | null;
}

interface StudentDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface EditStudentDialogProps {
  student: Student;
  courses: Course[];
  onUpdate?: () => void;
  trigger?: React.ReactNode;
}

export function EditStudentDialog({ student, courses, onUpdate, trigger }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { college } = useCollege();
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [studentFee, setStudentFee] = useState<StudentFee | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    mobile_number: student.mobile_number,
    course_id: student.course_id?.toString() || "none",
    admission_date: student.admission_date,
    year: student.year?.toString() || "none",
    semester: student.semester?.toString() || "none",
    status: student.status,
    class: student.class || ""
  });

  const [feeData, setFeeData] = useState({
    discount_type: 'amount' as 'amount' | 'percentage',
    discount_amount: 0,
    discount_percentage: 0,
    discount_reason: ''
  });

  const { toast } = useToast();

  // Fetch fee structure when course/semester changes
  useEffect(() => {
    if (open && formData.course_id && formData.course_id !== "none" && formData.semester && formData.semester !== "none") {
      fetchFeeStructure();
      fetchStudentFee();
    }
  }, [open, formData.course_id, formData.semester]);

  // Fetch documents when dialog opens
  useEffect(() => {
    if (open) {
      fetchDocuments();
    }
  }, [open]);

  const fetchFeeStructure = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('course_id', parseInt(formData.course_id))
        .eq('semester', parseInt(formData.semester))
        .eq('college_id', college?.id)
        .maybeSingle();

      if (error) throw error;
      setFeeStructure(data);
    } catch (error) {
      console.error('Error fetching fee structure:', error);
    }
  };

  const fetchStudentFee = async () => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('*')
        .eq('student_id', student.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setStudentFee(data);
        setFeeData({
          discount_type: data.discount_percentage > 0 ? 'percentage' : 'amount',
          discount_amount: data.discount_amount || 0,
          discount_percentage: data.discount_percentage || 0,
          discount_reason: data.discount_reason || ''
        });
      }
    } catch (error) {
      console.error('Error fetching student fee:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', student.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        course_id: formData.course_id && formData.course_id !== "none" ? parseInt(formData.course_id) : null,
        admission_date: formData.admission_date,
        year: formData.year && formData.year !== "none" ? parseInt(formData.year) : null,
        semester: formData.semester && formData.semester !== "none" ? parseInt(formData.semester) : null,
        status: formData.status,
        class: formData.class || null
      };

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', student.id);

      if (error) throw error;

      // Update fee if discount changed
      if (studentFee && (feeData.discount_amount > 0 || feeData.discount_percentage > 0)) {
        const originalAmount = feeStructure?.total_fee || studentFee.original_amount;
        let finalAmount = originalAmount;
        
        if (feeData.discount_type === 'percentage') {
          finalAmount = originalAmount - (originalAmount * feeData.discount_percentage / 100);
        } else {
          finalAmount = originalAmount - feeData.discount_amount;
        }
        
        finalAmount = Math.max(finalAmount, 0);

        const { error: feeError } = await supabase
          .from('student_fees')
          .update({
            discount_amount: feeData.discount_type === 'amount' ? feeData.discount_amount : 0,
            discount_percentage: feeData.discount_type === 'percentage' ? feeData.discount_percentage : 0,
            discount_reason: feeData.discount_reason || null,
            total_amount: finalAmount,
            balance_amount: finalAmount - studentFee.paid_amount
          })
          .eq('id', studentFee.id);

        if (feeError) throw feeError;
      }

      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      
      setOpen(false);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${student.id}_${docType}_${Date.now()}.${fileExt}`;
      const filePath = `${college?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('student_documents')
        .insert({
          student_id: student.id,
          document_type: docType,
          file_name: file.name,
          file_url: publicUrl,
          college_id: college?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string, fileUrl: string) => {
    try {
      const filePath = fileUrl.split('/student-documents/')[1];
      
      if (filePath) {
        await supabase.storage
          .from('student-documents')
          .remove([filePath]);
      }

      const { error } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      fetchDocuments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  const calculateFinalFee = () => {
    if (!feeStructure) return 0;
    
    let finalAmount = feeStructure.total_fee;
    
    if (feeData.discount_type === 'percentage') {
      finalAmount = finalAmount - (finalAmount * feeData.discount_percentage / 100);
    } else {
      finalAmount = finalAmount - feeData.discount_amount;
    }
    
    return Math.max(finalAmount, 0);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Student - {student.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Student Details</TabsTrigger>
            <TabsTrigger value="fees">Fee Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <ValidatedInput
                  id="email"
                  label="Email"
                  type="email"
                  validationType="email"
                  value={formData.email}
                  onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  required
                  placeholder="Enter email address"
                  realTimeValidation
                  showValidationIcon
                />

                <ValidatedInput
                  id="mobile"
                  label="Mobile Number"
                  validationType="phone"
                  value={formData.mobile_number}
                  onChange={(value) => setFormData(prev => ({ ...prev, mobile_number: ValidationHelpers.cleanPhone(value) }))}
                  required
                  mask="phone"
                  formatValue
                  placeholder="Enter 10-digit phone number"
                  realTimeValidation
                  showValidationIcon
                />

                <div>
                  <Label htmlFor="admission_date">Admission Date</Label>
                  <Input
                    id="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, admission_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select 
                    value={formData.course_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Course</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Academic Year</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Year</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="semester">Current Semester</Label>
                  <Select 
                    value={formData.semester} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Semester</SelectItem>
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                    placeholder="e.g., A, B, Morning, Evening"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4 mt-4">
              {feeStructure ? (
                <>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fee Structure
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Tuition Fee:</div>
                      <div className="font-medium">₹{feeStructure.tuition_fee}</div>
                      <div>Lab Fee:</div>
                      <div className="font-medium">₹{feeStructure.lab_fee}</div>
                      <div>Library Fee:</div>
                      <div className="font-medium">₹{feeStructure.library_fee}</div>
                      <div>Registration Fee:</div>
                      <div className="font-medium">₹{feeStructure.registration_fee}</div>
                      <div>Other Fees:</div>
                      <div className="font-medium">₹{feeStructure.other_fees}</div>
                      <div className="font-bold">Total Fee:</div>
                      <div className="font-bold">₹{feeStructure.total_fee}</div>
                    </div>
                  </div>

                  {studentFee && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <h3 className="font-semibold">Current Fee Status</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Paid Amount:</div>
                        <div className="font-medium text-green-600">₹{studentFee.paid_amount}</div>
                        <div>Balance Amount:</div>
                        <div className="font-medium text-red-600">₹{studentFee.balance_amount}</div>
                        {studentFee.due_date && (
                          <>
                            <div>Due Date:</div>
                            <div>{format(new Date(studentFee.due_date), 'dd MMM yyyy')}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold">Discount Information</h3>
                    
                    <div>
                      <Label>Discount Type</Label>
                      <Select
                        value={feeData.discount_type}
                        onValueChange={(value: 'amount' | 'percentage') => 
                          setFeeData(prev => ({ ...prev, discount_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {feeData.discount_type === 'amount' ? (
                      <div>
                        <Label htmlFor="discount_amount">Discount Amount (₹)</Label>
                        <Input
                          id="discount_amount"
                          type="number"
                          min="0"
                          max={feeStructure.total_fee}
                          value={feeData.discount_amount}
                          onChange={(e) => setFeeData(prev => ({ 
                            ...prev, 
                            discount_amount: parseFloat(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="discount_percentage">Discount Percentage (%)</Label>
                        <Input
                          id="discount_percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={feeData.discount_percentage}
                          onChange={(e) => setFeeData(prev => ({ 
                            ...prev, 
                            discount_percentage: parseFloat(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="discount_reason">Discount Reason</Label>
                      <Input
                        id="discount_reason"
                        value={feeData.discount_reason}
                        onChange={(e) => setFeeData(prev => ({ 
                          ...prev, 
                          discount_reason: e.target.value 
                        }))}
                        placeholder="e.g., Merit scholarship, Financial assistance"
                      />
                    </div>

                    <div className="bg-primary/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Final Fee Amount:</span>
                        <span className="text-xl font-bold">₹{calculateFinalFee()}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No fee structure found for selected course and semester</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="upload-doc">Upload New Document</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photo">Photo</SelectItem>
                          <SelectItem value="id_proof">ID Proof</SelectItem>
                          <SelectItem value="address_proof">Address Proof</SelectItem>
                          <SelectItem value="marksheet">Marksheet</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      id="upload-doc"
                      type="file"
                      className="flex-1"
                      onChange={(e) => {
                        const select = document.querySelector('[role="combobox"]') as HTMLElement;
                        const docType = select?.getAttribute('data-value') || 'other';
                        handleFileUpload(e, docType);
                      }}
                      disabled={uploadingDoc}
                    />
                    <Button type="button" disabled={uploadingDoc}>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Uploaded Documents ({documents.length})
                  </h3>
                  
                  {documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{doc.file_name}</div>
                              <div className="text-sm text-muted-foreground">
                                <Badge variant="outline">{doc.document_type}</Badge>
                                <span className="ml-2">
                                  {format(new Date(doc.uploaded_at), 'dd MMM yyyy')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

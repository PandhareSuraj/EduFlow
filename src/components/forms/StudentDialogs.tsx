import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, User, IndianRupee, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCollege } from "@/contexts/CollegeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidatedInput } from "@/components/ui/validated-input";
import { ValidatedForm, ValidatedFormField } from "@/components/ui/validated-form";
import { FormSchemas, ValidationHelpers } from "@/lib/validationSchemas";
import { uploadDocument as uploadToStorage } from "@/utils/documentUpload";

// Export the individual dialog components
export { ViewStudentDialog } from "./ViewStudentDialog";
export { EditStudentDialog } from "./EditStudentDialog";
export { DeleteStudentDialog } from "./DeleteStudentDialog";
interface Course {
  id: number;
  name: string;
  code: string;
}
interface FeeStructure {
  id: string;
  total_fee: number;
  registration_fee: number;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  other_fees: number;
  due_date: string;
  semester: number;
}
interface AddStudentDialogProps {
  onStudentAdded?: () => void;
}
interface Course {
  id: number;
  name: string;
  code: string;
}
interface FeeStructure {
  id: string;
  total_fee: number;
  registration_fee: number;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  other_fees: number;
  due_date: string;
  semester: number;
}
interface AddStudentDialogProps {
  onStudentAdded?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function AddStudentDialog({
  onStudentAdded,
  open: controlledOpen,
  onOpenChange
}: AddStudentDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    course_id: "",
    class: "",
    semester: 1,
    year: 1,
    admission_date: new Date().toISOString().split('T')[0]
  });
  const [feeData, setFeeData] = useState({
    discount_type: 'amount',
    discount_amount: 0,
    discount_percentage: 0,
    discount_reason: ''
  });
  const [documents, setDocuments] = useState<{
    [key: string]: File;
  }>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingFeeStructure, setLoadingFeeStructure] = useState(false);
  const fileInputRefs = useRef<{
    [key: string]: HTMLInputElement | null;
  }>({});
  const {
    toast
  } = useToast();
  const {
    college
  } = useCollege();

  // Calculate final fee amount
  const calculateFinalFee = () => {
    if (!feeStructure) return 0;
    let finalAmount = feeStructure.total_fee;
    if (feeData.discount_type === 'percentage' && feeData.discount_percentage > 0) {
      finalAmount = feeStructure.total_fee - feeStructure.total_fee * feeData.discount_percentage / 100;
    } else if (feeData.discount_type === 'amount' && feeData.discount_amount > 0) {
      finalAmount = feeStructure.total_fee - feeData.discount_amount;
    }
    return Math.max(finalAmount, 0);
  };

  // Load courses from Supabase
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('courses').select('id, name, code').eq('status', 'active').eq('college_id', college?.id).order('name');
        if (error) {
          console.error('Error loading courses:', error);
          toast({
            title: "Error",
            description: "Failed to load courses",
            variant: "destructive"
          });
        } else {
          setCourses(data || []);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, [toast]);

  // Load fee structure when course or semester changes
  useEffect(() => {
    if (formData.course_id && formData.semester) {
      loadFeeStructure(parseInt(formData.course_id), formData.semester);
    }
  }, [formData.course_id, formData.semester]);
  const loadFeeStructure = async (courseId: number, semester: number) => {
    setLoadingFeeStructure(true);
    try {
      const {
        data,
        error
      } = await supabase.from('fee_structures').select('*').eq('course_id', courseId).eq('semester', semester).eq('college_id', college?.id).order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      if (error) {
        console.error('Error loading fee structure:', error);
      } else {
        setFeeStructure(data);
      }
    } catch (error) {
      console.error('Error loading fee structure:', error);
    } finally {
      setLoadingFeeStructure(false);
    }
  };
  const handleFileUpload = (documentType: string, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };
  const uploadDocument = async (studentId: number, documentType: string, file: File, collegeId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}_${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${studentId}/${fileName}`;
    const {
      error: uploadError
    } = await supabase.storage.from('student-documents').upload(filePath, file);
    if (uploadError) {
      throw uploadError;
    }
    const {
      data: {
        publicUrl
      }
    } = supabase.storage.from('student-documents').getPublicUrl(filePath);
    const {
      error: dbError
    } = await supabase.from('student_documents').insert({
      student_id: studentId,
      document_type: documentType,
      file_name: fileName,
      file_url: publicUrl,
      file_size: file.size,
      college_id: collegeId
    });
    if (dbError) {
      throw dbError;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Student name is required",
        variant: "destructive"
      });
      return;
    }
    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    if (!formData.mobile_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Mobile number is required",
        variant: "destructive"
      });
      return;
    }

    // Phone number validation (10-12 digits)
    const cleanedPhone = formData.mobile_number.replace(/\D/g, '');
    if (cleanedPhone.length < 10 || cleanedPhone.length > 12) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid mobile number (10-12 digits)",
        variant: "destructive"
      });
      return;
    }
    if (!formData.course_id) {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {

      // Check if email already exists
      const {
        data: existingStudent
      } = await supabase.from('students').select('id').eq('email', formData.email.trim().toLowerCase()).maybeSingle();
      if (existingStudent) {
        toast({
          title: "Error",
          description: "A student with this email already exists",
          variant: "destructive"
        });
        return;
      }

      // Insert student data
      const {
        data: studentData,
        error: studentError
      } = await supabase.from('students').insert([{
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_number: formData.mobile_number.replace(/\D/g, ''),
        course_id: parseInt(formData.course_id),
        year: formData.year || 1,
        semester: formData.semester || 1,
        college_id: college?.id,
        status: 'active'
      }]).select().single();
      if (studentError) {
        console.error('Error inserting student:', studentError);
        toast({
          title: "Error",
          description: studentError.message || "Failed to add student. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Upload documents if any
      if (Object.keys(documents).length > 0 && studentData) {
        const uploadedDocs = await Promise.all(
          Object.entries(documents).map(([docType, file]) => 
            uploadToStorage(file, docType, {
              student_id: studentData.student_id,
              college_id: college?.id
            })
          )
        );

        // Save document records to database
        for (const doc of uploadedDocs) {
          await supabase.from('student_documents').insert({
            student_id: studentData.id,
            document_type: doc.file_type,
            file_name: doc.file_name,
            file_url: doc.file_path,
            file_size: doc.file_size,
            college_id: college?.id
          });
        }
      }

      // Always ensure fee record creation if fee structure exists
      if (feeStructure && studentData) {
        // Wait a moment for trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        const {
          data: existingFees,
          error: checkError
        } = await supabase.from('student_fees').select('id, total_amount').eq('student_id', studentData.id);
        if (checkError) {
          console.error('Error checking existing fees:', checkError);
        } else if (existingFees && existingFees.length > 0 && (feeData.discount_amount > 0 || feeData.discount_percentage > 0)) {
          // Update existing fee with discount
          const feeId = existingFees[0].id;
          const originalAmount = feeStructure.total_fee;
          let finalAmount = originalAmount;
          if (feeData.discount_type === 'percentage') {
            finalAmount = originalAmount - originalAmount * feeData.discount_percentage / 100;
          } else {
            finalAmount = originalAmount - feeData.discount_amount;
          }
          finalAmount = Math.max(finalAmount, 0);
          const {
            error: updateError
          } = await supabase.from('student_fees').update({
            original_amount: originalAmount,
            discount_amount: feeData.discount_type === 'amount' ? feeData.discount_amount : 0,
            discount_percentage: feeData.discount_type === 'percentage' ? feeData.discount_percentage : 0,
            discount_reason: feeData.discount_reason || null,
            total_amount: finalAmount,
            balance_amount: finalAmount
          }).eq('id', feeId);
          if (updateError) {
            console.error('Error updating fee with discount:', updateError);
          }
        } else if (!existingFees || existingFees.length === 0) {
          // No existing fee found by trigger, create one using RPC
          const discountAmount = feeData.discount_type === 'amount' ? feeData.discount_amount : 0;
          const discountPercentage = feeData.discount_type === 'percentage' ? feeData.discount_percentage : 0;
          const {
            error: feeError
          } = await supabase.rpc('auto_create_student_fees_with_discount', {
            p_student_id: studentData.id,
            p_discount_amount: discountAmount,
            p_discount_percentage: discountPercentage,
            p_discount_reason: feeData.discount_reason || null
          });
          if (feeError) {
            console.error('Error creating fee record:', feeError);
          }
        }
      }
      toast({
        title: "Success",
        description: `Student ${formData.name} added successfully with ID: ${studentData.student_id}! ${feeStructure ? 'Fee record created.' : 'No fee structure found for selected course/semester.'}`
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        course_id: "",
        class: "",
        semester: 1,
        year: 1,
        admission_date: new Date().toISOString().split('T')[0]
      });
      setFeeData({
        discount_type: 'amount',
        discount_amount: 0,
        discount_percentage: 0,
        discount_reason: ''
      });
      setDocuments({});
      setFeeStructure(null);
      setOpen(false);

      // Call the callback to refresh parent component
      onStudentAdded?.();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Register a new student with their personal details and documents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Student Details</TabsTrigger>
              <TabsTrigger value="fees">Fee Information</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} required />
                </div>
                <ValidatedInput
                  id="email"
                  label="Email"
                  type="email"
                  validationType="email"
                  value={formData.email}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                  required
                  placeholder="Enter email address"
                  realTimeValidation
                  showValidationIcon
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  id="mobile"
                  label="Mobile Number"
                  validationType="phone"
                  value={formData.mobile_number}
                  onChange={(value) => setFormData({ ...formData, mobile_number: ValidationHelpers.cleanPhone(value) })}
                  required
                  mask="phone"
                  formatValue
                  placeholder="Enter 10-digit phone number"
                  realTimeValidation
                  showValidationIcon
                />
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select value={formData.course_id} onValueChange={value => setFormData({
                  ...formData,
                  course_id: value
                })} disabled={loadingCourses}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCourses ? "Loading courses..." : "Select course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.code})
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input id="class" value={formData.class} onChange={e => setFormData({
                  ...formData,
                  class: e.target.value
                })} placeholder="e.g., A, B" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select value={formData.semester.toString()} onValueChange={value => setFormData({
                  ...formData,
                  semester: parseInt(value)
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Select value={formData.year.toString()} onValueChange={value => setFormData({
                  ...formData,
                  year: parseInt(value)
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(yr => <SelectItem key={yr} value={yr.toString()}>
                          Year {yr}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admission_date">Admission Date *</Label>
                  <Input id="admission_date" type="date" value={formData.admission_date} onChange={e => setFormData({
                  ...formData,
                  admission_date: e.target.value
                })} required />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              {feeStructure ? <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5" />
                      Fee Structure (Semester {feeStructure.semester})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>Registration Fee: ₹{feeStructure.registration_fee?.toLocaleString('en-IN') || 0}</div>
                      <div>Tuition Fee: ₹{feeStructure.tuition_fee?.toLocaleString('en-IN') || 0}</div>
                      <div>Lab Fee: ₹{feeStructure.lab_fee?.toLocaleString('en-IN') || 0}</div>
                      <div>Library Fee: ₹{feeStructure.library_fee?.toLocaleString('en-IN') || 0}</div>
                      <div>Other Fees: ₹{feeStructure.other_fees?.toLocaleString('en-IN') || 0}</div>
                      <div className="font-semibold">Total Fee: ₹{feeStructure.total_fee?.toLocaleString('en-IN') || 0}</div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <Label className="text-base font-semibold">Discount</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                          <Label>Discount Type</Label>
                          <Select value={feeData.discount_type} onValueChange={value => setFeeData({
                        ...feeData,
                        discount_type: value
                      })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="amount">Fixed Amount</SelectItem>
                              <SelectItem value="percentage">Percentage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {feeData.discount_type === 'amount' ? <div className="space-y-2">
                            <Label>Discount Amount (₹)</Label>
                            <Input type="number" min="0" max={feeStructure.total_fee} value={feeData.discount_amount} onChange={e => setFeeData({
                        ...feeData,
                        discount_amount: parseFloat(e.target.value) || 0
                      })} placeholder="Enter discount amount" />
                          </div> : <div className="space-y-2">
                            <Label>Discount Percentage (%)</Label>
                            <Input type="number" min="0" max="100" value={feeData.discount_percentage} onChange={e => setFeeData({
                        ...feeData,
                        discount_percentage: parseFloat(e.target.value) || 0
                      })} placeholder="Enter discount percentage" />
                          </div>}
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label>Discount Reason</Label>
                        <Input value={feeData.discount_reason} onChange={e => setFeeData({
                      ...feeData,
                      discount_reason: e.target.value
                    })} placeholder="Reason for discount (optional)" />
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Final Fee Amount:
                        </span>
                        <span className="text-primary">₹{calculateFinalFee().toLocaleString('en-IN')}</span>
                      </div>
                      {(feeData.discount_amount > 0 || feeData.discount_percentage > 0) && <div className="text-sm text-muted-foreground mt-1">
                          You saved: ₹{(feeStructure.total_fee - calculateFinalFee()).toLocaleString('en-IN')}
                        </div>}
                    </div>
                  </CardContent>
                </Card> : <Card>
                  <CardContent className="pt-6">
                    {loadingFeeStructure ? <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading fee structure...</p>
                      </div> : formData.course_id ? <div className="text-center py-4 text-muted-foreground">
                        <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No fee structure found for the selected course and semester.</p>
                        <p className="text-sm">Student will be registered without automatic fee creation.</p>
                      </div> : <div className="text-center py-4 text-muted-foreground">
                        <IndianRupee className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Please select a course to view fee information.</p>
                      </div>}
                  </CardContent>
                </Card>}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid gap-4">
                {[{
                type: 'photo',
                label: 'Student Photo',
                icon: User
              }, {
                type: 'aadhar',
                label: 'Aadhar Card',
                icon: FileText
              }, {
                type: 'marksheet',
                label: 'Marksheet',
                icon: FileText
              }, {
                type: 'other',
                label: 'Other Documents',
                icon: FileText
              }].map(({
                type,
                label,
                icon: Icon
              }) => <div key={type} className="space-y-2">
                    <Label htmlFor={type}>{label}</Label>
                    <div className="flex items-center gap-2">
                      <Input ref={el => fileInputRefs.current[type] = el} type="file" accept={type === 'photo' ? 'image/*' : '*/*'} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(type, file);
                    }
                  }} className="hidden" />
                      <Button type="button" variant="outline" onClick={() => fileInputRefs.current[type]?.click()} className="flex-1">
                        <Icon className="h-4 w-4 mr-2" />
                        {documents[type] ? documents[type].name : `Choose ${label}`}
                      </Button>
                      {documents[type] && <Badge variant="secondary">
                          {(documents[type].size / 1024).toFixed(1)} KB
                        </Badge>}
                    </div>
                  </div>)}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}
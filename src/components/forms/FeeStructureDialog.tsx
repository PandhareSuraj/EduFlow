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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeeStructureDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  editData?: {
    id: string;
    course_id: number;
    semester: number;
    registration_fee: number;
    tuition_fee: number;
    lab_fee: number;
    library_fee: number;
    other_fees: number;
    due_date: string | null;
  };
  isEdit?: boolean;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface FeeStructureForm {
  course_id: string;
  semester: string;
  registration_fee: string;
  tuition_fee: string;
  lab_fee: string;
  library_fee: string;
  other_fees: string;
  due_date: Date | undefined;
}

export function FeeStructureDialog({ trigger, onSuccess, editData, isEdit = false }: FeeStructureDialogProps) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FeeStructureForm>({
    course_id: editData?.course_id.toString() || '',
    semester: editData?.semester.toString() || '',
    registration_fee: editData?.registration_fee.toString() || '',
    tuition_fee: editData?.tuition_fee.toString() || '',
    lab_fee: editData?.lab_fee.toString() || '',
    library_fee: editData?.library_fee.toString() || '',
    other_fees: editData?.other_fees.toString() || '',
    due_date: editData?.due_date ? new Date(editData.due_date) : undefined,
  });

  // Auto-calculate total fee based on component fees
  const calculateTotalFee = () => {
    const registrationFee = parseFloat(formData.registration_fee) || 0;
    const tuitionFee = parseFloat(formData.tuition_fee) || 0;
    const labFee = parseFloat(formData.lab_fee) || 0;
    const libraryFee = parseFloat(formData.library_fee) || 0;
    const otherFees = parseFloat(formData.other_fees) || 0;
    return registrationFee + tuitionFee + labFee + libraryFee + otherFees;
  };

  const totalFee = calculateTotalFee();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.course_id) {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    if (!formData.semester) {
      toast({
        title: "Validation Error",
        description: "Please select a semester",
        variant: "destructive",
      });
      return;
    }

    const calculatedTotalFee = calculateTotalFee();
    if (calculatedTotalFee <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid fee amounts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's college using RPC function
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

      if (isEdit && editData) {
        // Update existing fee structure
        const { error } = await supabase
          .from('fee_structures')
          .update({
            total_fee: calculatedTotalFee,
            registration_fee: parseFloat(formData.registration_fee) || 0,
            tuition_fee: parseFloat(formData.tuition_fee) || 0,
            lab_fee: parseFloat(formData.lab_fee) || 0,
            library_fee: parseFloat(formData.library_fee) || 0,
            other_fees: parseFloat(formData.other_fees) || 0,
            due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
          })
          .eq('id', editData.id);

        if (error) throw error;
      } else {
        // Check if fee structure already exists
        const { data: existingStructure } = await supabase
          .from('fee_structures')
          .select('id')
          .eq('course_id', parseInt(formData.course_id))
          .eq('semester', parseInt(formData.semester))
          .eq('college_id', collegeId)
          .maybeSingle();

        if (existingStructure) {
          toast({
            title: "Error",
            description: "Fee structure already exists for this course and semester",
            variant: "destructive",
          });
          return;
        }

        // Insert new fee structure
        const { error } = await supabase
          .from('fee_structures')
          .insert([{
            course_id: parseInt(formData.course_id),
            semester: parseInt(formData.semester),
            total_fee: calculatedTotalFee,
            registration_fee: parseFloat(formData.registration_fee) || 0,
            tuition_fee: parseFloat(formData.tuition_fee) || 0,
            lab_fee: parseFloat(formData.lab_fee) || 0,
            library_fee: parseFloat(formData.library_fee) || 0,
            other_fees: parseFloat(formData.other_fees) || 0,
            due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
            college_id: collegeId,
          }]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: isEdit ? "Fee structure updated successfully!" : "Fee structure created successfully!",
      });

      // Reset form if not editing
      if (!isEdit) {
        setFormData({
          course_id: '',
          semester: '',
          registration_fee: '',
          tuition_fee: '',
          lab_fee: '',
          library_fee: '',
          other_fees: '',
          due_date: undefined,
        });
      }
      
      setOpen(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error creating fee structure:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FeeStructureForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {isEdit ? "Edit Fee Structure" : "Create Fee Structure"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Fee Structure" : "Create Fee Structure"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update fee structure for the course and semester" : "Set up fee structure for a course and semester"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Select value={formData.course_id} onValueChange={(value) => handleChange('course_id', value)} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select value={formData.semester} onValueChange={(value) => handleChange('semester', value)} disabled={isEdit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_fee">Total Fee Amount (Auto-calculated)</Label>
            <Input
              id="total_fee"
              type="text"
              value={`₹${totalFee.toLocaleString()}`}
              disabled
              className="bg-muted font-medium"
            />
            <p className="text-xs text-muted-foreground">
              This amount is automatically calculated from the fee components below
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_fee">Registration Fee</Label>
              <Input
                id="registration_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.registration_fee}
                onChange={(e) => handleChange('registration_fee', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tuition_fee">Tuition Fee</Label>
              <Input
                id="tuition_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.tuition_fee}
                onChange={(e) => handleChange('tuition_fee', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lab_fee">Lab Fee</Label>
              <Input
                id="lab_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.lab_fee}
                onChange={(e) => handleChange('lab_fee', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="library_fee">Library Fee</Label>
              <Input
                id="library_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.library_fee}
                onChange={(e) => handleChange('library_fee', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="other_fees">Other Fees</Label>
            <Input
              id="other_fees"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.other_fees}
              onChange={(e) => handleChange('other_fees', e.target.value)}
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
                  className="p-3 pointer-events-auto"
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Fee Structure" : "Create Fee Structure")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
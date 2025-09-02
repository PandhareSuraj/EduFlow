import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit } from "lucide-react";

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

interface EditStudentDialogProps {
  student: Student;
  courses: Course[];
  onUpdate?: () => void;
  trigger?: React.ReactNode;
}

export function EditStudentDialog({ student, courses, onUpdate, trigger }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    mobile_number: student.mobile_number,
    course_id: student.course_id?.toString() || "none",
    year: student.year?.toString() || "none",
    semester: student.semester?.toString() || "none",
    status: student.status,
    class: student.class || ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        course_id: formData.course_id && formData.course_id !== "none" ? parseInt(formData.course_id) : null,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Student - {student.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                value={formData.mobile_number}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                required
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
              {loading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Eye, Edit } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  name: string;
  code: string;
  duration_months: number;
  fees_per_semester: number | null;
  students?: { count: number }[];
  status: string;
  description: string | null;
}

interface ViewCourseDialogProps {
  course: Course;
  trigger?: React.ReactNode;
}

export function ViewCourseDialog({ course, trigger }: ViewCourseDialogProps) {
  const [open, setOpen] = useState(false);

  const formatDuration = (months: number) => {
    if (months < 12) return `${months} Months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return `${years} Year${years > 1 ? 's' : ''}`;
    return `${years} Year${years > 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths > 1 ? 's' : ''}`;
  };

  const formatFees = (fees: number | null) => {
    if (!fees) return "Not set";
    return `₹${fees.toLocaleString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Course Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{course.name}</h3>
              <p className="text-muted-foreground">Course Code: {course.code}</p>
            </div>
            <Badge variant={course.status === "Active" ? "default" : "secondary"}>
              {course.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <p className="mt-1">{formatDuration(course.duration_months)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Course Fees</Label>
              <p className="mt-1">{formatFees(course.fees_per_semester)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Enrolled Students</Label>
              <p className="mt-1">{course.students?.[0]?.count || 0} students</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <p className="mt-1">{course.status}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="mt-1 text-sm">{course.description || "No description available"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditCourseDialogProps {
  course: Course;
  trigger?: React.ReactNode;
}

export function EditCourseDialog({ course, trigger }: EditCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const formatDurationForSelect = (months: number) => {
    if (months === 6) return "6 Months";
    if (months === 12) return "1 Year";
    if (months === 24) return "2 Years";
    if (months === 36) return "3 Years";
    return `${months} Months`;
  };
  
  const [formData, setFormData] = useState({
    name: course.name,
    code: course.code,
    duration: formatDurationForSelect(course.duration_months),
    fees: course.fees_per_semester?.toString() || "",
    description: course.description || "",
    status: course.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Course Updated",
      description: `${formData.name} course has been successfully updated.`,
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
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Course - {course.code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => handleChange("duration", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6 Months">6 Months</SelectItem>
                  <SelectItem value="1 Year">1 Year</SelectItem>
                  <SelectItem value="2 Years">2 Years</SelectItem>
                  <SelectItem value="3 Years">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fees">Course Fees</Label>
              <Input
                id="fees"
                value={formData.fees}
                onChange={(e) => handleChange("fees", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Course</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
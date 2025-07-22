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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  course: string;
  batch: string;
  phone: string;
  email: string;
  status: string;
  admissionDate: string;
  feesStatus: string;
}

interface ViewStudentDialogProps {
  student: Student;
  trigger?: React.ReactNode;
}

export function ViewStudentDialog({ student, trigger }: ViewStudentDialogProps) {
  const [open, setOpen] = useState(false);

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
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{student.name}</h3>
              <p className="text-muted-foreground">{student.id}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                  {student.status}
                </Badge>
                <Badge variant={student.feesStatus === "Paid" ? "default" : "destructive"}>
                  {student.feesStatus}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Course</Label>
              <p className="mt-1">{student.course}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Batch</Label>
              <p className="mt-1">{student.batch}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="mt-1">{student.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <p className="mt-1">{student.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Admission Date</Label>
              <p className="mt-1">{student.admissionDate}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditStudentDialogProps {
  student: Student;
  trigger?: React.ReactNode;
}

export function EditStudentDialog({ student, trigger }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone,
    course: student.course,
    batch: student.batch,
    status: student.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Student Updated",
      description: `${formData.name}'s profile has been successfully updated.`,
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
          <DialogTitle>Edit Student - {student.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={formData.course} onValueChange={(value) => handleChange("course", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DMLT">DMLT</SelectItem>
                  <SelectItem value="Radiology Technician">Radiology Technician</SelectItem>
                  <SelectItem value="PGDMLT">PGDMLT</SelectItem>
                  <SelectItem value="Hospital Management">Hospital Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="batch">Batch</Label>
              <Select value={formData.batch} onValueChange={(value) => handleChange("batch", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-A">2024-A</SelectItem>
                  <SelectItem value="2024-B">2024-B</SelectItem>
                  <SelectItem value="2023-A">2023-A</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="Graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Student</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
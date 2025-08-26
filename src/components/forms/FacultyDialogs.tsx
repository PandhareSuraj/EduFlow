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

interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  subjects: string[];
  experience: string;
  status: string;
}

interface ViewFacultyDialogProps {
  faculty: Faculty;
  trigger?: React.ReactNode;
}

export function ViewFacultyDialog({ faculty, trigger }: ViewFacultyDialogProps) {
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
          <DialogTitle>Faculty Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {faculty.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{faculty.name}</h3>
              <p className="text-muted-foreground">{faculty.designation}</p>
              <Badge variant={faculty.status === "Active" ? "default" : "secondary"} className="mt-2">
                {faculty.status}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Department</Label>
              <p className="mt-1">{faculty.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Experience</Label>
              <p className="mt-1">{faculty.experience}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="mt-1">{faculty.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <p className="mt-1">{faculty.phone}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Subjects</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {faculty.subjects.map((subject, index) => (
                <Badge key={index} variant="outline">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditFacultyDialogProps {
  faculty: Faculty;
  trigger?: React.ReactNode;
}

export function EditFacultyDialog({ faculty, trigger }: EditFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: faculty.name,
    email: faculty.email,
    phone: faculty.phone,
    designation: faculty.designation,
    department: faculty.department,
    experience: faculty.experience,
    subjects: faculty.subjects.join(", "),
    status: faculty.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Faculty Updated",
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
          <DialogTitle>Edit Faculty Profile</DialogTitle>
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
              <Label htmlFor="designation">Designation</Label>
              <Select value={formData.designation} onValueChange={(value) => handleChange("designation", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Head of Department">Head of Department</SelectItem>
                  <SelectItem value="Professor">Professor</SelectItem>
                  <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                  <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                  <SelectItem value="Lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Laboratory Technology">Laboratory Technology</SelectItem>
                  <SelectItem value="Hospital Management">Hospital Management</SelectItem>
                  <SelectItem value="General Studies">General Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                placeholder="e.g., 5 years"
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
                  <SelectItem value="On Leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="subjects">Subjects (comma separated)</Label>
            <Input
              id="subjects"
              value={formData.subjects}
              onChange={(e) => handleChange("subjects", e.target.value)}
              placeholder="e.g., Medical Imaging, Radiography"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Faculty</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
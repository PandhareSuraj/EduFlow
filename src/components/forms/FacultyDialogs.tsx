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
import { supabase } from "@/integrations/supabase/client";
import { useDepartments } from "@/hooks/useDepartments";
import { validatePhone, validateEmail, ValidationHelpers } from "@/lib/validationSchemas";

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
  qualification?: string;
  address?: string;
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
  onSuccess?: () => void;
}

export function EditFacultyDialog({ faculty, trigger, onSuccess }: EditFacultyDialogProps) {
  const { departments, loading: departmentsLoading } = useDepartments();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: faculty.name,
    email: faculty.email,
    phone: faculty.phone,
    designation: faculty.designation,
    department: faculty.department,
    experience: faculty.experience,
    subjects: faculty.subjects.join(", "),
    status: faculty.status,
    qualification: faculty.qualification || "",
    address: faculty.address || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subjectsArray = formData.subjects ? formData.subjects.split(",").map(s => s.trim()).filter(s => s) : [];
      
      const { error } = await supabase
        .from('faculty')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          department: formData.department,
          experience: formData.experience,
          subjects: subjectsArray,
          status: formData.status,
          qualification: formData.qualification,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', faculty.id);

      if (error) throw error;

      toast({
        title: "Faculty Updated",
        description: `${formData.name}'s profile has been successfully updated.`,
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update faculty",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate phone in real-time
    if (field === "phone") {
      const cleanedPhone = value.replace(/\D/g, '');
      try {
        validatePhone.parse(cleanedPhone);
        setPhoneError("");
      } catch (error: any) {
        setPhoneError(error.errors?.[0]?.message || "Invalid phone number");
      }
    }
    
    // Validate email in real-time
    if (field === "email") {
      try {
        validateEmail.parse(value);
        setEmailError("");
      } catch (error: any) {
        setEmailError(error.errors?.[0]?.message || "Invalid email");
      }
    }
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
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-sm text-destructive mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '');
                  handleChange("phone", cleaned);
                }}
                placeholder="e.g., 9876543210"
                maxLength={10}
                className={phoneError ? "border-destructive" : ""}
              />
              {phoneError && (
                <p className="text-sm text-destructive mt-1">{phoneError}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Enter 10-digit mobile number (starts with 6-9)
              </p>
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
                  <SelectItem value="Accountant">Accountant</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
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
                  {departmentsLoading ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading departments...</div>
                  ) : departments.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No departments available</div>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))
                  )}
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
          <div>
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) => handleChange("qualification", e.target.value)}
              placeholder="e.g., M.Sc, Ph.D"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter address"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!phoneError || !!emailError || formData.phone.length !== 10}>
              {loading ? "Updating..." : "Update Faculty"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface AddStudentDialogProps {
  trigger?: React.ReactNode;
}

export function AddStudentDialog({ trigger }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    batch: "",
    address: "",
    emergencyContact: "",
    qualification: ""
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Mobile number validation function
  const validateMobileNumber = (phone: string): string | null => {
    if (!phone) return "Phone number is required";
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Accept 10-12 digit numbers
    if (cleanPhone.length < 10 || cleanPhone.length > 12) {
      return "Phone number must be 10-12 digits long";
    }
    
    // Additional format validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number";
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.batch) newErrors.batch = "Batch is required";
    
    // Validate phone number
    const phoneError = validateMobileNumber(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    // Validate emergency contact if provided
    if (formData.emergencyContact) {
      const emergencyError = validateMobileNumber(formData.emergencyContact);
      if (emergencyError) newErrors.emergencyContact = emergencyError.replace("Phone number", "Emergency contact");
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    // Here you would typically save to database
    toast({
      title: "Student Added",
      description: `${formData.name} has been successfully registered.`,
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      course: "",
      batch: "",
      address: "",
      emergencyContact: "",
      qualification: ""
    });
    setErrors({});
    setOpen(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation for phone fields
    if (field === "phone" || field === "emergencyContact") {
      const error = validateMobileNumber(value);
      if (field === "emergencyContact" && !value) {
        // Emergency contact is optional, so don't show error if empty
        setErrors(prev => ({ ...prev, [field]: "" }));
      } else if (error && value) {
        // Only show error if there's a value being typed
        const errorMessage = field === "emergencyContact" 
          ? error.replace("Phone number", "Emergency contact")
          : error;
        setErrors(prev => ({ ...prev, [field]: errorMessage }));
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Student
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                required
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="e.g., 9876543210 or +91-9876543210"
                required
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                placeholder="e.g., 9876543210 or +91-9876543210"
                className={errors.emergencyContact ? "border-destructive" : ""}
              />
              {errors.emergencyContact && <p className="text-sm text-destructive mt-1">{errors.emergencyContact}</p>}
            </div>
            <div>
              <Label htmlFor="course">Course *</Label>
              <Select value={formData.course} onValueChange={(value) => handleChange("course", value)}>
                <SelectTrigger className={errors.course ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DMLT">DMLT</SelectItem>
                  <SelectItem value="Radiology Technician">Radiology Technician</SelectItem>
                  <SelectItem value="PGDMLT">PGDMLT</SelectItem>
                  <SelectItem value="Hospital Management">Hospital Management</SelectItem>
                </SelectContent>
              </Select>
              {errors.course && <p className="text-sm text-destructive mt-1">{errors.course}</p>}
            </div>
            <div>
              <Label htmlFor="batch">Batch *</Label>
              <Select value={formData.batch} onValueChange={(value) => handleChange("batch", value)}>
                <SelectTrigger className={errors.batch ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-A">2024-A</SelectItem>
                  <SelectItem value="2024-B">2024-B</SelectItem>
                  <SelectItem value="2023-A">2023-A</SelectItem>
                </SelectContent>
              </Select>
              {errors.batch && <p className="text-sm text-destructive mt-1">{errors.batch}</p>}
            </div>
            <div>
              <Label htmlFor="qualification">Previous Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => handleChange("qualification", e.target.value)}
                placeholder="Enter previous qualification"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter complete address"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Student</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
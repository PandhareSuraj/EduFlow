import { useState } from "react";
import { Eye, Edit, Phone, Mail } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useFaculty } from "@/hooks/useFaculty";
import { useCourses } from "@/hooks/useCourses";
import { validatePhone, validateEmail, ValidationHelpers } from "@/lib/validationSchemas";

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  source: string;
  status: string;
  followUpDate: string;
  assignedTo: string;
  createdDate: string;
  notes?: string;
}

interface ViewEnquiryDialogProps {
  enquiry: Enquiry;
  trigger?: React.ReactNode;
}

export function ViewEnquiryDialog({ enquiry, trigger }: ViewEnquiryDialogProps) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-500";
      case "Contacted": return "bg-yellow-500";
      case "Interested": return "bg-green-500";
      case "Not Interested": return "bg-red-500";
      case "Converted": return "bg-green-600";
      default: return "bg-gray-500";
    }
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
          <DialogTitle>Enquiry Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{enquiry.name}</h3>
              <p className="text-muted-foreground">Enquiry ID: {enquiry.id}</p>
            </div>
            <Badge className={getStatusColor(enquiry.status)} style={{backgroundColor: getStatusColor(enquiry.status)}}>
              {enquiry.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                <p>{enquiry.phone}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                <p>{enquiry.email}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Interested Course</Label>
              <p className="mt-1">{enquiry.course}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Source</Label>
              <p className="mt-1">{enquiry.source}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Created Date</Label>
              <p className="mt-1">{enquiry.createdDate}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Follow-up Date</Label>
              <p className="mt-1">{enquiry.followUpDate}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Assigned To</Label>
              <p className="mt-1">{enquiry.assignedTo}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditEnquiryDialogProps {
  enquiry: Enquiry;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditEnquiryDialog({ enquiry, trigger, onSuccess }: EditEnquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const { toast } = useToast();
  const { faculty, loading: facultyLoading } = useFaculty();
  const { courses, loading: coursesLoading } = useCourses();
  
  const [formData, setFormData] = useState({
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    course: enquiry.course,
    source: enquiry.source,
    status: enquiry.status,
    assignedTo: enquiry.assignedTo,
    followUpDate: enquiry.followUpDate,
    notes: enquiry.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('enquiries')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          course: formData.course,
          source: formData.source,
          status: formData.status,
          assigned_to: formData.assignedTo,
          follow_up_date: formData.followUpDate || null,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiry.id);

      if (error) throw error;

      toast({
        title: "Enquiry Updated",
        description: `Enquiry for ${formData.name} has been successfully updated.`,
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update enquiry",
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
          <DialogTitle>Edit Enquiry - {enquiry.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
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
              <Label htmlFor="course">Course</Label>
              <Select value={formData.course} onValueChange={(value) => handleChange("course", value)} disabled={coursesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select course"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Not Interested">Not Interested</SelectItem>
                  <SelectItem value="Converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleChange("assignedTo", value)} disabled={facultyLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={facultyLoading ? "Loading faculty..." : "Select counselor"} />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name} - {member.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => handleChange("followUpDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!phoneError || !!emailError || formData.phone.length !== 10}>
              {loading ? "Updating..." : "Update Enquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
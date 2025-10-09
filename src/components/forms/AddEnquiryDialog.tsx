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
import { supabase } from "@/integrations/supabase/client";
import { useFaculty } from "@/hooks/useFaculty";
import { useCourses } from "@/hooks/useCourses";
import { validatePhone } from "@/lib/validationSchemas";

interface AddEnquiryDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddEnquiryDialog({ trigger, onSuccess }: AddEnquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>("");
  const { toast } = useToast();
  const { faculty, loading: facultyLoading } = useFaculty();
  const { courses, loading: coursesLoading } = useCourses();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    source: "",
    assignedTo: "",
    notes: "",
    followUpDate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user's college ID for RLS compliance
      const { data: collegeId } = await supabase.rpc('get_user_college');
      
      const { error } = await supabase
        .from('enquiries')
        .insert([{
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          course: formData.course,
          source: formData.source,
          status: 'new',
          assigned_to: formData.assignedTo || null,
          follow_up_date: formData.followUpDate || null,
          notes: formData.notes || null,
          college_id: collegeId
        }]);

      if (error) throw error;

      toast({
        title: "Enquiry Added",
        description: `New enquiry from ${formData.name} has been recorded.`,
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        course: "",
        source: "",
        assignedTo: "",
        notes: "",
        followUpDate: ""
      });
      
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add enquiry",
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Enquiry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Enquiry</DialogTitle>
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
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
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
                required
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
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="course">Interested Course *</Label>
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
              <Label htmlFor="source">Source *</Label>
              <Select value={formData.source} onValueChange={(value) => handleChange("source", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Advertisement">Advertisement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
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
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes about the enquiry"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!phoneError || formData.phone.length !== 10}>
              {loading ? "Adding..." : "Add Enquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
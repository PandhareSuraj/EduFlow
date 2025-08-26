import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";

interface AddFacultyDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddFacultyDialog({ trigger, onSuccess }: AddFacultyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    experience: "",
    qualification: "",
    subjects: "",
    address: "",
    status: "Active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.designation || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's college
      const { data: userCollegeData } = await supabase
        .from('user_roles')
        .select('college_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('faculty')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          department: formData.department,
          experience: formData.experience || null,
          qualification: formData.qualification || null,
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
          address: formData.address || null,
          status: formData.status.toLowerCase(),
          college_id: userCollegeData?.college_id
        });

      if (error) throw error;

      toast({
        title: "Faculty Added",
        description: `${formData.name} has been successfully added to the faculty.`,
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        designation: "",
        department: "",
        experience: "",
        qualification: "",
        subjects: "",
        address: "",
        status: "Active"
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add faculty member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Faculty
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Faculty Member</DialogTitle>
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
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation *</Label>
              <Select value={formData.designation} onValueChange={(value) => handleChange("designation", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
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
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
          </div>
          <div>
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              value={formData.qualification}
              onChange={(e) => handleChange("qualification", e.target.value)}
              placeholder="Enter educational qualification"
            />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Faculty
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
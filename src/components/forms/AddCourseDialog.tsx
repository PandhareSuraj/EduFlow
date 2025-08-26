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

interface AddCourseDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddCourseDialog({ trigger, onSuccess }: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration: "",
    fees: "",
    description: "",
    eligibility: "",
    seats: "",
    status: "Active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.duration) {
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

      const durationMap: { [key: string]: number } = {
        "6 Months": 6,
        "1 Year": 12,
        "2 Years": 24,
        "3 Years": 36
      };

      const { error } = await supabase
        .from('courses')
        .insert({
          name: formData.name,
          code: formData.code,
          duration_months: durationMap[formData.duration] || 24,
          fees_per_semester: parseFloat(formData.fees.replace(/[^\d.]/g, '')) || 0,
          description: formData.description,
          status: formData.status.toLowerCase(),
          college_id: userCollegeData?.college_id
        });

      if (error) throw error;

      toast({
        title: "Course Added",
        description: `${formData.name} course has been successfully created.`,
      });
      setFormData({
        name: "",
        code: "",
        duration: "",
        fees: "",
        description: "",
        eligibility: "",
        seats: "",
        status: "Active"
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add course",
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
            Add New Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter course name"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Course Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="Enter course code"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Select value={formData.duration} onValueChange={(value) => handleChange("duration", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
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
              <Label htmlFor="fees">Course Fees *</Label>
              <Input
                id="fees"
                value={formData.fees}
                onChange={(e) => handleChange("fees", e.target.value)}
                placeholder="Enter course fees"
                required
              />
            </div>
            <div>
              <Label htmlFor="seats">Total Seats</Label>
              <Input
                id="seats"
                type="number"
                value={formData.seats}
                onChange={(e) => handleChange("seats", e.target.value)}
                placeholder="Enter total seats"
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
            <Label htmlFor="eligibility">Eligibility Criteria</Label>
            <Textarea
              id="eligibility"
              value={formData.eligibility}
              onChange={(e) => handleChange("eligibility", e.target.value)}
              placeholder="Enter eligibility criteria"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter course description"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
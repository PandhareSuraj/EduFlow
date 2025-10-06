import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const placementSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  job_id: z.string().min(1, "Please select a job posting"),
  position_title: z.string().min(1, "Position title is required"),
  salary_package: z.string().min(1, "Salary package is required"),
  joining_date: z.string().min(1, "Joining date is required"),
  placement_type: z.string().min(1, "Please select placement type"),
});

interface PlacementConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PlacementConfirmationDialog({ open, onOpenChange, onSuccess }: PlacementConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [joiningDate, setJoiningDate] = useState<Date>();

  const form = useForm<z.infer<typeof placementSchema>>({
    resolver: zodResolver(placementSchema),
  });

  const { data: students } = useQuery({
    queryKey: ["students-for-placement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, courses(name)")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs-for-placement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("id, title, companies(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function onSubmit(values: z.infer<typeof placementSchema>) {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("student_placements").insert({
        student_id: parseInt(values.student_id),
        job_posting_id: values.job_id,
        position_title: values.position_title,
        package_amount: parseFloat(values.salary_package),
        joining_date: values.joining_date,
        placement_type: values.placement_type,
        status: "offer_extended",
        college_id: userRole?.college_id,
      } as any);

      if (error) throw error;

      // Update student application status to selected
      await supabase
        .from("student_applications")
        .update({ status: "selected" })
        .eq("student_id", parseInt(values.student_id))
        .eq("job_posting_id", values.job_id);

      toast.success("Placement recorded successfully");
      form.reset();
      setJoiningDate(undefined);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to record placement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Student Placement</DialogTitle>
          <DialogDescription>Record a confirmed placement for a student</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students?.map((student: any) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} - {student.courses?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Posting</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job posting" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jobs?.map((job: any) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title} - {job.companies?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Package (LPA)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 6.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="joining_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="campus">Campus Placement</SelectItem>
                        <SelectItem value="off-campus">Off-Campus Placement</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Recording..." : "Confirm Placement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

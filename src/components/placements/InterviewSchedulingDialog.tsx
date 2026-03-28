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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const interviewSchema = z.object({
  job_id: z.string().min(1, "Please select a job posting"),
  student_id: z.string().min(1, "Please select a student"),
  interview_type: z.string().min(1, "Please select interview type"),
  interview_date: z.string().min(1, "Interview date is required"),
  interview_time: z.string().min(1, "Interview time is required"),
  location: z.string().min(1, "Location is required"),
  interviewer_name: z.string().optional(),
  notes: z.string().optional(),
});

interface InterviewSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InterviewSchedulingDialog({ open, onOpenChange, onSuccess }: InterviewSchedulingDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof interviewSchema>>({
    resolver: zodResolver(interviewSchema),
  });

  const { data: jobs } = useQuery({
    queryKey: ["active-jobs-for-interview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("id, title, company_id, companies(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students-for-interview"],
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

  async function onSubmit(values: z.infer<typeof interviewSchema>) {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      // Look up company_id from the selected job posting
      const selectedJob = jobs?.find((j: any) => j.id === values.job_id);
      if (!selectedJob) throw new Error("Selected job posting not found");

      const { error } = await supabase.from("interviews").insert({
        job_posting_id: values.job_id,
        company_id: (selectedJob as any).company_id,
        student_id: parseInt(values.student_id),
        interview_type: values.interview_type,
        interview_date: values.interview_date,
        interview_time: values.interview_time,
        location: values.location,
        interviewer_name: values.interviewer_name,
        notes: values.notes,
        status: "scheduled",
        college_id: userRole?.college_id,
      } as any);

      if (error) throw error;

      toast.success("Interview scheduled successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>Schedule an interview for a student application</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="interview_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interview type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="group_discussion">Group Discussion</SelectItem>
                      <SelectItem value="final">Final Round</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interview_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interview_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / Meeting Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Room 101 or https://meet.google.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interviewer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interviewer Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Interviewer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

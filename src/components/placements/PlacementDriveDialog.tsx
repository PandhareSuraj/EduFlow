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

const driveSchema = z.object({
  company_id: z.string().min(1, "Please select a company"),
  drive_name: z.string().min(1, "Drive name is required"),
  drive_date: z.string().min(1, "Drive date is required"),
  venue: z.string().min(1, "Venue is required"),
  description: z.string().optional(),
  registration_deadline: z.string().min(1, "Registration deadline is required"),
  eligible_courses: z.string().min(1, "Eligible courses are required"),
  minimum_cgpa: z.string().min(1, "Minimum CGPA is required"),
});

interface PlacementDriveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PlacementDriveDialog({ open, onOpenChange, onSuccess }: PlacementDriveDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof driveSchema>>({
    resolver: zodResolver(driveSchema),
  });

  const { data: companies } = useQuery({
    queryKey: ["companies-for-drive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["courses-for-drive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  async function onSubmit(values: z.infer<typeof driveSchema>) {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("placement_drives").insert({
        company_id: values.company_id,
        drive_name: values.drive_name,
        drive_date: values.drive_date,
        venue: values.venue,
        description: values.description,
        registration_deadline: values.registration_deadline,
        eligible_courses: values.eligible_courses.split(',').map(c => c.trim()),
        min_cgpa: parseFloat(values.minimum_cgpa),
        status: "scheduled",
        college_id: userRole?.college_id,
      });

      if (error) throw error;

      toast.success("Placement drive created successfully");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to create placement drive");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Placement Drive</DialogTitle>
          <DialogDescription>Schedule a new placement drive for students</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
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
              name="drive_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Drive Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Campus Recruitment 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="drive_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registration_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Auditorium, Main Campus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eligible_courses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligible Courses</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., DMLT, DRT, DOTT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimum_cgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum CGPA</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 7.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional details about the drive..." {...field} />
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
                {loading ? "Creating..." : "Create Drive"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  room_id: z.string().min(1, "Please select a room"),
  allocation_date: z.string().min(1, "Allocation date is required"),
  vacate_date: z.string().optional(),
  monthly_fee: z.string().min(1, "Monthly fee is required"),
  special_requirements: z.string().optional(),
});

interface AddHostelAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddHostelAllocationDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddHostelAllocationDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      special_requirements: "",
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, student_id")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch rooms (not just available ones, but rooms with capacity)
  const { data: rooms = [] } = useQuery({
    queryKey: ["hostel-rooms-available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hostel_rooms")
        .select("*")
        .order("room_number");
      
      if (error) throw error;
      // Filter rooms that still have capacity
      return (data || []).filter((room: any) => (room.occupied_beds || 0) < room.capacity);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error: allocationError } = await supabase.from("hostel_allocations").insert({
        student_id: parseInt(values.student_id),
        room_id: values.room_id,
        allocation_date: values.allocation_date,
        vacate_date: values.vacate_date || null,
        monthly_fee: parseFloat(values.monthly_fee),
        special_requirements: values.special_requirements || null,
        status: "active",
        college_id: userRole?.college_id,
      });

      if (allocationError) throw allocationError;

      // Update room occupied_beds count
      const { data: room } = await supabase
        .from("hostel_rooms")
        .select("occupied_beds, capacity")
        .eq("id", values.room_id)
        .single();

      if (room) {
        const newOccupiedBeds = (room.occupied_beds || 0) + 1;
        const newStatus = newOccupiedBeds >= room.capacity ? "occupied" : "available";
        
        await supabase
          .from("hostel_rooms")
          .update({ 
            occupied_beds: newOccupiedBeds,
            status: newStatus
          })
          .eq("id", values.room_id);
      }

      toast.success("Hostel allocation created successfully");
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create allocation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Hostel Allocation</DialogTitle>
          <DialogDescription>
            Allocate a room to a student
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                        {students?.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name} ({student.student_id})
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
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">No rooms available</div>
                        ) : (
                          rooms.map((room: any) => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.room_number} - {room.building} ({room.capacity - (room.occupied_beds || 0)} beds available)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allocation_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocation Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vacate_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vacate Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Fee (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter monthly fee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="special_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or notes..."
                      className="resize-none"
                      {...field}
                    />
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
                {loading ? "Creating..." : "Create Allocation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

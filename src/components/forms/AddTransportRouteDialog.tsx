import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  route_name: z.string().min(1, "Route name is required"),
  route_code: z.string().min(1, "Route code is required"),
  starting_point: z.string().min(1, "Starting point is required"),
  ending_point: z.string().min(1, "Ending point is required"),
  total_distance: z.string().min(1, "Distance is required"),
  estimated_duration: z.string().min(1, "Duration is required"),
  base_fare: z.string().min(1, "Base fare is required"),
});

interface AddTransportRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTransportRouteDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTransportRouteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<string[]>([]);
  const [newStop, setNewStop] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const addStop = () => {
    if (newStop.trim()) {
      setStops([...stops, newStop.trim()]);
      setNewStop("");
    }
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("transport_routes").insert({
        route_name: values.route_name,
        route_code: values.route_code,
        starting_point: values.starting_point,
        ending_point: values.ending_point,
        stops: stops,
        distance: parseFloat(values.total_distance),
        duration: parseInt(values.estimated_duration),
        fare: parseFloat(values.base_fare),
        status: "active",
        college_id: userRole?.college_id,
      });

      if (error) throw error;

      toast.success("Transport route created successfully");
      form.reset();
      setStops([]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transport Route</DialogTitle>
          <DialogDescription>
            Create a new bus route with stops and fare details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="route_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City Center Route" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="route_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., R-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="starting_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Point</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., College Main Gate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ending_point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ending Point</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City Bus Stand" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Distance (km)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 15.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 45" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_fare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Fare (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 25.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Bus Stops</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a bus stop"
                  value={newStop}
                  onChange={(e) => setNewStop(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStop())}
                />
                <Button type="button" onClick={addStop} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {stops.map((stop, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {index + 1}. {stop}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeStop(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Route"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

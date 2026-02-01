import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Plus, Filter, Upload, Edit2, X, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  event_type: z.string().min(1, "Please select an event type"),
  event_date: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  max_attendees: z.coerce.number().min(1, "Must be at least 1").optional(),
  poster_url: z.string().optional(),
});

export default function Events() {
  const { userRole } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "",
      event_date: "",
      location: "",
      start_time: "",
      end_time: "",
      max_attendees: undefined,
      poster_url: "",
    },
  });

  const editForm = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      event_type: "",
      event_date: "",
      location: "",
      start_time: "",
      end_time: "",
      max_attendees: undefined,
      poster_url: "",
    },
  });

  // Fetch events from database
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events" as any)
        .select("*")
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Handle poster upload
  const handlePosterUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `event-posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('college-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('college-assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading poster:', error);
      return null;
    }
  };

  // Handle poster file selection
  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof eventFormSchema>) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: userRoleData } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      // Upload poster if provided
      let posterUrl = values.poster_url;
      if (posterFile) {
        posterUrl = await handlePosterUpload(posterFile);
      }

      const { data, error } = await supabase
        .from("events" as any)
        .insert([{
          ...values,
          poster_url: posterUrl,
          college_id: userRoleData?.college_id,
          status: "scheduled",
          created_by: userData.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notifications to all students
      const { data: students } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('college_id', userRoleData?.college_id)
        .eq('role', 'student');

      if (students && students.length > 0) {
        const notifications = students.map(s => ({
          user_id: s.user_id,
          college_id: userRoleData?.college_id,
          title: `New Event: ${values.title}`,
          message: `${values.description.substring(0, 100)} on ${format(new Date(values.event_date), "MMM dd, yyyy")}`,
          type: 'info',
          action_url: '/events',
          expires_at: new Date(values.event_date).toISOString(),
        }));

        const { data: insertedNotifications } = await supabase.from('notifications').insert(notifications).select();

        // Send push notifications
        if (insertedNotifications && insertedNotifications.length > 0) {
          try {
            await supabase.functions.invoke('send-push-notification', {
              body: {
                notification_id: insertedNotifications[0].id,
                user_ids: students.map(s => s.user_id),
              },
            });
          } catch (error) {
            console.error('Failed to send push notifications:', error);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event created and notifications sent to students",
      });
      setShowCreateDialog(false);
      form.reset();
      setPosterFile(null);
      setPosterPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof eventFormSchema>) => {
      if (!selectedEvent) return;

      // Upload new poster if provided
      let posterUrl = values.poster_url || selectedEvent.poster_url;
      if (posterFile) {
        posterUrl = await handlePosterUpload(posterFile);
      }

      const { data, error } = await supabase
        .from("events" as any)
        .update({
          ...values,
          poster_url: posterUrl,
        })
        .eq('id', selectedEvent.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      setShowEditDialog(false);
      setSelectedEvent(null);
      editForm.reset();
      setPosterFile(null);
      setPosterPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof eventFormSchema>) => {
    createEventMutation.mutate(values);
  };

  const onEditSubmit = (values: z.infer<typeof eventFormSchema>) => {
    updateEventMutation.mutate(values);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    editForm.reset({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      event_date: event.event_date,
      location: event.location,
      start_time: event.start_time,
      end_time: event.end_time,
      max_attendees: event.max_attendees,
      poster_url: event.poster_url || "",
    });
    setPosterPreview(event.poster_url || null);
    setShowEditDialog(true);
  };

  const mockEvents = [
    {
      id: "1",
      title: "Annual Cultural Fest",
      description: "A grand celebration of art, music, and culture",
      event_date: "2024-02-15",
      start_time: "09:00",
      end_time: "18:00",
      location: "Main Auditorium",
      event_type: "cultural",
      status: "scheduled",
      max_attendees: 500,
      registered: 287
    },
    {
      id: "2", 
      title: "Technology Workshop",
      description: "Latest trends in artificial intelligence and machine learning",
      event_date: "2024-01-28",
      start_time: "14:00",
      end_time: "17:00",
      location: "Computer Lab 1",
      event_type: "academic",
      status: "scheduled", 
      max_attendees: 50,
      registered: 45
    },
    {
      id: "3",
      title: "Sports Championship",
      description: "Inter-college sports competition",
      event_date: "2024-03-10",
      start_time: "08:00",
      end_time: "20:00", 
      location: "Sports Complex",
      event_type: "sports",
      status: "scheduled",
      max_attendees: 1000,
      registered: 623
    }
  ];

  const getEventTypeColor = (type: string) => {
    const colors = {
      academic: "bg-blue-100 text-blue-800",
      cultural: "bg-purple-100 text-purple-800", 
      sports: "bg-green-100 text-green-800",
      holiday: "bg-orange-100 text-orange-800",
      placement: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      ongoing: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800", 
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const canManageEvents = userRole === 'admin' || userRole === 'super_admin' || userRole === 'teacher';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events & Calendar</h1>
          <p className="text-muted-foreground">
            Manage college events, activities, and calendar
          </p>
        </div>
        {canManageEvents && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to the college calendar
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Annual Cultural Fest" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="event_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="placement">Placement</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="event_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Main Auditorium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
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
                    name="max_attendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Attendees (optional)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} placeholder="500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label>Event Poster (optional)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePosterChange(e, false)}
                        className="flex-1"
                      />
                      {posterPreview && (
                        <div className="relative w-20 h-20">
                          <img
                            src={posterPreview}
                            alt="Poster preview"
                            className="w-full h-full object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => {
                              setPosterFile(null);
                              setPosterPreview(null);
                            }}
                            aria-label="Remove poster image"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowCreateDialog(false);
                        setPosterFile(null);
                        setPosterPreview(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEventMutation.isPending}>
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details and poster
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Annual Cultural Fest" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="holiday">Holiday</SelectItem>
                        <SelectItem value="placement">Placement</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Main Auditorium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="max_attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attendees (optional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Event Poster (optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePosterChange(e, true)}
                    className="flex-1"
                  />
                  {posterPreview && (
                    <div className="relative w-20 h-20">
                      <img
                        src={posterPreview}
                        alt="Poster preview"
                        className="w-full h-full object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => {
                          setPosterFile(null);
                          setPosterPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedEvent(null);
                    setPosterFile(null);
                    setPosterPreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEventMutation.isPending}>
                  {updateEventMutation.isPending ? "Updating..." : "Update Event"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {events.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                {event.poster_url && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={event.poster_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {event.event_type}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.start_time} - {event.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.registered || 0}/{event.max_attendees || 0} registered</span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    {userRole === 'student' && (
                      <Button size="sm" variant="outline">
                        Register
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {canManageEvents && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Visual calendar showing all events and holidays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                Calendar component will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>
                View completed and cancelled events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                Past events will be shown here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {canManageEvents && (
            <Card>
              <CardHeader>
                <CardTitle>Event Categories</CardTitle>
                <CardDescription>
                  Manage event categories and types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-muted-foreground">
                  Event categories management will be implemented here
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
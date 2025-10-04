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
import { AlertCircle, MessageSquare, FileText, Clock, Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

const grievanceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  grievance_type: z.string().min(1, "Please select a type"),
  category_id: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select priority"),
});

export default function Grievances() {
  const { userRole } = useAuth();
  const [showGrievanceDialog, setShowGrievanceDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const grievanceForm = useForm<z.infer<typeof grievanceFormSchema>>({
    resolver: zodResolver(grievanceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      grievance_type: "",
      category_id: "",
      priority: "",
    },
  });

  // Fetch grievance categories
  const { data: categories = [] } = useQuery({
    queryKey: ["grievance-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grievance_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch grievances from database
  const { data: grievances = [] } = useQuery({
    queryKey: ["grievances"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("grievances" as any)
        .select("*")
        .eq("submitted_by", userData.user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  // Create grievance mutation
  const createGrievanceMutation = useMutation({
    mutationFn: async (values: z.infer<typeof grievanceFormSchema>) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { data, error } = await supabase
        .from("grievances" as any)
        .insert([{
          ...values,
          college_id: userRole?.college_id,
          status: "submitted",
          submitted_by: userData.user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
      toast({
        title: "Success",
        description: "Grievance submitted successfully",
      });
      setShowGrievanceDialog(false);
      grievanceForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit grievance",
        variant: "destructive",
      });
    },
  });

  const onSubmitGrievance = (values: z.infer<typeof grievanceFormSchema>) => {
    createGrievanceMutation.mutate(values);
  };

  const mockGrievances = [
    {
      id: "1",
      title: "Library Book Issue",
      description: "Unable to return books due to system error",
      grievance_type: "complaint",
      priority: "medium",
      status: "in_progress",
      submitted_by: "Priya Sharma",
      submission_date: "2024-01-20",
      category: "Library Services"
    },
    {
      id: "2",
      title: "Hostel Food Quality",
      description: "Poor quality of food served in hostel mess",
      grievance_type: "complaint", 
      priority: "high",
      status: "acknowledged",
      submitted_by: "Amit Kumar",
      submission_date: "2024-01-22",
      category: "Hostel Services"
    },
    {
      id: "3",
      title: "Course Curriculum Suggestion",
      description: "Add more practical sessions for lab subjects",
      grievance_type: "suggestion",
      priority: "low",
      status: "submitted",
      submitted_by: "Neha Patel",
      submission_date: "2024-01-25",
      category: "Academic"
    }
  ];

  const mockFeedbackForms = [
    {
      id: "1",
      form_title: "Course Feedback - Semester 1",
      description: "Feedback on courses and faculty",
      target_audience: "students",
      is_active: true,
      end_date: "2024-02-15",
      responses: 45
    },
    {
      id: "2",
      form_title: "Infrastructure Assessment",
      description: "Campus infrastructure evaluation",
      target_audience: "all",
      is_active: true,
      end_date: "2024-01-31",
      responses: 78
    }
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800",
      acknowledged: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-orange-100 text-orange-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || colors.submitted;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      complaint: "bg-red-100 text-red-800",
      suggestion: "bg-blue-100 text-blue-800",
      feedback: "bg-purple-100 text-purple-800"
    };
    return colors[type as keyof typeof colors] || colors.feedback;
  };

  const canManageGrievances = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grievance & Feedback System</h1>
          <p className="text-muted-foreground">
            Submit complaints, suggestions, and track resolution status
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showGrievanceDialog} onOpenChange={setShowGrievanceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertCircle className="h-4 w-4 mr-2" />
                Submit Grievance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Grievance</DialogTitle>
                <DialogDescription>
                  Submit your complaint, suggestion, or feedback
                </DialogDescription>
              </DialogHeader>
              <Form {...grievanceForm}>
                <form onSubmit={grievanceForm.handleSubmit(onSubmitGrievance)} className="space-y-4">
                  <FormField
                    control={grievanceForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Brief summary of your concern" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grievanceForm.control}
                    name="grievance_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="complaint">Complaint</SelectItem>
                            <SelectItem value="suggestion">Suggestion</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grievanceForm.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grievanceForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grievanceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={4} placeholder="Describe your concern in detail" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setShowGrievanceDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createGrievanceMutation.isPending}>
                      {createGrievanceMutation.isPending ? "Submitting..." : "Submit Grievance"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Give Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogDescription>
                  Provide your valuable feedback
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feedback_form" className="text-right">
                    Feedback Form
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select feedback form" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFeedbackForms.filter(form => form.is_active).map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.form_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Dynamic feedback form will be rendered here based on selected form
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowFeedbackDialog(false)}>
                  Submit Feedback
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="grievances">My Grievances</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Forms</TabsTrigger>
          {canManageGrievances && <TabsTrigger value="manage">Manage</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Grievances
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">
                  +3 from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Resolution
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Avg. 2.5 days response
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Feedback Forms
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  2 active forms
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolution Rate
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  +5% improvement
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Grievances</CardTitle>
                <CardDescription>Latest submitted grievances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grievances.slice(0, 3).map((grievance: any) => (
                    <div key={grievance.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{grievance.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {grievance.submitted_by} • {grievance.category}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(grievance.priority)}>
                          {grievance.priority}
                        </Badge>
                        <Badge className={getStatusColor(grievance.status)}>
                          {grievance.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Feedback Forms</CardTitle>
                <CardDescription>Forms currently accepting responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFeedbackForms.filter(form => form.is_active).map((form) => (
                    <div key={form.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{form.form_title}</p>
                        <p className="text-sm text-muted-foreground">{form.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{form.responses} responses</p>
                        <p className="text-xs text-muted-foreground">
                          Ends: {format(new Date(form.end_date), "MMM dd")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grievances" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Grievances</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {grievances.map((grievance: any) => (
              <Card key={grievance.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{grievance.title}</CardTitle>
                      <CardDescription>{grievance.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(grievance.grievance_type)}>
                        {grievance.grievance_type}
                      </Badge>
                      <Badge className={getPriorityColor(grievance.priority)}>
                        {grievance.priority}
                      </Badge>
                      <Badge className={getStatusColor(grievance.status)}>
                        {grievance.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{grievance.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>
                      <p className="font-medium">{format(new Date(grievance.submission_date), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Track Status
                    </Button>
                    {grievance.status === 'resolved' && (
                      <Button size="sm" variant="outline">
                        Rate Resolution
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="grid gap-4">
            {mockFeedbackForms.map((form) => (
              <Card key={form.id} className={`hover:shadow-md transition-shadow ${!form.is_active ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{form.form_title}</CardTitle>
                      <CardDescription>{form.description}</CardDescription>
                    </div>
                    <Badge className={form.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {form.is_active ? 'Active' : 'Closed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <p className="font-medium">{form.target_audience}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Responses:</span>
                      <p className="font-medium">{form.responses}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ends:</span>
                      <p className="font-medium">{format(new Date(form.end_date), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {form.is_active && (
                      <Button size="sm">
                        Fill Form
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {canManageGrievances && (
          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grievance Management</CardTitle>
                <CardDescription>
                  Manage and resolve grievances, create feedback forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-muted-foreground">
                  Administrative grievance management interface will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
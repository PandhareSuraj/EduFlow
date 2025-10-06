import { useState } from "react";
import { Plus, Briefcase, Building2, Users, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  description: z.string().optional(),
  website: z.string().optional(),
});

const jobSchema = z.object({
  company_id: z.string().min(1, "Please select a company"),
  job_title: z.string().min(1, "Job title is required"),
  job_type: z.string().min(1, "Job type is required"),
  location: z.string().min(1, "Location is required"),
  salary_range: z.string().min(1, "Salary range is required"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  application_deadline: z.string().min(1, "Deadline is required"),
  positions_available: z.string().min(1, "Number of positions is required"),
});

import { PlacementDashboard } from "@/components/placements/PlacementDashboard";
import { ApplicationsList } from "@/components/placements/ApplicationsList";
import { InterviewCalendar } from "@/components/placements/InterviewCalendar";
import { InterviewSchedulingDialog } from "@/components/placements/InterviewSchedulingDialog";
import { PlacementDriveDialog } from "@/components/placements/PlacementDriveDialog";
import { PlacementDrivesList } from "@/components/placements/PlacementDrivesList";
import { PlacementConfirmationDialog } from "@/components/placements/PlacementConfirmationDialog";
import { PlacementsList } from "@/components/placements/PlacementsList";

const Placements = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [showDriveDialog, setShowDriveDialog] = useState(false);
  const [showPlacementDialog, setShowPlacementDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
  });

  const jobForm = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
  });

  const { data: companies, refetch: refetchCompanies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: jobs, refetch: refetchJobs } = useQuery({
    queryKey: ["job-postings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select("*, companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["placement-stats"],
    queryFn: async () => {
      const { count: activeJobs } = await supabase
        .from("job_postings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: totalCompanies } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: placements } = await supabase
        .from("student_placements")
        .select("*", { count: "exact", head: true });

      return {
        activeJobs: activeJobs || 0,
        totalCompanies: totalCompanies || 0,
        placements: placements || 0,
      };
    },
  });

  async function onSubmitCompany(values: z.infer<typeof companySchema>) {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("companies").insert({
        name: values.name,
        industry: values.industry,
        email: values.email,
        phone: values.phone,
        contact_person: values.contact_person,
        description: values.description,
        website: values.website,
        status: "active",
        college_id: userRole?.college_id,
      });

      if (error) throw error;

      toast.success("Company added successfully");
      companyForm.reset();
      setShowCompanyDialog(false);
      refetchCompanies();
    } catch (error: any) {
      toast.error(error.message || "Failed to add company");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitJob(values: z.infer<typeof jobSchema>) {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("college_id")
        .eq("user_id", userData.user?.id)
        .single();

      const { error } = await supabase.from("job_postings").insert({
        company_id: values.company_id,
        title: values.job_title,
        job_type: values.job_type,
        location: values.location,
        salary_range: values.salary_range,
        description: values.description,
        requirements: values.requirements,
        application_deadline: values.application_deadline,
        total_positions: parseInt(values.positions_available),
        filled_positions: 0,
        status: "active",
        college_id: userRole?.college_id,
      });

      if (error) throw error;

      toast.success("Job posting created successfully");
      jobForm.reset();
      setShowJobDialog(false);
      refetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to create job posting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Placement & Internship Management</h1>
          <p className="text-muted-foreground">
            Manage companies, job postings, and student placements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCompanyDialog(true)}>
            <Building2 className="mr-2 h-4 w-4" />
            Add Company
          </Button>
          <Button onClick={() => setShowJobDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Job Posting
          </Button>
        </div>
      </div>

      {/* Add Company Dialog */}
      <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>Add a new company to your placement partners</DialogDescription>
          </DialogHeader>
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., IT, Healthcare" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="company@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="HR Manager name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={companyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief company description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCompanyDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Company"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Job Posting Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Job Posting</DialogTitle>
            <DialogDescription>Post a new job opportunity for students</DialogDescription>
          </DialogHeader>
          <Form {...jobForm}>
            <form onSubmit={jobForm.handleSubmit(onSubmitJob)} className="space-y-4">
              <FormField
                control={jobForm.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
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
                  control={jobForm.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={jobForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bangalore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="salary_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5-7 LPA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={jobForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Job description..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={jobForm.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Job requirements..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={jobForm.control}
                  name="application_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={jobForm.control}
                  name="positions_available"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positions Available</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowJobDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Job Posting"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stats and Tabs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partner Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Placements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.placements || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <PlacementDashboard />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsList />
        </TabsContent>

        <TabsContent value="interviews">
          <div className="space-y-4">
            <Button onClick={() => setShowInterviewDialog(true)}>Schedule Interview</Button>
            <InterviewCalendar />
          </div>
        </TabsContent>

        <TabsContent value="drives">
          <div className="space-y-4">
            <Button onClick={() => setShowDriveDialog(true)}>Create Drive</Button>
            <PlacementDrivesList />
          </div>
        </TabsContent>

        <TabsContent value="placements">
          <div className="space-y-4">
            <Button onClick={() => setShowPlacementDialog(true)}>Record Placement</Button>
            <PlacementsList />
          </div>
        </TabsContent>

        <TabsContent value="dashboard-old" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Recent placement activities</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Dashboard content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs?.map((job) => (
                  <div key={job.id} className="flex justify-between items-start p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{(job as any).job_title}</h3>
                      <p className="text-sm text-muted-foreground">{(job as any).companies?.name}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{(job as any).location}</Badge>
                        <Badge variant="outline">{(job as any).salary_range}</Badge>
                      </div>
                    </div>
                    <Badge>{(job as any).status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies?.map((company) => (
                  <div key={company.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    </div>
                    <Badge>{company.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Placements;

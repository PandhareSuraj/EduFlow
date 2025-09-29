import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Briefcase, Users, TrendingUp, Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Placements() {
  const { userRole } = useAuth();
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const mockCompanies = [
    {
      id: "1",
      name: "TechCorp Solutions",
      industry: "Information Technology",
      status: "active",
      total_jobs: 3,
      active_jobs: 2
    },
    {
      id: "2",
      name: "MediCare Plus",
      industry: "Healthcare", 
      status: "active",
      total_jobs: 2,
      active_jobs: 1
    },
    {
      id: "3",
      name: "Global Pharma Ltd",
      industry: "Pharmaceuticals",
      status: "active", 
      total_jobs: 4,
      active_jobs: 3
    }
  ];

  const mockJobs = [
    {
      id: "1",
      title: "Medical Laboratory Technician",
      company: "MediCare Plus",
      job_type: "placement",
      employment_type: "full_time",
      location: "Mumbai",
      salary_range: "₹3.5-4.5 LPA",
      application_deadline: "2024-02-15",
      status: "active",
      applications: 25
    },
    {
      id: "2", 
      title: "Radiology Technician Intern",
      company: "Global Pharma Ltd",
      job_type: "internship",
      employment_type: "full_time",
      location: "Pune",
      salary_range: "₹15,000/month",
      application_deadline: "2024-01-30",
      status: "active",
      applications: 18
    },
    {
      id: "3",
      title: "Quality Control Analyst",
      company: "Global Pharma Ltd", 
      job_type: "placement",
      employment_type: "full_time",
      location: "Hyderabad",
      salary_range: "₹4-6 LPA",
      application_deadline: "2024-02-20",
      status: "active",
      applications: 32
    }
  ];

  const mockPlacements = [
    {
      id: "1",
      student_name: "Priya Sharma",
      company: "TechCorp Solutions",
      position: "Lab Technician",
      package: "₹4.2 LPA",
      joining_date: "2024-03-01",
      status: "accepted"
    },
    {
      id: "2",
      student_name: "Amit Kumar", 
      company: "MediCare Plus",
      position: "Medical Technologist",
      package: "₹3.8 LPA",
      joining_date: "2024-02-15",
      status: "offered"
    }
  ];

  const getJobTypeColor = (type: string) => {
    return type === 'placement' 
      ? "bg-blue-100 text-blue-800" 
      : "bg-green-100 text-green-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      closed: "bg-red-100 text-red-800", 
      draft: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const canManagePlacements = userRole === 'admin' || userRole === 'super_admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Placement & Internship Management</h1>
          <p className="text-muted-foreground">
            Manage companies, job postings, and student placements
          </p>
        </div>
        {canManagePlacements && (
          <div className="flex gap-2">
            <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Company</DialogTitle>
                  <DialogDescription>
                    Add a new company for placement opportunities
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company_name" className="text-right">
                      Company Name
                    </Label>
                    <Input id="company_name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="industry" className="text-right">
                      Industry
                    </Label>
                    <Input id="industry" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_person" className="text-right">
                      Contact Person
                    </Label>
                    <Input id="contact_person" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" className="col-span-3" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCompanyDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCompanyDialog(false)}>
                    Add Company
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Posting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Job Posting</DialogTitle>
                  <DialogDescription>
                    Add a new job or internship opportunity
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job_title" className="text-right">
                      Job Title
                    </Label>
                    <Input id="job_title" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company_select" className="text-right">
                      Company
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job_type">Job Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="placement">Placement</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employment_type">Employment Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" />
                    </div>
                    <div>
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input id="salary_range" placeholder="e.g., ₹3-5 LPA" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job_description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="job_description" className="col-span-3" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowJobDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowJobDialog(false)}>
                    Create Job
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Partner Companies
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +1 new partnership
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Applications
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">75</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Placement Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last year
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Placements</CardTitle>
                <CardDescription>Latest successful placements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPlacements.map((placement) => (
                    <div key={placement.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{placement.student_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {placement.position} at {placement.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{placement.package}</p>
                        <Badge className={getStatusColor(placement.status)}>
                          {placement.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Companies</CardTitle>
                <CardDescription>Most active recruiting partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.industry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{company.active_jobs} active jobs</p>
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Job Postings</h2>
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
            {mockJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription>{job.company} • {job.location}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getJobTypeColor(job.job_type)}>
                        {job.job_type}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Salary:</span>
                      <p className="font-medium">{job.salary_range}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{job.employment_type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <p className="font-medium">{format(new Date(job.application_deadline), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Applications:</span>
                      <p className="font-medium">{job.applications}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {userRole === 'student' && (
                      <Button size="sm">
                        Apply Now
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {canManagePlacements && (
                      <>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          Manage Applications
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <div className="grid gap-4">
            {mockCompanies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{company.name}</CardTitle>
                      <CardDescription>{company.industry}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(company.status)}>
                      {company.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {company.total_jobs} total jobs • {company.active_jobs} active
                    </div>
                    {canManagePlacements && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Track and manage student applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                Applications management will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Placements</CardTitle>
              <CardDescription>
                View and manage successful placements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPlacements.map((placement) => (
                  <div key={placement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{placement.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {placement.position} at {placement.company}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Joining: {format(new Date(placement.joining_date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{placement.package}</p>
                      <Badge className={getStatusColor(placement.status)}>
                        {placement.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
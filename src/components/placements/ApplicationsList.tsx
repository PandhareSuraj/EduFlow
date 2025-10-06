import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ExternalLink, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";

export function ApplicationsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: applications, refetch } = useQuery({
    queryKey: ["student-applications", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("student_applications")
        .select(`
          *,
          students(id, name, email, course_id, courses(name)),
          job_postings(title, job_type, companies(name))
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredApplications = applications?.filter(app =>
    app.students?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_postings?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function updateStatus(applicationId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("student_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success(`Application ${newStatus}`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update application");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'shortlisted': return <UserCheck className="h-4 w-4" />;
      case 'selected': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by student or job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredApplications?.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No applications found</p>
            </CardContent>
          </Card>
        )}
        {filteredApplications?.map((app: any) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{app.students?.name}</CardTitle>
                  <CardDescription>
                    {app.students?.courses?.name} | {app.students?.email}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(app.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Applied for</p>
                <p className="text-sm text-muted-foreground">
                  {app.job_postings?.title} at {app.job_postings?.companies?.name}
                </p>
                <Badge variant="outline" className="mt-1">
                  {app.job_postings?.job_type}
                </Badge>
              </div>

              {app.skills && (
                <div>
                  <p className="text-sm font-medium">Skills</p>
                  <p className="text-sm text-muted-foreground">{app.skills}</p>
                </div>
              )}

              {app.cover_letter && (
                <div>
                  <p className="text-sm font-medium">Cover Letter</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{app.cover_letter}</p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {app.resume_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Resume
                    </a>
                  </Button>
                )}
                {app.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(app.id, 'shortlisted')}>
                      Shortlist
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(app.id, 'rejected')}>
                      Reject
                    </Button>
                  </>
                )}
                {app.status === 'shortlisted' && (
                  <>
                    <Button size="sm" onClick={() => updateStatus(app.id, 'selected')}>
                      Select
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(app.id, 'pending')}>
                      Move to Pending
                    </Button>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Applied on {new Date(app.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

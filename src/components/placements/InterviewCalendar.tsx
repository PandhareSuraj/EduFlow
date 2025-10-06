import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { InterviewFeedbackDialog } from "./InterviewFeedbackDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InterviewCalendar() {
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: interviews, refetch } = useQuery({
    queryKey: ["interviews", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("interviews")
        .select(`
          *,
          students(id, name, email, courses(name)),
          job_postings(title, job_type, companies(name))
        `)
        .order("interview_date", { ascending: true });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupByDate = (interviews: any[]) => {
    const grouped: Record<string, any[]> = {};
    interviews?.forEach(interview => {
      const date = interview.interview_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(interview);
    });
    return grouped;
  };

  const groupedInterviews = groupByDate(interviews || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Interview Schedule</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interviews</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.keys(groupedInterviews).length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No interviews scheduled</p>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedInterviews).map(([date, dayInterviews]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            {new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="grid gap-3">
            {dayInterviews.map((interview: any) => (
              <Card key={interview.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{interview.students?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {interview.job_postings?.title} at {interview.job_postings?.companies?.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{interview.interview_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{interview.interview_type}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{interview.location}</span>
                    </div>
                    {interview.interviewer_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{interview.interviewer_name}</span>
                      </div>
                    )}
                  </div>
                  {interview.notes && (
                    <p className="text-sm text-muted-foreground">{interview.notes}</p>
                  )}
                  {interview.status === 'scheduled' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedInterview(interview);
                        setShowFeedbackDialog(true);
                      }}
                    >
                      Record Feedback
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {selectedInterview && (
        <InterviewFeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={setShowFeedbackDialog}
          interview={selectedInterview}
          onSuccess={() => {
            refetch();
            setShowFeedbackDialog(false);
            setSelectedInterview(null);
          }}
        />
      )}
    </div>
  );
}

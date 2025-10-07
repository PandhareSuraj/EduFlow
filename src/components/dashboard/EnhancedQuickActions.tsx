import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ClipboardCheck, 
  BookOpen, 
  Building2, 
  UserCheck, 
  FileText,
  Calendar,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import { AttendanceMarkingDialog } from "@/components/attendance/AttendanceMarkingDialog";
import { CollectFeeDialog } from "@/components/forms/CollectFeeDialog";
import { AddStudentDialog } from "@/components/forms/StudentDialogs";
import { AddBookDialog } from "@/components/library/AddBookDialog";
import { IssueBookDialog } from "@/components/library/IssueBookDialog";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentISTTime, formatISTDate, convertToIST } from "@/utils/dateUtils";
import type { Notification } from "@/hooks/useDashboardNotifications";

interface EnhancedQuickActionsProps {
  userRole: string;
  notifications: Notification[];
  notificationsLoading: boolean;
  className?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'fee_due' | 'session';
}

export function EnhancedQuickActions({ 
  userRole, 
  notifications, 
  notificationsLoading,
  className 
}: EnhancedQuickActionsProps) {
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [collectFeeOpen, setCollectFeeOpen] = useState(false);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('upcoming-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams'
        },
        () => fetchUpcomingEvents()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_fees'
        },
        () => fetchUpcomingEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const events: UpcomingEvent[] = [];
      const today = getCurrentISTTime();
      const nextWeek = getCurrentISTTime();
      nextWeek.setDate(today.getDate() + 7);

      // Fetch upcoming exams
      const { data: upcomingExams } = await supabase
        .from('exams')
        .select('id, name, exam_date')
        .gte('exam_date', formatISTDate(today, 'yyyy-MM-dd'))
        .lte('exam_date', formatISTDate(nextWeek, 'yyyy-MM-dd'))
        .eq('status', 'scheduled')
        .order('exam_date', { ascending: true })
        .limit(3);

      if (upcomingExams) {
        upcomingExams.forEach((exam) => {
          events.push({
            id: `exam-${exam.id}`,
            title: exam.name,
            date: new Date(exam.exam_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            }),
            type: 'exam'
          });
        });
      }

      // Fetch upcoming fee due dates
      const { data: upcomingFees } = await supabase
        .from('student_fees')
        .select('id, due_date, students!student_fees_student_id_fkey(name)')
        .gte('due_date', formatISTDate(today, 'yyyy-MM-dd'))
        .lte('due_date', formatISTDate(nextWeek, 'yyyy-MM-dd'))
        .in('status', ['pending', 'partial'])
        .order('due_date', { ascending: true })
        .limit(2);

      if (upcomingFees) {
        upcomingFees.forEach((fee: any) => {
          events.push({
            id: `fee-${fee.id}`,
            title: `Fee Due - ${fee.students?.name || 'Student'}`,
            date: new Date(fee.due_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            }),
            type: 'fee_due'
          });
        });
      }

      // Sort events by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setEvents(events.slice(0, 4));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = convertToIST(dateStr);
    const today = getCurrentISTTime();
    const tomorrow = getCurrentISTTime();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dateStr;
    }
  };

  const renderQuickActions = () => {
    if (userRole === 'super_admin') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/colleges'}
          >
            <Building2 className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">College Management</p>
              <p className="text-sm text-muted-foreground">Manage college portfolios</p>
            </div>
          </button>
          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/college-performance'}
          >
            <TrendingUp className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Performance Monitor</p>
              <p className="text-sm text-muted-foreground">Track college performance</p>
            </div>
          </button>
          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/multi-college-users'}
          >
            <UserCheck className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Multi-College Users</p>
              <p className="text-sm text-muted-foreground">Manage users across colleges</p>
            </div>
          </button>
        </>
      );
    }

    if (userRole === 'admin' || userRole === 'teacher') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setAddStudentOpen(true)}
          >
            <Users className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Add New Student</p>
              <p className="text-sm text-muted-foreground">Register a new student</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setCollectFeeOpen(true)}
          >
            <DollarSign className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Collect Fee</p>
              <p className="text-sm text-muted-foreground">Process fee payment</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setMarkAttendanceOpen(true)}
          >
            <ClipboardCheck className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Mark Attendance</p>
              <p className="text-sm text-muted-foreground">Daily attendance entry</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-success/10 hover:bg-success/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/reports'}
          >
            <FileText className="mr-3 h-4 w-4 text-success" />
            <div>
              <p className="font-medium">Generate Reports</p>
              <p className="text-sm text-muted-foreground">Academic and administrative reports</p>
            </div>
          </button>
        </>
      );
    }

    if (userRole === 'accountant') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setCollectFeeOpen(true)}
          >
            <DollarSign className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Collect Fee</p>
              <p className="text-sm text-muted-foreground">Process fee payment</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/fees'}
          >
            <FileText className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Fee Reports</p>
              <p className="text-sm text-muted-foreground">Generate financial reports</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/fees?filter=pending'}
          >
            <Users className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Fee Defaulters</p>
              <p className="text-sm text-muted-foreground">View pending payments</p>
            </div>
          </button>
        </>
      );
    }

    if (userRole === 'librarian') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setIssueBookOpen(true)}
          >
            <BookOpen className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Issue Book</p>
              <p className="text-sm text-muted-foreground">Issue book to member</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setAddBookOpen(true)}
          >
            <BookOpen className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Add New Book</p>
              <p className="text-sm text-muted-foreground">Add book to library</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/library'}
          >
            <Users className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Library Management</p>
              <p className="text-sm text-muted-foreground">Manage books and members</p>
            </div>
          </button>
        </>
      );
    }

    return null;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <Card className={`shadow-card hover:shadow-glow transition-all duration-300 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Action Buttons */}
          <div className="grid gap-3">
            {renderQuickActions()}
          </div>

          {/* Tabs for Pending Actions and Upcoming Events */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="relative">
                Pending Actions
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="events">Upcoming Events</TabsTrigger>
            </TabsList>

            {/* Pending Actions Tab */}
            <TabsContent value="pending" className="space-y-3 mt-4">
              {notificationsLoading ? (
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No pending actions</p>
                  <p className="text-sm text-muted-foreground mt-1">All systems running smoothly</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-shadow ${
                      notification.type === 'warning' ? 'bg-warning/10 border-warning/20' :
                      notification.type === 'error' ? 'bg-destructive/10 border-destructive/20' :
                      notification.type === 'info' ? 'bg-primary/10 border-primary/20' :
                      'bg-success/10 border-success/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`h-4 w-4 mt-0.5 ${
                          notification.type === 'warning' ? 'text-warning' :
                          notification.type === 'error' ? 'text-destructive' :
                          notification.type === 'info' ? 'text-primary' :
                          'text-success'
                        }`} />
                        <div>
                          <p className={`font-medium text-sm ${
                            notification.type === 'warning' ? 'text-warning' :
                            notification.type === 'error' ? 'text-destructive' :
                            notification.type === 'info' ? 'text-primary' :
                            'text-success'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium">{notification.count}</span> {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Upcoming Events Tab */}
            <TabsContent value="events" className="space-y-3 mt-4">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="w-8 h-8 bg-muted rounded-lg mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No upcoming events</p>
                  <p className="text-sm text-muted-foreground mt-1">All scheduled for later</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-center p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className={`${
                      event.type === 'exam' ? 'bg-primary text-primary-foreground' :
                      event.type === 'fee_due' ? 'bg-warning text-warning-foreground' :
                      'bg-accent text-accent-foreground'
                    } rounded-lg p-2 mr-3`}>
                      {event.type === 'exam' ? (
                        <Calendar className="h-4 w-4" />
                      ) : (
                        <GraduationCap className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)}{event.time && `, ${event.time}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden Dialogs */}
      <div className="hidden">
        <AddStudentDialog onStudentAdded={() => setAddStudentOpen(false)} />
        <CollectFeeDialog />
        <AttendanceMarkingDialog />
        <AddBookDialog open={addBookOpen} onOpenChange={setAddBookOpen} />
        <IssueBookDialog open={issueBookOpen} onOpenChange={setIssueBookOpen} />
      </div>
    </>
  );
}

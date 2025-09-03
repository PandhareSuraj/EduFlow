import { useState, useEffect } from 'react';
import { Calendar, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'fee_due' | 'session';
}

export function UpcomingEventsCard() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // Fetch upcoming exams
      const { data: upcomingExams } = await supabase
        .from('exams')
        .select('id, name, exam_date')
        .gte('exam_date', today.toISOString().split('T')[0])
        .lte('exam_date', nextWeek.toISOString().split('T')[0])
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
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', nextWeek.toISOString().split('T')[0])
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
      
      setEvents(events.slice(0, 4)); // Show only 4 events
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dateStr;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
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
              <div key={event.id} className="flex items-center p-3 bg-muted/50 rounded-lg">
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
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDate(event.date)}{event.time && `, ${event.time}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
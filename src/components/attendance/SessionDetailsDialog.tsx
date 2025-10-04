import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  student_id: number;
  student_name: string;
  student_number: string;
  status: string;
  marked_at: string;
  remarks: string | null;
}

interface SessionDetailsDialogProps {
  sessionId: string;
  sessionName: string;
  trigger?: React.ReactNode;
}

export function SessionDetailsDialog({ sessionId, sessionName, trigger }: SessionDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSessionDetails = async () => {
    if (!open) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          student_id,
          status,
          marked_at,
          remarks,
          students (
            name,
            student_id
          )
        `)
        .eq('session_id', sessionId);

      if (error) throw error;

      const formattedRecords = (data || []).map((record: any) => ({
        id: record.id,
        student_id: record.student_id,
        student_name: record.students?.name || 'Unknown',
        student_number: record.students?.student_id || 'Unknown',
        status: record.status,
        marked_at: record.marked_at,
        remarks: record.remarks
      }));

      // Sort by student name on client side
      formattedRecords.sort((a, b) => a.student_name.localeCompare(b.student_name));

      setAttendanceRecords(formattedRecords);
    } catch (error: any) {
      console.error("Session details fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch session details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [open, sessionId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <Eye className="h-3 w-3 mr-2" />
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Details - {sessionName}</DialogTitle>
          <DialogDescription>
            View attendance records for this session
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">No attendance records found for this session</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked At</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.student_number}</TableCell>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'late' ? 'secondary' :
                          'destructive'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.marked_at ? new Date(record.marked_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>{record.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentAttendanceDetail {
  id: string;
  session_date: string;
  class_name: string;
  subject_name: string;
  faculty_name: string;
  status: string;
  marked_at: string;
  remarks: string | null;
}

interface StudentDetailsDialogProps {
  studentId: number;
  studentName: string;
  trigger?: React.ReactNode;
}

export function StudentDetailsDialog({ studentId, studentName, trigger }: StudentDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [attendanceDetails, setAttendanceDetails] = useState<StudentAttendanceDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStudentDetails = async () => {
    if (!open) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id,
          status,
          marked_at,
          remarks,
          attendance_sessions (
            session_date,
            class_name,
            subjects (name),
            faculty (name)
          )
        `)
        .eq('student_id', studentId)
        .order('attendance_sessions(session_date)', { ascending: false });

      if (error) throw error;

      const formattedDetails = (data || []).map((record: any) => ({
        id: record.id,
        session_date: record.attendance_sessions?.session_date || '',
        class_name: record.attendance_sessions?.class_name || 'Unknown',
        subject_name: record.attendance_sessions?.subjects?.name || 'Unknown',
        faculty_name: record.attendance_sessions?.faculty?.name || 'Unknown',
        status: record.status,
        marked_at: record.marked_at,
        remarks: record.remarks
      }));

      setAttendanceDetails(formattedDetails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch student attendance details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [open, studentId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance History - {studentName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceDetails.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">No attendance records found for this student</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked At</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">
                        {new Date(detail.session_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{detail.class_name}</TableCell>
                      <TableCell>{detail.subject_name}</TableCell>
                      <TableCell>{detail.faculty_name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          detail.status === 'present' ? 'default' :
                          detail.status === 'late' ? 'secondary' :
                          'destructive'
                        }>
                          {detail.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {detail.marked_at ? new Date(detail.marked_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>{detail.remarks || '-'}</TableCell>
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
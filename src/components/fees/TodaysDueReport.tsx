import { useState, useEffect } from "react";
import { useCollege } from "@/contexts/CollegeContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Phone, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CollectFeeDialog } from "@/components/forms/CollectFeeDialog";
import { FollowUpDialog } from "./FollowUpDialog";

interface DueStudentFee {
  id: string;
  student_id: number;
  student_name: string;
  student_phone: string;
  course_name: string;
  total_amount: number;
  balance_amount: number;
  due_date: string;
  days_overdue: number;
  priority_level: 'low' | 'normal' | 'high' | 'urgent';
  collection_stage: 'reminder' | 'notice' | 'final_notice' | 'legal';
  follow_up_status: 'pending' | 'contacted' | 'promised' | 'escalated' | 'no_response';
  next_follow_up_date: string | null;
  last_follow_up_date: string | null;
  follow_up_count: number;
  promised_payment_date: string | null;
  follow_up_notes: string | null;
}

interface TodaysDueReportProps {
  trigger?: React.ReactNode;
}

export function TodaysDueReport({ trigger }: TodaysDueReportProps) {
  const [open, setOpen] = useState(false);
  const [dueStudents, setDueStudents] = useState<DueStudentFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DueStudentFee | null>(null);
  const [showCollectDialog, setShowCollectDialog] = useState(false);
  const [showFollowUpDialog, setShowFollowUpDialog] = useState(false);
  const { college } = useCollege();

  const fetchDueStudents = async () => {
    if (!college?.id) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          id,
          student_id,
          total_amount,
          balance_amount,
          due_date,
          priority_level,
          collection_stage,
          follow_up_status,
          next_follow_up_date,
          last_follow_up_date,
          follow_up_count,
          promised_payment_date,
          follow_up_notes,
          students!student_id(
            id,
            name,
            mobile_number,
            courses!course_id(name)
          )
        `)
        .eq('college_id', college.id)
        .in('status', ['pending', 'partial'])
        .or(`next_follow_up_date.lte.${today},due_date.lte.${today}`)
        .order('priority_level', { ascending: false })
        .order('due_date', { ascending: true });

      if (error) throw error;

      const processedData: DueStudentFee[] = (data || []).map(fee => {
        const dueDate = new Date(fee.due_date);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: fee.id,
          student_id: fee.student_id,
          student_name: fee.students?.name || 'Unknown',
          student_phone: fee.students?.mobile_number || '',
          course_name: fee.students?.courses?.name || 'Unknown',
          total_amount: fee.total_amount,
          balance_amount: fee.balance_amount,
          due_date: fee.due_date,
          days_overdue: Math.max(0, daysDiff),
          priority_level: fee.priority_level as any,
          collection_stage: fee.collection_stage as any,
          follow_up_status: fee.follow_up_status as any,
          next_follow_up_date: fee.next_follow_up_date,
          last_follow_up_date: fee.last_follow_up_date,
          follow_up_count: fee.follow_up_count,
          promised_payment_date: fee.promised_payment_date,
          follow_up_notes: fee.follow_up_notes
        };
      });

      setDueStudents(processedData);
    } catch (error) {
      console.error('Error fetching due students:', error);
      toast.error('Failed to fetch due students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDueStudents();
    }
  }, [open, college?.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'contacted': return 'default';
      case 'promised': return 'secondary';
      case 'escalated': return 'destructive';
      case 'no_response': return 'outline';
      default: return 'default';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'legal': return 'destructive';
      case 'final_notice': return 'destructive';
      case 'notice': return 'default';
      case 'reminder': return 'secondary';
      default: return 'default';
    }
  };

  const handleFollowUp = (student: DueStudentFee) => {
    setSelectedStudent(student);
    setShowFollowUpDialog(true);
  };

  const handleCollectPayment = (student: DueStudentFee) => {
    setSelectedStudent(student);
    setShowCollectDialog(true);
  };

  const handleFollowUpComplete = () => {
    setShowFollowUpDialog(false);
    setSelectedStudent(null);
    fetchDueStudents(); // Refresh data
  };

  const handlePaymentComplete = () => {
    setShowCollectDialog(false);
    setSelectedStudent(null);
    fetchDueStudents(); // Refresh data
  };

  // Summary calculations
  const totalDue = dueStudents.reduce((sum, student) => sum + student.balance_amount, 0);
  const urgentCount = dueStudents.filter(s => s.priority_level === 'urgent').length;
  const overdueCount = dueStudents.filter(s => s.days_overdue > 0).length;
  const followUpDue = dueStudents.filter(s => s.next_follow_up_date && s.next_follow_up_date <= new Date().toISOString().split('T')[0]).length;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Today's Due Report
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Due Report - {format(new Date(), 'MMM dd, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dueStudents.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Due Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalDue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{urgentCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{followUpDue}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Due Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Follow-ups</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : dueStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No students due for follow-up today
                    </TableCell>
                  </TableRow>
                ) : (
                  dueStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.student_name}</div>
                          <div className="text-sm text-muted-foreground">{student.student_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.course_name}</TableCell>
                      <TableCell className="font-medium">₹{student.balance_amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <div>{format(new Date(student.due_date), 'MMM dd, yyyy')}</div>
                          {student.days_overdue > 0 && (
                            <div className="text-sm text-destructive">
                              {student.days_overdue} days overdue
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(student.priority_level)}>
                          {student.priority_level.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStageColor(student.collection_stage)}>
                          {student.collection_stage.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(student.follow_up_status)}>
                          {student.follow_up_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Count: {student.follow_up_count}</div>
                          {student.next_follow_up_date && (
                            <div className="text-muted-foreground">
                              Next: {format(new Date(student.next_follow_up_date), 'MMM dd')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFollowUp(student)}
                            className="gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            Follow Up
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCollectPayment(student)}
                            className="gap-1"
                          >
                            <DollarSign className="h-3 w-3" />
                            Collect
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {selectedStudent && (
        <>
          <FollowUpDialog
            open={showFollowUpDialog}
            onOpenChange={setShowFollowUpDialog}
            studentFee={selectedStudent}
            onFollowUpComplete={handleFollowUpComplete}
          />
          <CollectFeeDialog
            open={showCollectDialog}
            onOpenChange={setShowCollectDialog}
            studentId={selectedStudent.student_id}
            onSuccess={handlePaymentComplete}
          />
        </>
      )}
    </>
  );
}
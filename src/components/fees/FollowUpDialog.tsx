import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Phone, Clock, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

interface FollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentFee: DueStudentFee;
  onFollowUpComplete: () => void;
}

export function FollowUpDialog({ open, onOpenChange, studentFee, onFollowUpComplete }: FollowUpDialogProps) {
  const [saving, setSaving] = useState(false);
  const [followUpStatus, setFollowUpStatus] = useState<string>('contacted');
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>(undefined);
  const [promisedPaymentDate, setPromisedPaymentDate] = useState<Date | undefined>(undefined);
  const [followUpNotes, setFollowUpNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nextFollowUpDate && followUpStatus !== 'completed') {
      toast.error('Please select next follow-up date');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        follow_up_status: followUpStatus,
        last_follow_up_date: new Date().toISOString().split('T')[0],
        follow_up_count: studentFee.follow_up_count + 1,
        follow_up_notes: followUpNotes,
        updated_at: new Date().toISOString()
      };

      if (nextFollowUpDate) {
        updateData.next_follow_up_date = nextFollowUpDate.toISOString().split('T')[0];
      }

      if (promisedPaymentDate) {
        updateData.promised_payment_date = promisedPaymentDate.toISOString().split('T')[0];
      }

      // Auto-escalate priority if needed
      if (followUpStatus === 'no_response' && studentFee.follow_up_count >= 2) {
        updateData.priority_level = 'urgent';
        if (studentFee.collection_stage === 'reminder') {
          updateData.collection_stage = 'notice';
        } else if (studentFee.collection_stage === 'notice') {
          updateData.collection_stage = 'final_notice';
        }
      }

      const { error } = await supabase
        .from('student_fees')
        .update(updateData)
        .eq('id', studentFee.id);

      if (error) throw error;

      toast.success('Follow-up recorded successfully');
      onFollowUpComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving follow-up:', error);
      toast.error('Failed to save follow-up');
    } finally {
      setSaving(false);
    }
  };

  const getRecommendedNextDate = (status: string) => {
    const today = new Date();
    switch (status) {
      case 'contacted':
        return new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'promised':
        return new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      case 'no_response':
        return new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
      case 'escalated':
        return new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
      default:
        return new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    }
  };

  const handleStatusChange = (status: string) => {
    setFollowUpStatus(status);
    if (status !== 'completed') {
      setNextFollowUpDate(getRecommendedNextDate(status));
    } else {
      setNextFollowUpDate(undefined);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Follow Up - {studentFee.student_name}
          </DialogTitle>
        </DialogHeader>

        {/* Student Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {studentFee.student_name}
              </span>
              <Badge variant={getPriorityColor(studentFee.priority_level)}>
                {studentFee.priority_level.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {studentFee.course_name} • {studentFee.student_phone}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Due Amount</Label>
                <div className="font-semibold text-lg">₹{studentFee.balance_amount.toLocaleString()}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Days Overdue</Label>
                <div className={cn("font-semibold", studentFee.days_overdue > 30 ? "text-destructive" : "text-orange-600")}>
                  {studentFee.days_overdue} days
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Follow-up Count</Label>
                <div className="font-semibold">{studentFee.follow_up_count}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Status</Label>
                <div className="font-semibold capitalize">{studentFee.follow_up_status.replace('_', ' ')}</div>
              </div>
            </div>
            {studentFee.follow_up_notes && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Previous Notes</Label>
                <div className="text-sm bg-muted/50 p-2 rounded mt-1">{studentFee.follow_up_notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Follow-up Status *</Label>
            <Select value={followUpStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacted">Student Contacted</SelectItem>
                <SelectItem value="promised">Payment Promised</SelectItem>
                <SelectItem value="escalated">Escalated to Admin</SelectItem>
                <SelectItem value="no_response">No Response</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {followUpStatus !== 'completed' && (
            <div className="space-y-2">
              <Label>Next Follow-up Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextFollowUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextFollowUpDate ? format(nextFollowUpDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={nextFollowUpDate}
                    onSelect={setNextFollowUpDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {followUpStatus === 'promised' && (
            <div className="space-y-2">
              <Label>Promised Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !promisedPaymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {promisedPaymentDate ? format(promisedPaymentDate, "PPP") : "Select promised date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={promisedPaymentDate}
                    onSelect={setPromisedPaymentDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Follow-up Notes</Label>
            <Textarea
              id="notes"
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="Record conversation details, student response, commitments made, etc."
              rows={4}
            />
          </div>

          {/* Collection Tips */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Collection Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Be empathetic but firm about payment expectations</li>
                <li>• Offer payment plan options if full payment is difficult</li>
                <li>• Document all promises and commitments made by the student</li>
                <li>• Follow up consistently as scheduled</li>
                <li>• Escalate to higher authorities if no response after 3 attempts</li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Record Follow-up'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
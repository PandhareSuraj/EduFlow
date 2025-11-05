import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractISTTime, convertISTDateTimeToUTC } from "@/utils/dateUtils";

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface RescheduleExamDialogProps {
  exam: Exam;
  onExamRescheduled?: () => void;
}

export function RescheduleExamDialog({ exam, onExamRescheduled }: RescheduleExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    exam_date: exam.exam_date,
    start_time: exam.start_time ? extractISTTime(exam.start_time) : "",
    end_time: exam.end_time ? extractISTTime(exam.end_time) : "",
    duration_minutes: exam.duration_minutes || 60
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        exam_date: exam.exam_date,
        start_time: exam.start_time ? extractISTTime(exam.start_time) : "",
        end_time: exam.end_time ? extractISTTime(exam.end_time) : "",
        duration_minutes: exam.duration_minutes || 60
      });
    }
  }, [open, exam]);

  // Calculate duration when times change
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const [startHour, startMin] = formData.start_time.split(':').map(Number);
      const [endHour, endMin] = formData.end_time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      
      if (duration > 0) {
        setFormData(prev => ({ ...prev, duration_minutes: duration }));
      }
    }
  }, [formData.start_time, formData.end_time]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowConfirmation(false);
    }
    setOpen(isOpen);
  };

  const validateTimes = () => {
    if (formData.start_time && formData.end_time) {
      const [startHour, startMin] = formData.start_time.split(':').map(Number);
      const [endHour, endMin] = formData.end_time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        toast({
          title: "Invalid Times",
          description: "End time must be after start time",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTimes()) {
      return;
    }

    // Show confirmation for completed exams
    if (exam.status === 'completed') {
      setShowConfirmation(true);
    } else {
      performReschedule();
    }
  };

  const performReschedule = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const updateData: any = {
        exam_date: formData.exam_date,
        duration_minutes: formData.duration_minutes
      };

      // Auto-adjust status based on new date/time
      const newExamDate = new Date(formData.exam_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newExamDate > today) {
        updateData.status = 'scheduled';
      } else if (newExamDate.toDateString() === today.toDateString()) {
        // If scheduled for today, check time
        if (formData.start_time) {
          const [hour, min] = formData.start_time.split(':').map(Number);
          const now = new Date();
          const scheduledTime = new Date(now);
          scheduledTime.setHours(hour, min, 0, 0);
          
          if (scheduledTime > now) {
            updateData.status = 'scheduled';
          } else {
            updateData.status = 'ongoing';
          }
        } else {
          updateData.status = 'ongoing';
        }
      }

      // Handle time fields with IST to UTC conversion
      if (formData.start_time) {
        updateData.start_time = convertISTDateTimeToUTC(formData.exam_date, formData.start_time);
      } else {
        updateData.start_time = null;
      }
      
      if (formData.end_time) {
        updateData.end_time = convertISTDateTimeToUTC(formData.exam_date, formData.end_time);
      } else {
        updateData.end_time = null;
      }

      const { error } = await supabase
        .from('exams')
        .update(updateData)
        .eq('id', exam.id);

      if (error) throw error;

      toast({
        title: "Exam Rescheduled",
        description: `${exam.name} has been rescheduled to ${new Date(formData.exam_date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}${formData.start_time ? ` at ${formData.start_time}` : ''}.`,
      });
      
      setOpen(false);
      onExamRescheduled?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Exam</DialogTitle>
            <DialogDescription>
              Change the date and time for <strong>{exam.name}</strong>
              {exam.status === 'completed' && " (Completed exam - will reopen)"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="exam_date">Exam Date</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Start Time (IST)</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">End Time (IST)</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="5"
                  max="300"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  required
                />
                {formData.start_time && formData.end_time && (
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from start and end times
                  </p>
                )}
              </div>

              {exam.status === 'completed' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ This exam is marked as completed. Rescheduling will change its status based on the new date/time.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule Exam
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for completed exams */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule Completed Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This exam is marked as <strong>completed</strong>. Rescheduling will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Change the exam date to {new Date(formData.exam_date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</li>
                <li>Update the status based on the new date/time</li>
                <li>Keep all existing exam data and results intact</li>
              </ul>
              <p className="mt-3 font-semibold">Are you sure you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performReschedule}>
              Yes, Reschedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

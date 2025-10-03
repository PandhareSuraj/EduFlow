import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { extractISTTime, convertISTDateTimeToUTC } from "@/utils/dateUtils";

interface Exam {
  id: string;
  name: string;
  course_id: number;
  exam_date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  total_questions?: number;
  total_marks: number;
  passing_marks?: number;
  max_attempts?: number;
  instructions?: string;
  description?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  exam_type?: string;
}

interface EditExamDialogProps {
  exam: Exam;
  onExamUpdated?: () => void;
  disabled?: boolean;
}

export function EditExamDialog({ exam, onExamUpdated, disabled = false }: EditExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: exam.name,
    exam_date: exam.exam_date,
    start_time: exam.start_time ? extractISTTime(exam.start_time) : "",
    end_time: exam.end_time ? extractISTTime(exam.end_time) : "",
    duration_minutes: exam.duration_minutes || 60,
    total_questions: exam.total_questions || 30,
    total_marks: exam.total_marks,
    passing_marks: exam.passing_marks || 50,
    max_attempts: exam.max_attempts || 1,
    instructions: exam.instructions || "",
    description: exam.description || "",
    status: exam.status
  });
  const { toast } = useToast();

  // Prevent editing if exam is completed
  const isCompleted = exam.status === 'completed';

  useEffect(() => {
    if (open) {
      setFormData({
        name: exam.name,
        exam_date: exam.exam_date,
        start_time: exam.start_time ? extractISTTime(exam.start_time) : "",
        end_time: exam.end_time ? extractISTTime(exam.end_time) : "",
        duration_minutes: exam.duration_minutes || 60,
        total_questions: exam.total_questions || 30,
        total_marks: exam.total_marks,
        passing_marks: exam.passing_marks || 50,
        max_attempts: exam.max_attempts || 1,
        instructions: exam.instructions || "",
        description: exam.description || "",
        status: exam.status
      });
    }
  }, [open, exam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCompleted) {
      toast({
        title: "Cannot Edit",
        description: "Completed exams cannot be edited",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name.trim(),
        exam_date: formData.exam_date,
        duration_minutes: formData.duration_minutes,
        total_questions: formData.total_questions,
        total_marks: formData.total_marks,
        passing_marks: formData.passing_marks,
        max_attempts: formData.max_attempts,
        instructions: formData.instructions.trim(),
        description: formData.description.trim() || null,
        status: formData.status
      };

      // Handle time fields properly with IST to UTC conversion
      if (formData.start_time) {
        updateData.start_time = convertISTDateTimeToUTC(formData.exam_date, formData.start_time);
      }
      if (formData.end_time) {
        updateData.end_time = convertISTDateTimeToUTC(formData.exam_date, formData.end_time);
      }

      const { error } = await supabase
        .from('exams')
        .update(updateData)
        .eq('id', exam.id);

      if (error) throw error;

      toast({
        title: "Exam Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      setOpen(false);
      onExamUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update exam details. Course and exam type cannot be changed.
            {isCompleted && " Completed exams cannot be edited."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Exam Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Mid-term Examination"
                  required
                  disabled={isCompleted}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: any) => setFormData({...formData, status: value})}
                  disabled={isCompleted}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exam_date">Exam Date</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                  required
                  disabled={isCompleted}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time (IST)</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  disabled={isCompleted}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time (IST)</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  disabled={isCompleted}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                  disabled={isCompleted}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total_questions">Total Questions</Label>
                <Input
                  id="total_questions"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.total_questions}
                  onChange={(e) => setFormData({...formData, total_questions: parseInt(e.target.value)})}
                  required
                  disabled={isCompleted}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total_marks">Total Marks</Label>
                <Input
                  id="total_marks"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({...formData, total_marks: parseInt(e.target.value)})}
                  required
                  disabled={isCompleted}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="passing_marks">Passing Marks</Label>
                <Input
                  id="passing_marks"
                  type="number"
                  min="0"
                  max={formData.total_marks}
                  value={formData.passing_marks}
                  onChange={(e) => setFormData({...formData, passing_marks: parseFloat(e.target.value)})}
                  required
                  disabled={isCompleted}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_attempts">Max Attempts</Label>
                <Select 
                  value={formData.max_attempts.toString()} 
                  onValueChange={(value) => setFormData({...formData, max_attempts: parseInt(value)})}
                  disabled={isCompleted}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Attempt</SelectItem>
                    <SelectItem value="2">2 Attempts</SelectItem>
                    <SelectItem value="3">3 Attempts</SelectItem>
                    <SelectItem value="999">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder="Instructions for students taking the exam..."
                rows={3}
                disabled={isCompleted}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Optional exam description..."
                rows={2}
                disabled={isCompleted}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isCompleted}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

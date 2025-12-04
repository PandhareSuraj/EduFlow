import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { convertFormTimeToUTC } from "@/utils/dateUtils";

interface Course {
  id: number;
  name: string;
  code: string;
  college_id?: string;
}

interface MCQExamCreationDialogProps {
  courses: Course[];
  onExamCreated?: () => void;
}

export function MCQExamCreationDialog({ courses, onExamCreated }: MCQExamCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    name: "",
    exam_type: "mcq",
    exam_date: "",
    start_time: "",
    end_time: "",
    duration_minutes: 60,
    total_questions: 30,
    total_marks: 30,
    passing_marks: 15,
    max_attempts: 1,
    instructions: "Read all questions carefully before answering. Each question carries equal marks.",
    description: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.course_id) {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const selectedCourse = courses.find(c => c.id.toString() === formData.course_id);
      if (!selectedCourse) {
        throw new Error("Selected course not found");
      }

      // Get college_id
      let collegeId = selectedCourse.college_id;
      if (!collegeId) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('college_id')
          .eq('id', selectedCourse.id)
          .single();
        
        if (courseError) throw courseError;
        collegeId = courseData.college_id;
      }

      // Create exam with MCQ fields
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert([{
          course_id: selectedCourse.id,
          college_id: collegeId,
          name: formData.name.trim(),
          exam_type: formData.exam_type,
          exam_date: formData.exam_date,
          start_time: formData.start_time ? convertFormTimeToUTC(formData.exam_date, formData.start_time) : null,
          end_time: formData.end_time ? convertFormTimeToUTC(formData.exam_date, formData.end_time) : null,
          duration_minutes: formData.duration_minutes,
          total_questions: formData.total_questions,
          total_marks: formData.total_marks,
          passing_marks: formData.passing_marks,
          max_attempts: formData.max_attempts,
          instructions: formData.instructions.trim(),
          description: formData.description.trim() || null,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (examError) throw examError;

      toast({
        title: "MCQ Exam Created",
        description: `${formData.name} has been created for ${selectedCourse.name}. You can now add questions.`,
      });
      
      setFormData({ 
        course_id: "",
        name: "", 
        exam_type: "mcq",
        exam_date: "", 
        start_time: "",
        end_time: "",
        duration_minutes: 60,
        total_questions: 30,
        total_marks: 30,
        passing_marks: 15,
        max_attempts: 1,
        instructions: "Read all questions carefully before answering. Each question carries equal marks.",
        description: ""
      });
      setOpen(false);
      onExamCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create MCQ Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create MCQ Exam</DialogTitle>
          <DialogDescription>
            Set up a new multiple choice exam with customizable settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="course_id">Course</Label>
                <Select 
                  value={formData.course_id} 
                  onValueChange={(value) => setFormData({...formData, course_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} ({course.code})
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Exam Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Mid-term MCQ Test"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="exam_type">Exam Type</Label>
                <Select value={formData.exam_type} onValueChange={(value) => setFormData({...formData, exam_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">MCQ (Multiple Choice)</SelectItem>
                    <SelectItem value="written">Written Exam</SelectItem>
                    <SelectItem value="practical">Practical Exam</SelectItem>
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_time">Start Time (IST)</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_time">End Time (IST)</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_attempts">Max Attempts</Label>
                <Select value={formData.max_attempts.toString()} onValueChange={(value) => setFormData({...formData, max_attempts: parseInt(value)})}>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
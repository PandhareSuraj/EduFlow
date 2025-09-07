import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Edit, Eye, Clock, Users, FileText, Loader2 } from "lucide-react";
import { MCQQuestionBuilder } from "@/components/exams/MCQQuestionBuilder";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Exam {
  id: string;
  course_id: number;
  name: string;
  exam_date: string;
  total_marks: number;
  description?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  exam_type?: string;
  duration_minutes?: number;
  total_questions?: number;
}

interface Course {
  id: number;
  name: string;
  code: string;
  college_id?: string;
}

interface ScheduleExamDialogProps {
  course: Course;
  onExamScheduled?: () => void;
}

export function ScheduleExamDialog({ course, onExamScheduled }: ScheduleExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    exam_date: "",
    total_marks: 100,
    description: "",
    status: "scheduled" as const
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First get the course's college_id if not provided
      let collegeId = course.college_id;
      if (!collegeId) {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('college_id')
          .eq('id', course.id)
          .single();
        
        if (courseError) throw courseError;
        collegeId = courseData.college_id;
      }

      const { error } = await supabase
        .from('exams')
        .insert([{
          course_id: course.id,
          college_id: collegeId,
          name: formData.name.trim(),
          exam_date: formData.exam_date,
          total_marks: formData.total_marks,
          description: formData.description.trim() || null,
          status: formData.status
        }]);

      if (error) throw error;

      toast({
        title: "Exam Scheduled",
        description: `${formData.name} has been scheduled for ${course.name}.`,
      });
      
      setFormData({ 
        name: "", 
        exam_date: "", 
        total_marks: 100, 
        description: "", 
        status: "scheduled" 
      });
      setOpen(false);
      onExamScheduled?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule exam",
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
          Schedule Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Exam for {course.name}</DialogTitle>
          <DialogDescription>
            Create a new exam for the {course.name} course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Exam Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Mid-term Examination"
                required
              />
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
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
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Exam description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ViewExamsDialogProps {
  course: Course;
}

export function ViewExamsDialog({ course }: ViewExamsDialogProps) {
  const [open, setOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('course_id', course.id)
        .order('exam_date', { ascending: true });

      if (error) throw error;
      
      // Cast the data to match our interface
      const examsData = (data || []).map(exam => ({
        ...exam,
        status: exam.status as 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
      }));
      
      setExams(examsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchExams();
    }
  }, [open]);

  const handleExamScheduled = () => {
    fetchExams();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'ongoing': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          View Exams
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Exams - {course.name}</DialogTitle>
          <DialogDescription>
            Manage exams for the {course.name} ({course.code}) course.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium">Course Exams</h4>
              <p className="text-sm text-muted-foreground">{exams.length} exams scheduled</p>
            </div>
            <ScheduleExamDialog course={course} onExamScheduled={handleExamScheduled} />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : exams.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.name}</div>
                          {exam.description && (
                            <div className="text-sm text-muted-foreground">
                              {exam.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(exam.exam_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {exam.total_marks}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {exam.exam_type === 'mcq' && (
                            <MCQQuestionBuilder 
                              exam={{
                                id: exam.id,
                                name: exam.name,
                                total_questions: exam.total_questions || 30,
                                total_marks: exam.total_marks
                              }}
                              onQuestionsUpdated={fetchExams}
                            />
                          )}
                          <Button variant="ghost" size="sm">
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Exams Scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by scheduling exams for this course.
                  </p>
                  <ScheduleExamDialog course={course} onExamScheduled={handleExamScheduled} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, Edit, Eye, Clock, Users, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exam {
  id: string;
  course_id: number;
  name: string;
  exam_date: string;
  total_marks: number;
  description?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface ScheduleExamDialogProps {
  course: Course;
}

export function ScheduleExamDialog({ course }: ScheduleExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    exam_date: "",
    total_marks: 100,
    description: "",
    status: "scheduled" as const
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Supabase integration
    toast({
      title: "Exam Scheduled",
      description: `${formData.name} has been scheduled for ${course.name}.`,
    });
    setOpen(false);
    setFormData({ 
      name: "", 
      exam_date: "", 
      total_marks: 100, 
      description: "", 
      status: "scheduled" 
    });
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
            <Button type="submit">Schedule Exam</Button>
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
  
  // Mock data - replace with Supabase query
  const exams: Exam[] = [
    {
      id: "1",
      course_id: course.id,
      name: "Mid-term Examination",
      exam_date: "2024-08-15",
      total_marks: 100,
      description: "Mid-semester theoretical examination",
      status: "scheduled",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      course_id: course.id,
      name: "Practical Assessment",
      exam_date: "2024-09-20",
      total_marks: 50,
      description: "Hands-on practical examination",
      status: "scheduled",
      created_at: new Date().toISOString()
    }
  ];

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
            <ScheduleExamDialog course={course} />
          </div>
          
          {exams.length > 0 ? (
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
                  <ScheduleExamDialog course={course} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
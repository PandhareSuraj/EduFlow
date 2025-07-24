import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Edit, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  course_id: number;
  name: string;
  code: string;
  description?: string;
  credits: number;
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface AddSubjectDialogProps {
  course: Course;
}

export function AddSubjectDialog({ course }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: 1
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Supabase integration
    toast({
      title: "Subject Added",
      description: `${formData.name} has been added to ${course.name}.`,
    });
    setOpen(false);
    setFormData({ name: "", code: "", description: "", credits: 1 });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Subject to {course.name}</DialogTitle>
          <DialogDescription>
            Create a new subject for the {course.name} course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Anatomy & Physiology"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="e.g., AP101"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Subject description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Subject</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ViewSubjectsDialogProps {
  course: Course;
}

export function ViewSubjectsDialog({ course }: ViewSubjectsDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Mock data - replace with Supabase query
  const subjects: Subject[] = [
    {
      id: "1",
      course_id: course.id,
      name: "Anatomy & Physiology",
      code: "AP101",
      description: "Basic human anatomy and physiological processes",
      credits: 4,
      created_at: new Date().toISOString()
    },
    {
      id: "2", 
      course_id: course.id,
      name: "Medical Terminology",
      code: "MT101",
      description: "Medical terminology and healthcare communication",
      credits: 2,
      created_at: new Date().toISOString()
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-2" />
          View Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Subjects - {course.name}</DialogTitle>
          <DialogDescription>
            Manage subjects for the {course.name} ({course.code}) course.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium">Course Subjects</h4>
              <p className="text-sm text-muted-foreground">{subjects.length} subjects total</p>
            </div>
            <AddSubjectDialog course={course} />
          </div>
          
          {subjects.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{subject.name}</div>
                          {subject.description && (
                            <div className="text-sm text-muted-foreground">
                              {subject.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subject.code}</Badge>
                      </TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Subjects Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding subjects to this course.
                  </p>
                  <AddSubjectDialog course={course} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
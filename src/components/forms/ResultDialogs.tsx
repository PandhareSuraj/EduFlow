import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileSpreadsheet, Edit, Eye, TrendingUp, Users, Award, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Result {
  id: string;
  student_id: number;
  exam_id: string;
  subject_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  student_name: string;
  subject_name: string;
  exam_name: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Exam {
  id: string;
  name: string;
  exam_date: string;
  total_marks: number;
}

interface Student {
  id: number;
  name: string;
  roll_number: string;
}

interface AddResultDialogProps {
  course: Course;
}

export function AddResultDialog({ course }: AddResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    exam_id: "",
    subject_id: "",
    marks_obtained: 0,
    total_marks: 100
  });
  const { toast } = useToast();

  // Mock data - replace with Supabase queries
  const students: Student[] = [
    { id: 1, name: "John Doe", roll_number: "RT001" },
    { id: 2, name: "Jane Smith", roll_number: "RT002" }
  ];

  const exams: Exam[] = [
    { id: "1", name: "Mid-term Examination", exam_date: "2024-08-15", total_marks: 100 },
    { id: "2", name: "Practical Assessment", exam_date: "2024-09-20", total_marks: 50 }
  ];

  const subjects: Subject[] = [
    { id: "1", name: "Anatomy & Physiology", code: "AP101" },
    { id: "2", name: "Medical Terminology", code: "MT101" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Supabase integration
    const percentage = (formData.marks_obtained / formData.total_marks) * 100;
    toast({
      title: "Result Added",
      description: `Result recorded: ${percentage.toFixed(1)}%`,
    });
    setOpen(false);
    setFormData({
      student_id: "",
      exam_id: "",
      subject_id: "",
      marks_obtained: 0,
      total_marks: 100
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Exam Result</DialogTitle>
          <DialogDescription>
            Record exam result for {course.name} course.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student_id">Student</Label>
              <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.roll_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exam_id">Exam</Label>
              <Select value={formData.exam_id} onValueChange={(value) => {
                const exam = exams.find(e => e.id === value);
                setFormData({
                  ...formData, 
                  exam_id: value,
                  total_marks: exam?.total_marks || 100
                });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} ({exam.total_marks} marks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject_id">Subject</Label>
              <Select value={formData.subject_id} onValueChange={(value) => setFormData({...formData, subject_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marks_obtained">Marks Obtained</Label>
              <Input
                id="marks_obtained"
                type="number"
                min="0"
                max={formData.total_marks}
                value={formData.marks_obtained}
                onChange={(e) => setFormData({...formData, marks_obtained: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total_marks">Total Marks</Label>
              <Input
                id="total_marks"
                type="number"
                value={formData.total_marks}
                onChange={(e) => setFormData({...formData, total_marks: parseFloat(e.target.value)})}
                disabled
              />
            </div>
            {formData.marks_obtained > 0 && formData.total_marks > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Calculated Results:</div>
                <div className="text-lg font-semibold">
                  Percentage: {((formData.marks_obtained / formData.total_marks) * 100).toFixed(1)}%
                </div>
                <div className="text-sm">
                  Grade: {
                    ((formData.marks_obtained / formData.total_marks) * 100) >= 90 ? 'A+' :
                    ((formData.marks_obtained / formData.total_marks) * 100) >= 80 ? 'A' :
                    ((formData.marks_obtained / formData.total_marks) * 100) >= 70 ? 'B+' :
                    ((formData.marks_obtained / formData.total_marks) * 100) >= 60 ? 'B' :
                    ((formData.marks_obtained / formData.total_marks) * 100) >= 50 ? 'C+' :
                    ((formData.marks_obtained / formData.total_marks) * 100) >= 40 ? 'C' : 'F'
                  }
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Add Result</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ViewResultsDialogProps {
  course: Course;
}

export function ViewResultsDialog({ course }: ViewResultsDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Mock data - replace with Supabase query
  const results: Result[] = [
    {
      id: "1",
      student_id: 1,
      exam_id: "1",
      subject_id: "1",
      marks_obtained: 85,
      total_marks: 100,
      percentage: 85,
      grade: "A",
      student_name: "John Doe",
      subject_name: "Anatomy & Physiology",
      exam_name: "Mid-term Examination"
    },
    {
      id: "2",
      student_id: 2,
      exam_id: "1",
      subject_id: "1",
      marks_obtained: 78,
      total_marks: 100,
      percentage: 78,
      grade: "B+",
      student_name: "Jane Smith",
      subject_name: "Anatomy & Physiology",
      exam_name: "Mid-term Examination"
    }
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': case 'A': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'B+': case 'B': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'C+': case 'C': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'F': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const calculateStats = () => {
    if (results.length === 0) return { average: 0, passRate: 0, highest: 0, lowest: 0 };
    
    const average = results.reduce((sum, result) => sum + result.percentage, 0) / results.length;
    const passRate = (results.filter(result => result.percentage >= 40).length / results.length) * 100;
    const highest = Math.max(...results.map(result => result.percentage));
    const lowest = Math.min(...results.map(result => result.percentage));
    
    return { average, passRate, highest, lowest };
  };

  const stats = calculateStats();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          View Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Results - {course.name}</DialogTitle>
          <DialogDescription>
            Exam results and performance analytics for {course.name} ({course.code}).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="results" className="space-y-4">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <AddResultDialog course={course} />
              </div>
            </div>

            <TabsContent value="results" className="space-y-4">
              {results.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Exam</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.student_name}</TableCell>
                          <TableCell>{result.exam_name}</TableCell>
                          <TableCell>{result.subject_name}</TableCell>
                          <TableCell>{result.marks_obtained}/{result.total_marks}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              {result.percentage.toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </TableCell>
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
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Results Available</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding exam results for this course.
                      </p>
                      <AddResultDialog course={course} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.average.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.passRate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.highest.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.lowest.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['A+', 'A', 'B+', 'B', 'C+', 'C', 'F'].map((grade) => {
                      const count = results.filter(r => r.grade === grade).length;
                      const percentage = results.length > 0 ? (count / results.length) * 100 : 0;
                      return (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getGradeColor(grade)}>{grade}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {count} student{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-sm font-medium">{percentage.toFixed(1)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
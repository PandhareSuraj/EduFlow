import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileSpreadsheet, Edit, Eye, TrendingUp, Users, Award, Download, FileText, BarChart3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Result {
  id: string;
  student_id: number;
  exam_id: string;
  subject_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage: number;
  grade: string;
  created_at: string;
  students?: { name: string; student_id: string };
  exams?: { name: string };
  subjects?: { name: string; code: string };
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
  student_id: string;
}

interface AddResultDialogProps {
  course: Course;
  onResultAdded?: () => void;
}

export function AddResultDialog({ course, onResultAdded }: AddResultDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    exam_id: "",
    subject_id: "",
    marks_obtained: 0
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const calculateGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const fetchFormData = async () => {
    setLoadingData(true);
    try {
      // Fetch students for this course
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, student_id')
        .eq('course_id', course.id)
        .eq('status', 'active')
        .order('name');

      if (studentsError) throw studentsError;

      // Fetch exams for this course
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('id, name, total_marks, exam_date')
        .eq('course_id', course.id)
        .order('name');

      if (examsError) throw examsError;

      // Fetch subjects for this course
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('course_id', course.id)
        .order('name');

      if (subjectsError) throw subjectsError;

      setStudents(studentsData || []);
      setExams(examsData || []);
      setSubjects(subjectsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load form data",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFormData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedExam = exams.find(e => e.id === formData.exam_id);
      if (!selectedExam) throw new Error("Selected exam not found");

      const percentage = (formData.marks_obtained / selectedExam.total_marks) * 100;
      const grade = calculateGrade(percentage);

      const { error } = await supabase
        .from('results')
        .insert([{
          student_id: parseInt(formData.student_id),
          exam_id: formData.exam_id,
          subject_id: formData.subject_id,
          marks_obtained: formData.marks_obtained,
          total_marks: selectedExam.total_marks,
          percentage: Math.round(percentage * 100) / 100,
          grade
        }]);

      if (error) throw error;

      toast({
        title: "Result Added",
        description: `Result recorded successfully with ${percentage.toFixed(1)}% (${grade})`,
      });
      
      setFormData({ student_id: "", exam_id: "", subject_id: "", marks_obtained: 0 });
      setOpen(false);
      onResultAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add result",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedExam = exams.find(e => e.id === formData.exam_id);
  const percentage = selectedExam ? (formData.marks_obtained / selectedExam.total_marks) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Result
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Exam Result</DialogTitle>
          <DialogDescription>
            Record exam results for students in {course.name}.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student">Student</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="exam">Exam</Label>
                <Select value={formData.exam_id} onValueChange={(value) => setFormData({...formData, exam_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} (Total: {exam.total_marks})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
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
                <Label htmlFor="marks">Marks Obtained</Label>
                <Input
                  id="marks"
                  type="number"
                  min="0"
                  max={selectedExam?.total_marks || 100}
                  value={formData.marks_obtained}
                  onChange={(e) => setFormData({...formData, marks_obtained: parseFloat(e.target.value) || 0})}
                  required
                />
                {selectedExam && (
                  <div className="text-sm text-muted-foreground">
                    Max: {selectedExam.total_marks} | Percentage: {percentage.toFixed(1)}% | Grade: {calculateGrade(percentage)}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.student_id || !formData.exam_id || !formData.subject_id}>
                {loading ? "Adding..." : "Add Result"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ViewResultsDialogProps {
  course: Course;
}

export function ViewResultsDialog({ course }: ViewResultsDialogProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Get all students for this course first
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('course_id', course.id);

      if (studentsError) throw studentsError;

      if (!studentsData || studentsData.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsData.map(s => s.id);

      // Fetch results with related data
      const { data, error } = await supabase
        .from('results')
        .select(`
          id,
          student_id,
          exam_id,
          subject_id,
          marks_obtained,
          total_marks,
          percentage,
          grade,
          created_at,
          students!inner (name, student_id),
          exams!inner (name),
          subjects!inner (name, code)
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchResults();
    }
  }, [open]);

  const handleResultAdded = () => {
    fetchResults();
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate analytics
  const totalResults = results.length;
  const averageScore = totalResults > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / totalResults : 0;
  const passRate = totalResults > 0 ? (results.filter(r => r.percentage >= 40).length / totalResults) * 100 : 0;
  const highestScore = totalResults > 0 ? Math.max(...results.map(r => r.percentage)) : 0;
  const lowestScore = totalResults > 0 ? Math.min(...results.map(r => r.percentage)) : 0;

  const gradeDistribution = results.reduce((acc, result) => {
    acc[result.grade] = (acc[result.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          View Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Results - {course.name}</DialogTitle>
          <DialogDescription>
            View and manage exam results for {course.name} ({course.code}).
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Exam Results</h4>
                <p className="text-sm text-muted-foreground">{totalResults} results recorded</p>
              </div>
              <AddResultDialog course={course} onResultAdded={handleResultAdded} />
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.students?.name}</div>
                            <div className="text-sm text-muted-foreground">{result.students?.student_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{result.exams?.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.subjects?.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{result.marks_obtained}/{result.total_marks}</div>
                            <div className="text-sm text-muted-foreground">{result.percentage}%</div>
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
                              <FileText className="h-4 w-4" />
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
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Results Recorded</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding exam results for students.
                    </p>
                    <AddResultDialog course={course} onResultAdded={handleResultAdded} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{passRate.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{highestScore.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{lowestScore.toFixed(1)}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of grades across all results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map((grade) => (
                    <div key={grade} className="text-center">
                      <Badge className={getGradeColor(grade)}>
                        {grade}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{gradeDistribution[grade] || 0}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalResults > 0 ? ((gradeDistribution[grade] || 0) / totalResults * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
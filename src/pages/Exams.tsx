import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, FileText, Award, Download } from "lucide-react";

const exams = [
  {
    id: "EX001",
    name: "DMLT Semester 1 Final",
    course: "DMLT",
    batch: "Batch A", 
    date: "2024-02-15",
    time: "10:00 AM",
    duration: "3 hours",
    totalMarks: 100,
    passingMarks: 40,
    status: "Scheduled",
    enrolledStudents: 25
  },
  {
    id: "EX002",
    name: "Radiology Mid-Term",
    course: "Radiology Technician",
    batch: "Batch B",
    date: "2024-02-20",
    time: "02:00 PM", 
    duration: "2 hours",
    totalMarks: 75,
    passingMarks: 30,
    status: "Scheduled",
    enrolledStudents: 20
  },
  {
    id: "EX003",
    name: "PGDMLT Practical Exam",
    course: "PGDMLT",
    batch: "Batch C",
    date: "2024-01-30",
    time: "09:00 AM",
    duration: "4 hours", 
    totalMarks: 50,
    passingMarks: 25,
    status: "Completed",
    enrolledStudents: 15
  }
];

const results = [
  {
    examId: "EX003",
    studentId: "ST001",
    studentName: "Aarti Sharma",
    course: "PGDMLT",
    marksObtained: 42,
    totalMarks: 50,
    percentage: 84,
    grade: "A",
    status: "Pass"
  },
  {
    examId: "EX003", 
    studentId: "ST002",
    studentName: "Rohit Patil",
    course: "PGDMLT",
    marksObtained: 38,
    totalMarks: 50,
    percentage: 76,
    grade: "B",
    status: "Pass"
  },
  {
    examId: "EX003",
    studentId: "ST003", 
    studentName: "Priya Kumar",
    course: "PGDMLT",
    marksObtained: 22,
    totalMarks: 50,
    percentage: 44,
    grade: "D",
    status: "Fail"
  }
];

export default function Exams() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exams & Results</h1>
          <p className="text-muted-foreground">Manage examinations and student results</p>
        </div>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {exams.filter(e => e.status === 'Scheduled').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {exams.filter(e => e.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {Math.round((results.filter(r => r.status === 'Pass').length / results.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="exams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Exams */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search exams..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examination Schedule</CardTitle>
              <CardDescription>Manage all scheduled and completed examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam ID</TableHead>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.id}</TableCell>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>{exam.course}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{exam.date}</div>
                          <div className="text-sm text-muted-foreground">{exam.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{exam.duration}</TableCell>
                      <TableCell>{exam.totalMarks}</TableCell>
                      <TableCell>{exam.enrolledStudents}</TableCell>
                      <TableCell>
                        <Badge variant={exam.status === 'Completed' ? 'default' : 'secondary'}>
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          {exam.status === 'Completed' && (
                            <Button size="sm">Results</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search results..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Results</CardTitle>
              <CardDescription>Student performance and results summary</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.studentId}</TableCell>
                      <TableCell>{result.studentName}</TableCell>
                      <TableCell>{result.course}</TableCell>
                      <TableCell>{result.marksObtained}</TableCell>
                      <TableCell>{result.totalMarks}</TableCell>
                      <TableCell>{result.percentage}%</TableCell>
                      <TableCell>
                        <Badge variant="outline">{result.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={result.status === 'Pass' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Marksheet</Button>
                          {result.status === 'Pass' && (
                            <Button size="sm">Certificate</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Certificates & Documents</CardTitle>
              <CardDescription>Generate and manage student certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Award className="h-6 w-6 mb-2" />
                  Course Completion Certificate
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  Marksheet
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Transcript
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Award className="h-6 w-6 mb-2" />
                  Merit Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
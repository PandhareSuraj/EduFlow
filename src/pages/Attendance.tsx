import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Calendar, Users, CheckCircle, XCircle } from "lucide-react";

const studentAttendance = [
  {
    id: "ST001",
    name: "Aarti Sharma",
    course: "DMLT",
    batch: "Batch A",
    totalClasses: 45,
    present: 42,
    absent: 3,
    percentage: 93.3,
    lastAttended: "2024-01-22"
  },
  {
    id: "ST002", 
    name: "Rohit Patil",
    course: "Radiology Technician",
    batch: "Batch B",
    totalClasses: 40,
    present: 35,
    absent: 5,
    percentage: 87.5,
    lastAttended: "2024-01-20"
  },
  {
    id: "ST003",
    name: "Priya Kumar", 
    course: "PGDMLT",
    batch: "Batch C",
    totalClasses: 38,
    present: 32,
    absent: 6,
    percentage: 84.2,
    lastAttended: "2024-01-22"
  }
];

const todayAttendance = [
  {
    batch: "DMLT - Batch A",
    subject: "Clinical Biochemistry",
    time: "09:00 AM",
    faculty: "Dr. Rajesh Sharma",
    totalStudents: 25,
    present: 23,
    absent: 2,
    status: "Completed"
  },
  {
    batch: "RT - Batch B", 
    subject: "Medical Imaging",
    time: "11:00 AM",
    faculty: "Prof. Priya Patil",
    totalStudents: 20,
    present: 18,
    absent: 2,
    status: "Completed"
  },
  {
    batch: "PGDMLT - Batch C",
    subject: "Microbiology",
    time: "02:00 PM", 
    faculty: "Dr. Amit Kumar",
    totalStudents: 15,
    present: 0,
    absent: 0,
    status: "Pending"
  }
];

export default function Attendance() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">Track student and faculty attendance</p>
        </div>
        <Button className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">88.3%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">41</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">4</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Attendance</TabsTrigger>
          <TabsTrigger value="students">Student Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Today's Attendance */}
        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Class Schedule</CardTitle>
              <CardDescription>Mark attendance for scheduled classes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{record.batch}</TableCell>
                      <TableCell>{record.subject}</TableCell>
                      <TableCell>{record.time}</TableCell>
                      <TableCell>{record.faculty}</TableCell>
                      <TableCell>{record.totalStudents}</TableCell>
                      <TableCell className="text-green-600">{record.present}</TableCell>
                      <TableCell className="text-red-600">{record.absent}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'Completed' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant={record.status === 'Completed' ? 'outline' : 'default'} 
                          size="sm"
                        >
                          {record.status === 'Completed' ? 'View' : 'Mark'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Attendance */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search students..." className="pl-10" />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Summary</CardTitle>
              <CardDescription>Overall attendance records for all students</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Total Classes</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAttendance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>{student.batch}</TableCell>
                      <TableCell>{student.totalClasses}</TableCell>
                      <TableCell className="text-green-600">{student.present}</TableCell>
                      <TableCell className="text-red-600">{student.absent}</TableCell>
                      <TableCell>
                        <div className={`font-medium ${
                          student.percentage >= 90 ? 'text-green-600' :
                          student.percentage >= 75 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {student.percentage}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>Generate and download attendance reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Daily Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Student Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Course-wise Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <XCircle className="h-6 w-6 mb-2" />
                  Absentee Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useAttendanceReports, type AttendanceReportFilters } from "@/hooks/useAttendanceReports";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useCourses } from "@/hooks/useCourses";

export const StudentAttendanceReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date()
  });
  
  const { courses } = useCourses();
  const { loading, studentData, fetchStudentReport } = useAttendanceReports();

  useEffect(() => {
    const filters: AttendanceReportFilters = {
      reportType: 'student',
      courseId: selectedCourse,
      dateRange
    };
    fetchStudentReport(filters);
  }, [selectedCourse, dateRange, fetchStudentReport]);

  const filteredStudents = studentData?.students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: 'default' as const, text: 'Excellent' };
    if (percentage >= 75) return { variant: 'secondary' as const, text: 'Good' };
    if (percentage >= 60) return { variant: 'outline' as const, text: 'Warning' };
    return { variant: 'destructive' as const, text: 'Critical' };
  };

  // Sample trend data for the top student
  const sampleTrendData = [
    { month: 'Jan', percentage: 95 },
    { month: 'Feb', percentage: 92 },
    { month: 'Mar', percentage: 96 },
    { month: 'Apr', percentage: 89 },
    { month: 'May', percentage: 94 },
    { month: 'Jun', percentage: 91 }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Attendance Filters
          </CardTitle>
          <CardDescription>
            Search and filter students to view detailed attendance analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search by student name, ID, or course..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 sm:space-y-0 sm:w-[240px]">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading student attendance report...</p>
            </div>
          </CardContent>
        </Card>
      ) : !studentData || studentData.students.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Student Data Found</h3>
              <p className="text-muted-foreground">
                No student attendance records found for the selected filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studentData.students.length}</div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studentData.classAverage}%</div>
                    <div className="text-sm text-muted-foreground">Class Average</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {studentData.students.filter(s => s.attendance_percentage >= 75).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Above 75%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{studentData.riskStudents}</div>
                    <div className="text-sm text-muted-foreground">At-Risk Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Trends</CardTitle>
              <CardDescription>
                Class attendance percentage over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Distribution</CardTitle>
              <CardDescription>
                Number of students in each attendance range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { range: '90-100%', count: studentData.students.filter(s => s.attendance_percentage >= 90).length },
                  { range: '75-89%', count: studentData.students.filter(s => s.attendance_percentage >= 75 && s.attendance_percentage < 90).length },
                  { range: '60-74%', count: studentData.students.filter(s => s.attendance_percentage >= 60 && s.attendance_percentage < 75).length },
                  { range: '0-59%', count: studentData.students.filter(s => s.attendance_percentage < 60).length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Student Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Details</CardTitle>
              <CardDescription>
                Individual student performance and attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'No students found matching your search' : 'No student data available'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredStudents.map((student) => (
                      <Card key={student.student_id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{student.student_name}</div>
                              <div className="text-sm text-muted-foreground">{student.student_number}</div>
                              <div className="text-sm text-muted-foreground">{student.course_name}</div>
                            </div>
                            <Badge {...getAttendanceBadge(student.attendance_percentage)}>
                              {getAttendanceBadge(student.attendance_percentage).text}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Sessions</div>
                              <div className="font-medium">{student.total_sessions}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Present</div>
                              <div className="text-green-600 font-medium">{student.present_count}</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className={`text-lg font-bold ${getAttendanceColor(student.attendance_percentage)}`}>
                              {student.attendance_percentage}%
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Total Sessions</TableHead>
                          <TableHead>Present</TableHead>
                          <TableHead>Absent</TableHead>
                          <TableHead>Late</TableHead>
                          <TableHead>Attendance %</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell className="font-medium">{student.student_number}</TableCell>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell>{student.course_name}</TableCell>
                            <TableCell>{student.total_sessions}</TableCell>
                            <TableCell className="text-green-600 font-medium">{student.present_count}</TableCell>
                            <TableCell className="text-red-600 font-medium">{student.absent_count}</TableCell>
                            <TableCell className="text-orange-600 font-medium">{student.late_count}</TableCell>
                            <TableCell>
                              <div className={`font-medium ${getAttendanceColor(student.attendance_percentage)}`}>
                                {student.attendance_percentage}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge {...getAttendanceBadge(student.attendance_percentage)}>
                                {getAttendanceBadge(student.attendance_percentage).text}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
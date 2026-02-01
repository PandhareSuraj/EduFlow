import { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Calendar, Users, CheckCircle, XCircle, RefreshCw, Eye, Plus } from "lucide-react";
import { AttendanceMarkingDialog } from "@/components/attendance/AttendanceMarkingDialog";
import { SessionDetailsDialog } from "@/components/attendance/SessionDetailsDialog";
import { StudentDetailsDialog } from "@/components/attendance/StudentDetailsDialog";
import { AttendanceReportsContainer } from "@/components/attendance/AttendanceReportsContainer";
import { VideoTutorialButton } from "@/components/videos/VideoTutorialButton";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";
import { ExportButton, ExportColumn } from "@/components/exports";
import { format } from "date-fns";

export default function Attendance() {
  usePageTitle("Attendance");
  
  const { stats, todaySessions, studentSummaries, loading, refreshData } = useAttendanceData();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter student summaries based on search
  const filteredStudents = studentSummaries.filter(student => 
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  // Export columns for student attendance
  const exportColumns: ExportColumn[] = useMemo(() => [
    { key: "student_number", label: "Student ID" },
    { key: "student_name", label: "Student Name" },
    { key: "course_name", label: "Course" },
    { key: "total_sessions", label: "Total Sessions" },
    { key: "present_count", label: "Present" },
    { key: "absent_count", label: "Absent" },
    { key: "late_count", label: "Late" },
    { 
      key: "attendance_percentage", 
      label: "Attendance %",
      formatter: (value) => `${value}%`
    }
  ], []);

  const exportSummary = useMemo(() => ({
    totalRecords: filteredStudents.length,
    additionalInfo: {
      "Average Attendance": `${(filteredStudents.reduce((sum, s) => sum + s.attendance_percentage, 0) / filteredStudents.length || 0).toFixed(1)}%`,
      "Low Attendance (<75%)": filteredStudents.filter(s => s.attendance_percentage < 75).length,
      "Good Attendance (≥90%)": filteredStudents.filter(s => s.attendance_percentage >= 90).length,
    }
  }), [filteredStudents]);

  const exportFilters = useMemo(() => ({
    "Search Term": searchTerm || "None",
  }), [searchTerm]);
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground">Streamlined daily attendance tracking</p>
        </div>
        <div className="flex gap-2">
          <VideoTutorialButton pageIdentifier="attendance" pageName="Attendance" />
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <PermissionWrapper permission="ATTENDANCE_MARK">
            <AttendanceMarkingDialog 
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              }
            />
          </PermissionWrapper>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.todayClasses}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {loading ? '...' : `${stats.averageAttendance}%`}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : stats.presentToday}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : stats.absentToday}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Classes</TabsTrigger>
          <TabsTrigger value="students">Student Records</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Today's Attendance */}
        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Sessions</CardTitle>
              <CardDescription>Current day attendance status - {format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading today's sessions...</div>
                </div>
              ) : todaySessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No classes scheduled for today</div>
                  <p className="text-sm text-muted-foreground mt-2">Use "Mark Attendance" to record a new session</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile-friendly cards for small screens */}
                  <div className="md:hidden space-y-4">
                    {todaySessions.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{session.class_name}</div>
                              <div className="text-sm text-muted-foreground">{session.subject_name}</div>
                              <div className="text-sm text-muted-foreground">{session.faculty_name}</div>
                            </div>
                            <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                              {session.status === 'completed' ? 'Completed' : 'Scheduled'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Time</div>
                              <div>{formatTime(session.start_time)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Present</div>
                              <div className="text-green-600 font-medium">{session.present_count}/{session.total_students}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">%</div>
                              <div className="font-medium">{session.attendance_percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          
                          <SessionDetailsDialog 
                            sessionId={session.id} 
                            sessionName={session.class_name}
                            trigger={
                              <Button size="sm" variant="outline" className="w-full">
                                <Eye className="h-3 w-3 mr-2" />
                                View Details
                              </Button>
                            }
                          />
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Table for larger screens */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Faculty</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Present</TableHead>
                          <TableHead>Absent</TableHead>
                          <TableHead>Attendance %</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todaySessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">{session.class_name}</TableCell>
                            <TableCell>{session.subject_name}</TableCell>
                            <TableCell>{formatTime(session.start_time)}</TableCell>
                            <TableCell>{session.faculty_name}</TableCell>
                            <TableCell>{session.total_students}</TableCell>
                            <TableCell className="text-green-600 font-medium">{session.present_count}</TableCell>
                            <TableCell className="text-red-600 font-medium">{session.absent_count}</TableCell>
                            <TableCell className="font-medium">{session.attendance_percentage.toFixed(1)}%</TableCell>
                            <TableCell>
                              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                                {session.status === 'completed' ? 'Completed' : 'Scheduled'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <SessionDetailsDialog 
                                sessionId={session.id} 
                                sessionName={session.class_name}
                              />
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
        </TabsContent>

        {/* Student Attendance */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search students, ID, or course..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ExportButton
                  data={filteredStudents}
                  columns={exportColumns}
                  filename="attendance_records"
                  title="Student Attendance Report"
                  formats={["excel", "pdf", "csv"]}
                  filters={exportFilters}
                  summary={exportSummary}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Attendance Summary</CardTitle>
              <CardDescription>Overall attendance records for all students</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading student records...</div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? 'No students found matching your search' : 'No attendance records found'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile cards */}
                  <div className="md:hidden space-y-4">
                    {filteredStudents.map((student) => (
                      <Card key={student.student_id} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium">{student.student_name}</div>
                            <div className="text-sm text-muted-foreground">{student.student_number}</div>
                            <div className="text-sm text-muted-foreground">{student.course_name}</div>
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
                            <div className={`text-lg font-bold ${
                              student.attendance_percentage >= 90 ? 'text-green-600' :
                              student.attendance_percentage >= 75 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {student.attendance_percentage}%
                            </div>
                            <StudentDetailsDialog 
                              studentId={student.student_id}
                              studentName={student.student_name}
                              trigger={
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              }
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop table */}
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
                          <TableHead>Actions</TableHead>
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
                              <div className={`font-medium ${
                                student.attendance_percentage >= 90 ? 'text-green-600' :
                                student.attendance_percentage >= 75 ? 'text-orange-600' : 'text-red-600'
                              }`}>
                                {student.attendance_percentage}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <StudentDetailsDialog 
                                studentId={student.student_id}
                                studentName={student.student_name}
                              />
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
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <PermissionWrapper permission="REPORTS_VIEW">
            <AttendanceReportsContainer />
          </PermissionWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Clock, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAttendanceReports, type AttendanceReportFilters } from "@/hooks/useAttendanceReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCourses } from "@/hooks/useCourses";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const DailyAttendanceReport = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const { courses } = useCourses();
  const { loading, dailyData, fetchDailyReport } = useAttendanceReports();

  useEffect(() => {
    const filters: AttendanceReportFilters = {
      reportType: 'daily',
      courseId: selectedCourse,
      dateRange: {
        from: selectedDate,
        to: selectedDate
      }
    };
    fetchDailyReport(filters);
  }, [selectedDate, selectedCourse, fetchDailyReport]);

  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const attendanceDistribution = dailyData?.sessions.map(session => ({
    name: session.class_name,
    present: session.present_count,
    absent: session.absent_count,
    total: session.total_students
  })) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Attendance Filters
          </CardTitle>
          <CardDescription>
            Select date and course to view detailed session-wise attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course Filter</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-[240px]">
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
              <p className="text-muted-foreground">Loading daily attendance report...</p>
            </div>
          </CardContent>
        </Card>
      ) : !dailyData || dailyData.sessions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
              <p className="text-muted-foreground">
                No attendance sessions were found for {format(selectedDate, "MMMM d, yyyy")}
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
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{dailyData.totalSessions}</div>
                    <div className="text-sm text-muted-foreground">Total Sessions</div>
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
                    <div className="text-2xl font-bold">{dailyData.overallAttendance.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Overall Attendance</div>
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
                      {dailyData.sessions.reduce((sum, s) => sum + s.present_count, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Present</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {dailyData.sessions.reduce((sum, s) => sum + s.absent_count, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Absent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hourly Trends Chart */}
          {dailyData.hourlyStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hourly Attendance Trends</CardTitle>
                <CardDescription>
                  Session distribution and average attendance by hour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData.hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions" />
                    <Bar dataKey="averageAttendance" fill="hsl(var(--secondary))" name="Avg Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Attendance Distribution */}
          {attendanceDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution by Session</CardTitle>
                <CardDescription>
                  Present vs Absent breakdown for each session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Present', 
                          value: dailyData.sessions.reduce((sum, s) => sum + s.present_count, 0),
                          fill: 'hsl(var(--primary))'
                        },
                        { 
                          name: 'Absent', 
                          value: dailyData.sessions.reduce((sum, s) => sum + s.absent_count, 0),
                          fill: 'hsl(var(--destructive))'
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Detailed Sessions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>
                Complete breakdown of all sessions for {format(selectedDate, "MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {dailyData.sessions.map((session) => (
                    <Card key={session.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{session.class_name}</div>
                            <div className="text-sm text-muted-foreground">{session.subject_name}</div>
                            <div className="text-sm text-muted-foreground">{session.faculty_name}</div>
                          </div>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
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
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Attendance %</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyData.sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.class_name}</TableCell>
                          <TableCell>{session.subject_name}</TableCell>
                          <TableCell>{session.faculty_name}</TableCell>
                          <TableCell>{formatTime(session.start_time)}</TableCell>
                          <TableCell>{session.total_students}</TableCell>
                          <TableCell className="text-green-600 font-medium">{session.present_count}</TableCell>
                          <TableCell className="text-red-600 font-medium">{session.absent_count}</TableCell>
                          <TableCell className="font-medium">{session.attendance_percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
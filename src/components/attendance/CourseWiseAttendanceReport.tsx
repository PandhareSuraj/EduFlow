import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, TrendingUp, Users, GraduationCap } from "lucide-react";
import { useAttendanceReports, type AttendanceReportFilters } from "@/hooks/useAttendanceReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useCourses } from "@/hooks/useCourses";

export const CourseWiseAttendanceReport = () => {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    to: new Date()
  });
  
  const { courses } = useCourses();
  const { loading, courseData, fetchCourseReport } = useAttendanceReports();

  useEffect(() => {
    const filters: AttendanceReportFilters = {
      reportType: 'course',
      courseId: selectedCourse,
      dateRange
    };
    fetchCourseReport(filters);
  }, [selectedCourse, dateRange.from, dateRange.to]); // Removed fetchCourseReport from deps as it's now memoized

  // Remove the mock data since we're using real data from the hook

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: 'default' as const, text: 'Excellent' };
    if (percentage >= 80) return { variant: 'secondary' as const, text: 'Good' };
    if (percentage >= 70) return { variant: 'outline' as const, text: 'Average' };
    return { variant: 'destructive' as const, text: 'Needs Improvement' };
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course-wise Analysis Filters
          </CardTitle>
          <CardDescription>
            Analyze attendance performance across courses and subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 sm:w-[240px]">
              <label className="text-sm font-medium">Course Filter</label>
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
              <p className="text-muted-foreground">Loading course-wise attendance report...</p>
            </div>
          </CardContent>
        </Card>
      ) : !courseData || courseData.courses.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Course Data Found</h3>
              <p className="text-muted-foreground">
                No course attendance records found for the selected filters
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
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{courseData.courses.length}</div>
                    <div className="text-sm text-muted-foreground">Active Courses</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {courseData.courses.reduce((sum, course) => sum + course.total_students, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {courseData.courses.reduce((sum, course) => sum + course.total_sessions, 0)}
                    </div>
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
                    <div className="text-2xl font-bold">
                      {courseData.courses.length > 0 
                        ? (courseData.courses.reduce((sum, course) => sum + course.average_attendance, 0) / courseData.courses.length).toFixed(1)
                        : '0.0'}%
                    </div>
                    <div className="text-sm text-muted-foreground">Average Attendance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Course Attendance Comparison</CardTitle>
              <CardDescription>
                Average attendance percentage by course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseData.courses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Attendance']} />
                  <Bar dataKey="average_attendance" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Trends</CardTitle>
              <CardDescription>
                Course attendance trends over the past 4 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={courseData.trends.length > 0 ? courseData.trends : [
                  { date: 'No data', courses: {} }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="courses.DMLT" stroke="hsl(var(--primary))" name="DMLT" />
                  <Line type="monotone" dataKey="courses.DRT" stroke="hsl(var(--secondary))" name="DRT" />
                  <Line type="monotone" dataKey="courses.DOTT" stroke="hsl(var(--accent))" name="DOTT" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Course Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Course Analysis</CardTitle>
              <CardDescription>
                Comprehensive breakdown of each course's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {courseData.courses.map((course) => (
                  <Card key={course.course_id} className="p-4">
                    <div className="space-y-4">
                      {/* Course Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{course.course_name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {course.total_students} students • {course.total_sessions} sessions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getAttendanceColor(course.average_attendance)}`}>
                            {course.average_attendance.toFixed(1)}%
                          </div>
                          <Badge {...getPerformanceBadge(course.average_attendance)}>
                            {getPerformanceBadge(course.average_attendance).text}
                          </Badge>
                        </div>
                      </div>

                      {/* Subject-wise Breakdown */}
                      <div>
                        <h4 className="font-medium mb-2">Subject-wise Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {course.subjects.map((subject, index) => (
                            <div key={index} className="p-3 bg-muted/30 rounded-lg">
                              <div className="font-medium text-sm">{subject.subject_name}</div>
                              <div className="text-xs text-muted-foreground">{subject.sessions} sessions</div>
                              <div className={`text-lg font-bold ${getAttendanceColor(subject.attendance_percentage)}`}>
                                {subject.attendance_percentage}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Faculty Performance */}
                      <div>
                        <h4 className="font-medium mb-2">Faculty Performance</h4>
                        <div className="space-y-2">
                          {course.faculty_performance.map((faculty, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                              <div>
                                <div className="font-medium text-sm">{faculty.faculty_name}</div>
                                <div className="text-xs text-muted-foreground">{faculty.sessions} sessions</div>
                              </div>
                              <div className={`font-bold ${getAttendanceColor(faculty.average_attendance)}`}>
                                {faculty.average_attendance}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Summary</CardTitle>
              <CardDescription>
                Tabular overview of all course metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {courseData.courses.map((course) => (
                    <Card key={course.course_id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{course.course_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.total_students} students
                            </div>
                          </div>
                          <Badge {...getPerformanceBadge(course.average_attendance)}>
                            {getPerformanceBadge(course.average_attendance).text}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Sessions</div>
                            <div className="font-medium">{course.total_sessions}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Attendance</div>
                            <div className={`font-bold ${getAttendanceColor(course.average_attendance)}`}>
                              {course.average_attendance.toFixed(1)}%
                            </div>
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
                        <TableHead>Course Name</TableHead>
                        <TableHead>Total Students</TableHead>
                        <TableHead>Total Sessions</TableHead>
                        <TableHead>Average Attendance</TableHead>
                        <TableHead>Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courseData.courses.map((course) => (
                        <TableRow key={course.course_id}>
                          <TableCell className="font-medium">{course.course_name}</TableCell>
                          <TableCell>{course.total_students}</TableCell>
                          <TableCell>{course.total_sessions}</TableCell>
                          <TableCell>
                            <div className={`font-medium ${getAttendanceColor(course.average_attendance)}`}>
                              {course.average_attendance.toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge {...getPerformanceBadge(course.average_attendance)}>
                              {getPerformanceBadge(course.average_attendance).text}
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
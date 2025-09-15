import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Search, Bell, Mail, Phone, Calendar } from "lucide-react";
import { useAttendanceReports } from "@/hooks/useAttendanceReports";
import { useCourses } from "@/hooks/useCourses";
import { format } from "date-fns";

export const LowAttendanceAlert = () => {
  const [threshold, setThreshold] = useState([75]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [riskLevel, setRiskLevel] = useState<string>('all');
  
  const { courses } = useCourses();
  const { loading, lowAttendanceData, fetchLowAttendanceAlert } = useAttendanceReports();

  useEffect(() => {
    fetchLowAttendanceAlert(threshold[0]);
  }, [threshold]); // Removed fetchLowAttendanceAlert from deps as it's now memoized

  const filteredStudents = lowAttendanceData?.students.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.student_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course_name.toLowerCase().includes(selectedCourse);
    const matchesRisk = riskLevel === 'all' || student.risk_level === riskLevel;
    
    return matchesSearch && matchesCourse && matchesRisk;
  }) || [];

  const getRiskColor = (riskLevel: 'critical' | 'warning') => {
    return riskLevel === 'critical' ? 'text-red-600' : 'text-orange-600';
  };

  const getRiskBadge = (riskLevel: 'critical' | 'warning') => {
    return riskLevel === 'critical' 
      ? { variant: 'destructive' as const, text: 'Critical Risk' }
      : { variant: 'secondary' as const, text: 'Warning' };
  };

  const formatLastPresent = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const handleNotifyStudent = (studentId: number, method: 'email' | 'sms') => {
    // In real implementation, this would trigger notification
    console.log(`Notifying student ${studentId} via ${method}`);
  };

  return (
    <div className="space-y-6">
      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Low Attendance Alert Configuration
          </CardTitle>
          <CardDescription>
            Configure thresholds and identify at-risk students requiring intervention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Threshold Setting */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Attendance Threshold: {threshold[0]}%
              </label>
              <Slider
                value={threshold}
                onValueChange={setThreshold}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Students with attendance below {threshold[0]}% will be marked as at-risk
              </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Students</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Search by name or ID..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Filter</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.name.toLowerCase()}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Risk Level</label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="critical">Critical (&lt;60%)</SelectItem>
                    <SelectItem value="warning">Warning (60-{threshold[0]}%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading at-risk students...</p>
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
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {lowAttendanceData?.summary.critical || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Critical Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {lowAttendanceData?.summary.warning || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Warning</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {(lowAttendanceData?.summary.critical || 0) + (lowAttendanceData?.summary.warning || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total At-Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{threshold[0]}%</div>
                    <div className="text-sm text-muted-foreground">Alert Threshold</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Students</CardTitle>
              <CardDescription>
                Students requiring immediate attention and intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!lowAttendanceData || filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-green-600">Great News!</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCourse !== 'all' || riskLevel !== 'all' 
                      ? 'No students match your search criteria' 
                      : `No students have attendance below ${threshold[0]}%`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredStudents.map((student) => (
                      <Card key={student.student_id} className="p-4 border-l-4 border-l-red-500">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{student.student_name}</div>
                              <div className="text-sm text-muted-foreground">{student.student_number}</div>
                              <div className="text-sm text-muted-foreground">{student.course_name}</div>
                            </div>
                            <Badge {...getRiskBadge(student.risk_level)}>
                              {getRiskBadge(student.risk_level).text}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Attendance</div>
                              <div className={`font-bold text-lg ${getRiskColor(student.risk_level)}`}>
                                {student.attendance_percentage}%
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Present/Total</div>
                              <div className="font-medium">
                                {student.present_count}/{student.total_sessions}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <div className="text-muted-foreground">Last Present</div>
                            <div className="font-medium">{formatLastPresent(student.last_present)}</div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleNotifyStudent(student.student_id, 'email')}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleNotifyStudent(student.student_id, 'sms')}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              SMS
                            </Button>
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
                          <TableHead>Student</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Attendance %</TableHead>
                          <TableHead>Present/Total</TableHead>
                          <TableHead>Last Present</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.student_id} className="border-l-4 border-l-red-500">
                            <TableCell>
                              <div>
                                <div className="font-medium">{student.student_name}</div>
                                <div className="text-sm text-muted-foreground">{student.student_number}</div>
                              </div>
                            </TableCell>
                            <TableCell>{student.course_name}</TableCell>
                            <TableCell>
                              <div className={`font-bold text-lg ${getRiskColor(student.risk_level)}`}>
                                {student.attendance_percentage}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {student.present_count}/{student.total_sessions}
                              </div>
                            </TableCell>
                            <TableCell>{formatLastPresent(student.last_present)}</TableCell>
                            <TableCell>
                              <Badge {...getRiskBadge(student.risk_level)}>
                                {getRiskBadge(student.risk_level).text}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleNotifyStudent(student.student_id, 'email')}
                                >
                                  <Mail className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleNotifyStudent(student.student_id, 'sms')}
                                >
                                  <Phone className="h-3 w-3" />
                                </Button>
                              </div>
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

          {/* Intervention Actions */}
          {filteredStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Intervention Actions</CardTitle>
                <CardDescription>
                  Take action for multiple at-risk students simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email All Parents
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    SMS Alert All
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Counseling
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
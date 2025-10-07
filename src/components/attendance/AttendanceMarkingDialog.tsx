import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useCurrentFaculty } from "@/hooks/useCurrentFaculty";
import { useClassNames } from "@/hooks/useClassNames";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CheckCircle, XCircle, Clock, Users, Info, CalendarIcon, AlertTriangle, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
interface Student {
  id: number;
  name: string;
  student_id: string;
  email: string;
  class?: string;
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
interface Faculty {
  id: string;
  name: string;
}
interface AttendanceRecord {
  student_id: number;
  status: 'present' | 'absent' | 'late';
}
interface AttendanceMarkingDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function AttendanceMarkingDialog({
  trigger,
  open: controlledOpen,
  onOpenChange
}: AttendanceMarkingDialogProps = {}) {
  const {
    toast
  } = useToast();
  const {
    currentFaculty,
    loading: facultyLoading
  } = useCurrentFaculty();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const {
    classNames
  } = useClassNames();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form data
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Duplicate detection
  const [duplicateWarning, setDuplicateWarning] = useState<{
    show: boolean;
    message: string;
    existingSession?: any;
  }>({
    show: false,
    message: ""
  });
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);

  // Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchCourses();
      fetchSubjects();
      fetchFaculty();
    }
  }, [open]);

  // Auto-select faculty if current user is faculty
  useEffect(() => {
    if (currentFaculty && !facultyLoading && open) {
      setSelectedFaculty(currentFaculty.id);
    }
  }, [currentFaculty, facultyLoading, open]);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
    }
  }, [selectedCourse]);

  // Check for duplicate attendance when key fields change
  useEffect(() => {
    if (selectedCourse && selectedSubject && className && selectedDate) {
      checkDuplicateAttendance();
    } else {
      setDuplicateWarning({
        show: false,
        message: ""
      });
      setShowDuplicateAlert(false);
    }
  }, [selectedCourse, selectedSubject, className, selectedDate]);
  const fetchCourses = async () => {
    try {
      const {
        data: collegeId
      } = await supabase.rpc('get_user_college');
      let query = supabase.from('courses').select('id, name, code').eq('status', 'active').order('name');
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const fetchSubjects = async () => {
    try {
      const {
        data: collegeId
      } = await supabase.rpc('get_user_college');
      let query = supabase.from('subjects').select('id, name, code').order('name');
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };
  const fetchFaculty = async () => {
    try {
      const {
        data: collegeId
      } = await supabase.rpc('get_user_college');
      let query = supabase.from('faculty').select('id, name').eq('status', 'active').order('name');
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setFaculty(data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const {
        data: collegeId
      } = await supabase.rpc('get_user_college');
      let query = supabase.from('students').select('id, name, student_id, email, class').eq('course_id', parseInt(selectedCourse)).eq('status', 'active').order('name');
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setStudents(data || []);

      // Initialize attendance records as present for all students
      const initialRecords: AttendanceRecord[] = (data || []).map(student => ({
        student_id: student.id,
        status: 'present' as const
      }));
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const updateAttendanceStatus = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => prev.map(record => record.student_id === studentId ? {
      ...record,
      status
    } : record));
  };
  const markAllPresent = () => {
    setAttendanceRecords(prev => prev.map(record => ({
      ...record,
      status: 'present' as const
    })));
  };
  const markAllAbsent = () => {
    setAttendanceRecords(prev => prev.map(record => ({
      ...record,
      status: 'absent' as const
    })));
  };
  const checkDuplicateAttendance = async () => {
    try {
      const {
        data: collegeId
      } = await supabase.rpc('get_user_college');

      // Normalize date to start-of-day to avoid timezone issues
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      const dateString = format(normalizedDate, 'yyyy-MM-dd');
      const {
        data: existingSessions,
        error
      } = await supabase.from('attendance_sessions').select(`
          id,
          session_date,
          start_time,
          attendance_percentage,
          faculty:faculty_id (name),
          subject:subject_id (name),
          course:course_id (name)
        `).eq('course_id', parseInt(selectedCourse)).eq('subject_id', selectedSubject).eq('class_name', className).eq('session_date', dateString).eq('college_id', collegeId);
      if (error) throw error;
      if (existingSessions && existingSessions.length > 0) {
        const session = existingSessions[0];
        const courseName = courses.find(c => c.id.toString() === selectedCourse)?.name || 'Course';
        const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Subject';
        setDuplicateWarning({
          show: true,
          message: `Attendance already marked for ${courseName} - ${subjectName} - ${className} on ${format(selectedDate, 'dd MMM yyyy')}`,
          existingSession: session
        });
        setShowDuplicateAlert(true);
      } else {
        setDuplicateWarning({
          show: false,
          message: ""
        });
        setShowDuplicateAlert(false);
      }
    } catch (error) {
      console.error('Error checking duplicate attendance:', error);
    }
  };
  const saveAttendance = async () => {
    if (!selectedCourse || !selectedSubject || !selectedFaculty) {
      toast({
        title: "Missing Information",
        description: "Please select course, subject, and faculty",
        variant: "destructive"
      });
      return;
    }

    // Show warning if duplicate exists and user hasn't acknowledged
    if (duplicateWarning.show && showDuplicateAlert) {
      toast({
        title: "Duplicate Entry Warning",
        description: "Please review the duplicate warning and choose an action",
        variant: "destructive"
      });
      return;
    }
    try {
      setSaving(true);
      const {
        data: collegeId
      } = await supabase.rpc('get_user_college');

      // Get current user for marked_by field
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();

      // Normalize date to start-of-day for consistent storage
      const sessionDate = new Date(selectedDate);
      sessionDate.setHours(0, 0, 0, 0);
      const sessionDateString = format(sessionDate, 'yyyy-MM-dd');

      // Create attendance session with selected date
      const {
        data: session,
        error: sessionError
      } = await supabase.from('attendance_sessions').insert({
        course_id: parseInt(selectedCourse),
        subject_id: selectedSubject,
        faculty_id: selectedFaculty,
        class_name: className || null,
        session_date: sessionDateString,
        start_time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        status: 'completed',
        college_id: collegeId
      }).select().single();
      if (sessionError) throw sessionError;

      // Insert attendance records
      const recordsToInsert = attendanceRecords.map(record => ({
        session_id: session.id,
        student_id: record.student_id,
        status: record.status,
        marked_by: user?.id,
        college_id: collegeId
      }));
      const {
        error: recordsError
      } = await supabase.from('attendance_records').insert(recordsToInsert);
      if (recordsError) throw recordsError;
      const isBackdated = format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');
      toast({
        title: "Success",
        description: isBackdated ? `Backdated attendance saved successfully for ${format(selectedDate, 'dd MMM yyyy')}` : "Attendance saved successfully"
      });

      // Reset form
      setSelectedCourse("");
      setSelectedSubject("");
      setSelectedFaculty("");
      setClassName("");
      const resetDate = new Date();
      resetDate.setHours(0, 0, 0, 0);
      setSelectedDate(resetDate);
      setStudents([]);
      setAttendanceRecords([]);
      setDuplicateWarning({
        show: false,
        message: ""
      });
      setShowDuplicateAlert(false);
      setOpen(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const isBackdated = format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = selectedDate > new Date();
  const handleMarkAnyway = () => {
    setShowDuplicateAlert(false);
  };
  const handleViewExisting = () => {
    if (duplicateWarning.existingSession) {
      toast({
        title: "Existing Session Details",
        description: `Marked on ${format(new Date(duplicateWarning.existingSession.session_date), 'dd MMM yyyy')} at ${duplicateWarning.existingSession.start_time || 'N/A'} - Attendance: ${duplicateWarning.existingSession.attendance_percentage || 0}%`
      });
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Mark Class Attendance
            {isBackdated && <Badge variant="outline" className="text-orange-600 border-orange-600">
                Backdated Entry
              </Badge>}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Attendance for: {format(selectedDate, 'EEEE, dd MMMM yyyy')}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Date Picker */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <label className="text-sm font-medium">Attendance Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !selectedDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={date => {
                  if (date) {
                    const normalized = new Date(date);
                    normalized.setHours(0, 0, 0, 0);
                    setSelectedDate(normalized);
                  }
                }} disabled={date => date > new Date()} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {isFutureDate && <p className="text-xs text-destructive mt-1">Future dates are not allowed</p>}
            </div>
          </div>

          {/* Duplicate Warning Alert */}
          {showDuplicateAlert && duplicateWarning.show && <Alert variant="destructive" className="border-orange-600 bg-orange-50 dark:bg-orange-950">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                Duplicate Attendance Entry Detected
              </AlertTitle>
              <AlertDescription className="space-y-3 mt-2">
                <p className="text-sm">{duplicateWarning.message}</p>
                {duplicateWarning.existingSession && <div className="text-xs bg-background/50 p-2 rounded space-y-1">
                    <div>Time: {duplicateWarning.existingSession.start_time || 'N/A'}</div>
                    <div>Faculty: {duplicateWarning.existingSession.faculty?.name || 'N/A'}</div>
                    <div>Attendance: {duplicateWarning.existingSession.attendance_percentage || 0}%</div>
                  </div>}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={handleViewExisting} className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="default" onClick={handleMarkAnyway} className="text-xs bg-orange-600 hover:bg-orange-700">
                    Mark Anyway
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => <SelectItem key={course.id} value={course.id.toString()}>
                    {course.name} ({course.code})
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <div className="space-y-1">
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty} disabled={!!currentFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculty.map(f => <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              {currentFaculty && <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  Auto-selected (you are faculty)
                </div>}
            </div>

            <div className="space-y-1">
              <Combobox options={classNames} value={className} onChange={setClassName} placeholder="Class/Batch (Optional)" emptyText="No existing classes found." allowCustom={true} />
              <div className="text-xs text-muted-foreground">
                Optional - Select existing or type new
              </div>
            </div>
          </div>

          {/* Stats and Bulk Actions */}
          {students.length > 0 && <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <Badge variant="outline" className="px-3 py-1">
                    <Users className="h-4 w-4 mr-1" />
                    Total: {students.length}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Present: {presentCount}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    Absent: {absentCount}
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1 text-orange-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Late: {lateCount}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={markAllPresent}>
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={markAllAbsent}>
                    Mark All Absent
                  </Button>
                </div>
              </div>

              {/* Student Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {students.map(student => {
              const record = attendanceRecords.find(r => r.student_id === student.id);
              const status = record?.status || 'present';
              return <Card key={student.id} className="p-4">
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.student_id}</div>
                          {student.class && <div className="text-xs text-muted-foreground">{student.class}</div>}
                        </div>
                        
                        <div className="flex gap-1">
                          <Button size="sm" variant={status === 'present' ? 'default' : 'outline'} className={`flex-1 ${status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`} onClick={() => updateAttendanceStatus(student.id, 'present')}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Present
                          </Button>
                          
                          <Button size="sm" variant={status === 'absent' ? 'default' : 'outline'} className={`flex-1 ${status === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}`} onClick={() => updateAttendanceStatus(student.id, 'absent')}>
                            <XCircle className="h-3 w-3 mr-1" />
                            Absent
                          </Button>
                          
                          <Button size="sm" variant={status === 'late' ? 'default' : 'outline'} className={`flex-1 ${status === 'late' ? 'bg-orange-600 hover:bg-orange-700' : ''}`} onClick={() => updateAttendanceStatus(student.id, 'late')}>
                            <Clock className="h-3 w-3 mr-1" />
                            Late
                          </Button>
                        </div>
                      </div>
                    </Card>;
            })}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveAttendance} disabled={saving || students.length === 0}>
                  {saving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </div>}

          {loading && <div className="text-center py-8">
              <div className="text-muted-foreground">Loading students...</div>
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
}
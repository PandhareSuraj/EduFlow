import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, GraduationCap, FileText, Clock, Phone, Mail, DollarSign, AlertCircle, Users, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StudentNotifications } from "@/components/notifications/StudentNotifications";
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudentData {
  id: number;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  course_name: string;
  admission_date: string;
  year: number;
  semester: number;
  status: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [feeStatus, setFeeStatus] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchStudentData();
      fetchAttendanceData();
      fetchFeeStatus();
      generateNotifications();
    }
  }, [user]);

  const generateNotifications = async () => {
    try {
      await supabase.rpc('generate_role_based_notifications');
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  const fetchStudentData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_student_data');
      
      if (error) {
        console.error('Error fetching student data:', error);
        return;
      }

      if (data && data.length > 0) {
        setStudentData(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const { data: studentData } = await supabase.rpc('get_student_data');
      if (studentData && studentData.length > 0) {
        const student = studentData[0];
        
        const { data: attendanceData } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('student_id', student.id);

        if (attendanceData && attendanceData.length > 0) {
          const presentCount = attendanceData.filter(record => record.status === 'present').length;
          const totalCount = attendanceData.length;
          const percentage = (presentCount / totalCount) * 100;
          setAttendancePercentage(percentage);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchFeeStatus = async () => {
    try {
      const { data: studentData } = await supabase.rpc('get_student_data');
      if (studentData && studentData.length > 0) {
        const student = studentData[0];
        
        const { data: feeData } = await supabase
          .from('student_fees')
          .select('*')
          .eq('student_id', student.id);

        if (feeData) {
          setFeeStatus(feeData);
        }
      }
    } catch (error) {
      console.error('Error fetching fee status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Student Record Found</CardTitle>
            <CardDescription className="text-center">
              Your account is not linked to a student record. Please contact the administration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" data-tour="welcome-header">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {studentData.name}</h1>
          <p className="text-muted-foreground">Student ID: {studentData.student_id}</p>
        </div>
        <Badge variant={studentData.status === 'active' ? 'default' : 'secondary'}>
          {studentData.status}
        </Badge>
      </div>

      {/* Student Profile Card */}
      <Card data-tour="profile-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(studentData.name)}</AvatarFallback>
            </Avatar>
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{studentData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Mobile:</span>
                <span className="text-sm">{studentData.mobile_number}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Admission Date:</span>
                <span className="text-sm">{new Date(studentData.admission_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Course:</span>
                <span className="text-sm">{studentData.course_name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="academic-info">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Year</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.year || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Academic Year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.semester || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Current Semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={studentData.status === 'active' ? 'default' : 'secondary'}>
                {studentData.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Current Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <StudentNotifications />

      {/* Push Notifications Settings */}
      <Card data-tour="notifications-section">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get exam reminders on your device, even when the app is closed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PushNotificationManager />
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Performance
          </CardTitle>
          <CardDescription>Your recent academic progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Attendance</span>
              <Badge variant={attendancePercentage >= 75 ? "default" : "destructive"}>
                {attendancePercentage.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current CGPA</span>
              <Badge variant="outline">8.5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Credits</span>
              <Badge variant="outline">45/60</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Status */}
      <Card data-tour="fee-status">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Status
          </CardTitle>
          <CardDescription>Your fee payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeStatus.length > 0 ? (
              feeStatus.map((fee, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Semester {fee.semester || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{fee.balance_amount || 0}</p>
                    <Badge variant={fee.status === 'paid' ? 'default' : fee.status === 'partial' ? 'secondary' : 'destructive'}>
                      {fee.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No fee records found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card data-tour="quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access your student information and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/student-profile')}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <GraduationCap className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">My Profile</span>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/student-course')}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">My Course</span>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/student-results')}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">My Results</span>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/student-tests')}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium">MCQ Tests</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, GraduationCap, Phone, Mail, MapPin, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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

export default function StudentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: ''
  });

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_student_data');
      
      if (error) {
        console.error('Error fetching student data:', error);
        return;
      }

      if (data && data.length > 0) {
        setStudentData(data[0]);
        setFormData({
          name: data[0].name,
          mobile_number: data[0].mobile_number
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!studentData) return;

    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: formData.name,
          mobile_number: formData.mobile_number
        })
        .eq('id', studentData.id);

      if (error) throw error;

      setStudentData({
        ...studentData,
        name: formData.name,
        mobile_number: formData.mobile_number
      });

      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (studentData) {
      setFormData({
        name: studentData.name,
        mobile_number: studentData.mobile_number
      });
    }
    setEditing(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        <Badge variant={studentData.status === 'active' ? 'default' : 'secondary'}>
          {studentData.status}
        </Badge>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">{getInitials(studentData.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>Student ID: {studentData.student_id}</CardDescription>
              </div>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <span>{studentData.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{studentData.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                {editing ? (
                  <Input
                    id="mobile"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{studentData.mobile_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>
              
              <div className="space-y-2">
                <Label>Course</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{studentData.course_name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Admission Date</Label>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(studentData.admission_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Year</Label>
                  <div className="p-2 bg-muted/50 rounded text-center">
                    <span className="text-lg font-semibold">{studentData.year || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Semester</Label>
                  <div className="p-2 bg-muted/50 rounded text-center">
                    <span className="text-lg font-semibold">{studentData.semester || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, Phone, Mail, Calendar, Book, MapPin } from "lucide-react";

interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  course_id?: number;
  admission_date: string;
  year?: number;
  semester?: number;
  status: string;
  class?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface ViewStudentDialogProps {
  student: Student & { course?: Course };
  trigger?: React.ReactNode;
}

export function ViewStudentDialog({ student, trigger }: ViewStudentDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'graduated': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Student Details - {student.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{student.student_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm font-semibold">{student.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile Number</label>
                  <p className="text-sm">{student.mobile_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{student.email}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(student.status)}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course</label>
                  <p className="text-sm font-semibold">
                    {student.course?.name || 'N/A'} 
                    {student.course?.code && ` (${student.course.code})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Admission Date</label>
                  <p className="text-sm">
                    {new Date(student.admission_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {student.year && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                  <p className="text-sm">{student.year}</p>
                </div>
              )}

              {student.semester && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Semester</label>
                  <p className="text-sm">{student.semester}</p>
                </div>
              )}

              {student.class && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                    <p className="text-sm">{student.class}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`tel:${student.mobile_number}`)}
          >
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(`mailto:${student.email}`)}
          >
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
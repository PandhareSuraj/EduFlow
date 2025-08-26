import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Upload, FileText, Eye, Edit, Download, User, Phone, Mail, Calendar, Upload as UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  course_id: number;
  class: string;
  semester: number;
  year: number;
  admission_date: string;
  status: 'active' | 'left' | 'completed';
  course_name?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface StudentDocument {
  id: string;
  document_type: 'aadhar' | 'marksheet' | 'photo' | 'other';
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
}

export function AddStudentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    course_id: "",
    class: "",
    semester: 1,
    year: 1,
    admission_date: new Date().toISOString().split('T')[0]
  });
  const [documents, setDocuments] = useState<{[key: string]: File}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  const { toast } = useToast();

  // Mock courses data - replace with actual Supabase query
  const courses: Course[] = [
    { id: 1, name: "Radiologic Technology", code: "RT" },
    { id: 2, name: "Medical Laboratory Technology", code: "MLT" },
    { id: 3, name: "Pharmacy Technology", code: "PT" },
    { id: 4, name: "Nursing", code: "BSN" }
  ];

  const handleFileUpload = (documentType: string, file: File) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const uploadDocument = async (studentId: number, documentType: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}_${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `${studentId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('student-documents')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('student_documents')
      .insert({
        student_id: studentId,
        document_type: documentType,
        file_name: fileName,
        file_url: publicUrl,
        file_size: file.size
      });

    if (dbError) {
      throw dbError;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Student name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error", 
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!formData.mobile_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Mobile number is required", 
        variant: "destructive",
      });
      return;
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.mobile_number.replace(/\D/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!formData.course_id) {
      toast({
        title: "Validation Error",
        description: "Please select a course",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user's college_id
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('college_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userRoleData?.college_id) {
        toast({
          title: "Error",
          description: "Unable to determine your college association",
          variant: "destructive",
        });
        return;
      }

      // Check if email already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', formData.email.trim().toLowerCase())
        .maybeSingle();

      if (existingStudent) {
        toast({
          title: "Error",
          description: "A student with this email already exists",
          variant: "destructive",
        });
        return;
      }

      // Insert student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          mobile_number: formData.mobile_number.replace(/\D/g, ''),
          course_id: parseInt(formData.course_id),
          year: formData.year || 1,
          semester: formData.semester || 1,
          college_id: userRoleData.college_id,
          status: 'active'
        }])
        .select()
        .single();

      if (studentError) {
        console.error('Error inserting student:', studentError);
        toast({
          title: "Error",
          description: studentError.message || "Failed to add student. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Upload documents if any
      if (Object.keys(documents).length > 0 && studentData) {
        const documentPromises = Object.entries(documents).map(([docType, file]) =>
          uploadDocument(studentData.id, docType, file)
        );
        await Promise.all(documentPromises);
      }

      toast({
        title: "Success",
        description: `Student ${formData.name} added successfully with ID: ${studentData.student_id}!`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        course_id: "",
        class: "",
        semester: 1,
        year: 1,
        admission_date: new Date().toISOString().split('T')[0]
      });
      setDocuments({});
      setOpen(false);
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Register a new student with their personal details and documents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Student Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    placeholder="e.g., A, B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select value={formData.semester.toString()} onValueChange={(value) => setFormData({...formData, semester: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Select value={formData.year.toString()} onValueChange={(value) => setFormData({...formData, year: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4].map((yr) => (
                        <SelectItem key={yr} value={yr.toString()}>
                          Year {yr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admission_date">Admission Date *</Label>
                  <Input
                    id="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={(e) => setFormData({...formData, admission_date: e.target.value})}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid gap-4">
                {[
                  { type: 'photo', label: 'Student Photo', icon: User },
                  { type: 'aadhar', label: 'Aadhar Card', icon: FileText },
                  { type: 'marksheet', label: 'Marksheet', icon: FileText },
                  { type: 'other', label: 'Other Documents', icon: FileText }
                ].map(({ type, label, icon: Icon }) => (
                  <div key={type} className="space-y-2">
                    <Label htmlFor={type}>{label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        ref={(el) => fileInputRefs.current[type] = el}
                        type="file"
                        accept={type === 'photo' ? 'image/*' : '*/*'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(type, file);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRefs.current[type]?.click()}
                        className="flex-1"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {documents[type] ? documents[type].name : `Choose ${label}`}
                      </Button>
                      {documents[type] && (
                        <Badge variant="secondary">
                          {(documents[type].size / 1024).toFixed(1)} KB
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ViewStudentDialogProps {
  student: Student;
  trigger?: React.ReactNode;
}

export function ViewStudentDialog({ student, trigger }: ViewStudentDialogProps) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'left': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student Profile - {student.student_id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{student.name}</h3>
              <p className="text-muted-foreground">{student.student_id}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(student.status)}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Course</Label>
              <p className="mt-1">{student.course_name || `Course ID: ${student.course_id}`}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Class</Label>
              <p className="mt-1">{student.class || 'Not assigned'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Year / Semester</Label>
              <p className="mt-1">Year {student.year}, Semester {student.semester}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="mt-1">{student.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Mobile Number</Label>
              <p className="mt-1">{student.mobile_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Admission Date</Label>
              <p className="mt-1">{new Date(student.admission_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ViewStudentsDialog() {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with Supabase query
  const mockStudents: Student[] = [
    {
      id: 1,
      student_id: "STU000001",
      name: "John Doe",
      email: "john.doe@email.com",
      mobile_number: "9876543210",
      course_id: 1,
      class: "A",
      semester: 1,
      year: 1,
      admission_date: "2024-08-01",
      status: "active",
      course_name: "Radiologic Technology"
    },
    {
      id: 2,
      student_id: "STU000002",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      mobile_number: "9876543211",
      course_id: 2,
      class: "B",
      semester: 2,
      year: 1,
      admission_date: "2024-08-01",
      status: "active",
      course_name: "Medical Laboratory Technology"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'left': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View Students
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Student Management</DialogTitle>
          <DialogDescription>
            View and manage all registered students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <AddStudentDialog />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Year/Semester</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.student_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.course_name}</div>
                        <div className="text-sm text-muted-foreground">Class: {student.class}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">Year {student.year}</div>
                        <div className="text-sm text-muted-foreground">Sem {student.semester}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {student.mobile_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <ViewStudentDialog student={student} />
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
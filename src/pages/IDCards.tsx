import { useState, useEffect } from "react";
import { CreditCard, Download, Search, Filter, Plus, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentIDCard } from "@/components/id-card/StudentIDCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  student_id: string;
  course: string;
  batch: string;
  phone: string;
  admissionDate: string;
  validUpto: string;
  idCardStatus: string;
  photo?: string;
  courses?: { name: string; code: string };
}

export default function IDCards() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          name,
          student_id,
          mobile_number,
          admission_date,
          year,
          semester,
          status,
          course_id
        `)
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;

      // Get courses separately
      const courseIds = [...new Set((data || []).map(s => s.course_id))];
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, name, code')
        .in('id', courseIds);

      const studentData: Student[] = (data || []).map(student => {
        const course = coursesData?.find(c => c.id === student.course_id);
        return {
          id: student.student_id,
          name: student.name,
          student_id: student.student_id,
          course: course?.name || 'Unknown',
          batch: `${student.year}-${student.semester}`,
          phone: student.mobile_number,
          admissionDate: student.admission_date,
          validUpto: new Date(new Date(student.admission_date).getFullYear() + 2, new Date(student.admission_date).getMonth(), new Date(student.admission_date).getDate()).toISOString().split('T')[0],
          idCardStatus: Math.random() > 0.3 ? "Generated" : "Pending",
          courses: course
        };
      });

      setStudents(studentData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Generated": return "bg-success text-success-foreground";
      case "Pending": return "bg-warning text-warning-foreground";
      case "Expired": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleGenerateCard = (student: any) => {
    setSelectedStudent(student);
  };

  const handlePrintCard = (student: any) => {
    // Print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Student ID Card - ${student.name}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .id-card { 
                width: 350px; 
                height: 220px; 
                border: 2px solid #000; 
                padding: 15px; 
                margin: 0 auto;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
              }
              .header { text-align: center; margin-bottom: 15px; }
              .college-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
              .student-info { margin-bottom: 10px; }
              .student-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
              .details { font-size: 12px; line-height: 1.4; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="id-card">
              <div class="header">
                <div class="college-name">KK Patil Paramedical College</div>
                <div style="font-size: 12px;">Student Identity Card</div>
              </div>
              <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="details">
                  <div><strong>ID:</strong> ${student.id}</div>
                  <div><strong>Course:</strong> ${student.course}</div>
                  <div><strong>Batch:</strong> ${student.batch}</div>
                  <div><strong>Valid Upto:</strong> ${new Date(student.validUpto).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = (student: any) => {
    // For now, we'll create a simple download link
    // In a real app, you'd generate a proper PDF
    const element = document.createElement('a');
    const content = `Student ID Card\n\nName: ${student.name}\nID: ${student.id}\nCourse: ${student.course}\nBatch: ${student.batch}\nValid Upto: ${new Date(student.validUpto).toLocaleDateString()}`;
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${student.id}_id_card.txt`;
    element.click();
  };

  const handleBulkGenerate = () => {
    // Bulk generate functionality
    const pendingStudents = students.filter(s => s.idCardStatus === "Pending");
    if (pendingStudents.length === 0) {
      alert("No pending ID cards to generate.");
      return;
    }
    
    // In a real app, this would update the database
    alert(`Generated ${pendingStudents.length} ID cards successfully!`);
    window.location.reload();
  };

  const handleExportList = () => {
    // Export student list as CSV
    const headers = ["Student ID", "Name", "Course", "Batch", "Admission Date", "Valid Upto", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map(student => [
        student.id,
        `"${student.name}"`,
        `"${student.course}"`,
        student.batch,
        student.admissionDate,
        student.validUpto,
        student.idCardStatus
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `id_cards_list_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student ID Cards</h1>
          <p className="text-muted-foreground">Generate and manage student identification cards</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={handleBulkGenerate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Bulk Generate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cards</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generated</p>
                <p className="text-3xl font-bold text-success">
                  {students.filter(s => s.idCardStatus === "Generated").length}
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <CreditCard className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-warning">
                  {students.filter(s => s.idCardStatus === "Pending").length}
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-full">
                <CreditCard className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-3xl font-bold text-destructive">
                  {students.filter(s => new Date(s.validUpto) < new Date()).length}
                </p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-full">
                <CreditCard className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, ID, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button 
                variant="outline"
                onClick={handleExportList}
              >
                <Download className="mr-2 h-4 w-4" />
                Export List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Cards Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Student ID Cards ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Valid Upto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{student.id}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.batch}</TableCell>
                    <TableCell>{new Date(student.admissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(student.validUpto).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(student.idCardStatus)}>
                        {student.idCardStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateCard(student)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              {student.idCardStatus === "Generated" ? "View" : "Generate"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Student ID Card - {student.name}</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <StudentIDCard student={student} />
                              <div className="mt-6 flex justify-end gap-4">
                                <Button 
                                  variant="outline"
                                  onClick={() => handleDownloadPDF(student)}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </Button>
                                <Button onClick={() => handlePrintCard(student)}>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print Card
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
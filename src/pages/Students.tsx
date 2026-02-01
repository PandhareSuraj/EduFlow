import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Users, 
  GraduationCap, 
  Calendar,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Settings,
  UserPlus
} from "lucide-react";
import { ViewStudentDialog, EditStudentDialog, DeleteStudentDialog, AddStudentDialog } from "@/components/forms/StudentDialogs";
import { CreateStudentLoginDialog } from "@/components/forms/CreateStudentLoginDialog";
import { ManageStudentLoginDialog } from "@/components/forms/ManageStudentLoginDialog";
import { VideoTutorialButton } from "@/components/videos/VideoTutorialButton";
import { PermissionWrapper } from "@/components/permissions/RoleGuard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableSkeleton } from "@/components/skeletons";
import { useDebounce } from "@/hooks/useDebounce";

interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  course_id: number | null;
  semester: number | null;
  year: number | null;
  admission_date: string;
  status: string;
  class: string | null;
  user_id?: string;
  courses?: {
    name: string;
    code: string;
  } | null;
  student_fees?: {
    status: string;
    balance_amount: number;
  }[] | null;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

export default function Students() {
  usePageTitle("Students");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      console.log('Fetching students with relationships...');
      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          name,
          email,
          mobile_number,
          course_id,
          semester,
          year,
          admission_date,
          status,
          class,
          user_id,
          courses!students_course_id_fkey (
            name,
            code
          ),
          student_fees!student_fees_student_id_fkey (
            status,
            balance_amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: `Failed to load students: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Students data received:', data);
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const refreshData = () => {
    fetchStudents();
  };

  // Debounce search term for performance
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Memoize filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        student.courses?.code?.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [students, debouncedSearch, statusFilter]);

  // Memoize stats calculations
  const stats = useMemo(() => ({
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    graduatedStudents: students.filter(s => s.status === 'graduated').length,
    pendingFeesCount: students.filter(s => 
      s.student_fees?.some(fee => fee.balance_amount > 0)
    ).length
  }), [students]);

  // Memoize status color getter
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'graduated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'dropped':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }, []);

  const handleExportStudents = useCallback(() => {
    const headers = [
      "Student ID", "Name", "Email", "Mobile", "Course", 
      "Semester", "Year", "Status", "Admission Date"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map(student => [
        student.student_id || 'N/A',
        student.name || 'N/A',
        student.email || 'N/A',
        student.mobile_number || 'N/A',
        student.courses?.code || 'N/A',
        student.semester || 'N/A',
        student.year || 'N/A',
        student.status || 'N/A',
        new Date(student.admission_date).toLocaleDateString('en-IN')
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredStudents]);

  if (loading) {
    return <TableSkeleton rows={8} columns={9} showStats={true} statsCount={4} />;
  }

  const { totalStudents, activeStudents, graduatedStudents, pendingFeesCount } = stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Manage student records and information</p>
        </div>
        <div className="flex items-center gap-2">
          <VideoTutorialButton pageIdentifier="students" pageName="Students" />
          <PermissionWrapper permission="STUDENTS_CREATE">
            <AddStudentDialog onStudentAdded={refreshData} />
          </PermissionWrapper>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">All registered students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduated</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graduatedStudents}</div>
            <p className="text-xs text-muted-foreground">Completed studies</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFeesCount}</div>
            <p className="text-xs text-muted-foreground">Students with due fees</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search students, ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={handleExportStudents}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            View and manage all student information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No students found matching your criteria." 
                  : "No students found. Start by adding your first student."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fee Status</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  // Calculate fee status: check if fees exist first
                  const feeStatus = student.student_fees && student.student_fees.length > 0
                    ? (student.student_fees.some(fee => fee.balance_amount > 0) ? 'due' : 'paid')
                    : 'no_fees';
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{student.courses?.code || 'Not assigned'}</TableCell>
                      <TableCell>{student.semester ? `Semester ${student.semester}` : 'N/A'}</TableCell>
                      <TableCell>{student.mobile_number}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {feeStatus === 'due' ? (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            Due
                          </Badge>
                        ) : feeStatus === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {student.user_id ? (
                            <>
                              <Badge variant="default">Has Login</Badge>
                              <ManageStudentLoginDialog 
                                student={student}
                                onSuccess={refreshData}
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            </>
                          ) : (
                            <>
                              <Badge variant="secondary">No Login</Badge>
                              <CreateStudentLoginDialog 
                                student={student}
                                onSuccess={refreshData}
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <ViewStudentDialog 
                            student={{...student, course: courses.find(c => c.id === student.course_id)}}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <EditStudentDialog
                            student={student}
                            courses={courses}
                            onUpdate={refreshData}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DeleteStudentDialog
                            student={student}
                            onDelete={refreshData}
                            trigger={
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Search, Filter, Download, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { ViewStudentDialog, EditStudentDialog } from "@/components/forms/StudentDialogs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for students
const students = [
  {
    id: "STU001",
    name: "Priya Sharma",
    course: "DMLT",
    batch: "2024-A",
    phone: "+91 9876543210",
    email: "priya.sharma@email.com",
    status: "Active",
    admissionDate: "2024-01-15",
    feesStatus: "Paid"
  },
  {
    id: "STU002", 
    name: "Rahul Patil",
    course: "Radiology Technician",
    batch: "2024-B",
    phone: "+91 9876543211",
    email: "rahul.patil@email.com",
    status: "Active",
    admissionDate: "2024-01-20",
    feesStatus: "Pending"
  },
  {
    id: "STU003",
    name: "Anjali Desai",
    course: "PGDMLT",
    batch: "2023-A",
    phone: "+91 9876543212",
    email: "anjali.desai@email.com",
    status: "Active",
    admissionDate: "2023-08-10",
    feesStatus: "Paid"
  },
  {
    id: "STU004",
    name: "Vikram Singh",
    course: "Hospital Management",
    batch: "2024-A",
    phone: "+91 9876543213",
    email: "vikram.singh@email.com",
    status: "Active",
    admissionDate: "2024-02-01",
    feesStatus: "Partial"
  }
];

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-success text-success-foreground";
      case "Inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getFeesStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-success text-success-foreground";
      case "Pending": return "bg-destructive text-destructive-foreground";
      case "Partial": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage student admissions, profiles, and records</p>
        </div>
        <AddStudentDialog />
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
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Students List ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fees Status</TableHead>
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
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{student.id}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFeesStatusColor(student.feesStatus)}>
                      {student.feesStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ViewStudentDialog 
                          student={student}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                          }
                        />
                        <EditStudentDialog 
                          student={student}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem>
                          Generate ID Card
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Search, Filter, Download, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudentDialog, ViewStudentsDialog } from "@/components/forms/StudentDialogs";
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
          <p className="text-muted-foreground">Manage student admissions, profiles, and records with document upload</p>
        </div>
        <div className="flex gap-2">
          <ViewStudentsDialog />
          <AddStudentDialog />
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{students.filter(s => s.status === "Active").length}</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Fees</p>
                <p className="text-2xl font-bold">{students.filter(s => s.feesStatus === "Pending").length}</p>
              </div>
              <Badge className="bg-red-500/10 text-red-500">Due</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Admissions</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <Badge className="bg-blue-500/10 text-blue-500">This Month</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course-wise Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Search className="h-6 w-6 mb-2" />
              Search Students
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              Export Records
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Filter className="h-6 w-6 mb-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
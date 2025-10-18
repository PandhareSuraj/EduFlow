import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, ClipboardCheck, BookOpen, Building2, UserCheck, FileText, ArrowUpCircle } from "lucide-react";
import { AttendanceMarkingDialog } from "@/components/attendance/AttendanceMarkingDialog";
import { CollectFeeDialog } from "@/components/forms/CollectFeeDialog";
import { AddStudentDialog } from "@/components/forms/StudentDialogs";
import { AddBookDialog } from "@/components/library/AddBookDialog";
import { IssueBookDialog } from "@/components/library/IssueBookDialog";

interface QuickActionsProps {
  userRole: string;
  className?: string;
}

export function QuickActions({ userRole, className }: QuickActionsProps) {
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [collectFeeOpen, setCollectFeeOpen] = useState(false);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);

  const renderQuickActions = () => {
    if (userRole === 'super_admin') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/colleges'}
          >
            <Building2 className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">College Management</p>
              <p className="text-sm text-muted-foreground">Manage college portfolios</p>
            </div>
          </button>
          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/college-performance'}
          >
            <TrendingUp className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Performance Monitor</p>
              <p className="text-sm text-muted-foreground">Track college performance</p>
            </div>
          </button>
          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/multi-college-users'}
          >
            <UserCheck className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Multi-College Users</p>
              <p className="text-sm text-muted-foreground">Manage users across colleges</p>
            </div>
          </button>
          <button 
            className="flex items-center p-3 bg-success/10 hover:bg-success/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/student-promotion'}
          >
            <ArrowUpCircle className="mr-3 h-4 w-4 text-success" />
            <div>
              <p className="font-medium">Student Promotion</p>
              <p className="text-sm text-muted-foreground">Promote students to next year</p>
            </div>
          </button>
        </>
      );
    }

    if (userRole === 'admin' || userRole === 'teacher') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setAddStudentOpen(true)}
          >
            <Users className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Add New Student</p>
              <p className="text-sm text-muted-foreground">Register a new student</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setCollectFeeOpen(true)}
          >
            <DollarSign className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Collect Fee</p>
              <p className="text-sm text-muted-foreground">Process fee payment</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setMarkAttendanceOpen(true)}
          >
            <ClipboardCheck className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Mark Attendance</p>
              <p className="text-sm text-muted-foreground">Daily attendance entry</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-success/10 hover:bg-success/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/reports'}
          >
            <FileText className="mr-3 h-4 w-4 text-success" />
            <div>
              <p className="font-medium">Generate Reports</p>
              <p className="text-sm text-muted-foreground">Academic and administrative reports</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-info/10 hover:bg-info/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/student-promotion'}
          >
            <ArrowUpCircle className="mr-3 h-4 w-4 text-info" />
            <div>
              <p className="font-medium">Student Promotion</p>
              <p className="text-sm text-muted-foreground">Promote students to next year</p>
            </div>
          </button>
        </>
      );
    }

    if (userRole === 'accountant') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setCollectFeeOpen(true)}
          >
            <DollarSign className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Collect Fee</p>
              <p className="text-sm text-muted-foreground">Process fee payment</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/fees'}
          >
            <FileText className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Fee Reports</p>
              <p className="text-sm text-muted-foreground">Generate financial reports</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/fees?filter=pending'}
          >
            <Users className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Fee Defaulters</p>
              <p className="text-sm text-muted-foreground">View pending payments</p>
            </div>
          </button>
        </>
      );
    }

    if (userRole === 'librarian') {
      return (
        <>
          <button 
            className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setIssueBookOpen(true)}
          >
            <BookOpen className="mr-3 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Issue Book</p>
              <p className="text-sm text-muted-foreground">Issue book to member</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => setAddBookOpen(true)}
          >
            <BookOpen className="mr-3 h-4 w-4 text-accent" />
            <div>
              <p className="font-medium">Add New Book</p>
              <p className="text-sm text-muted-foreground">Add book to library</p>
            </div>
          </button>

          <button 
            className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-all duration-200 text-left w-full hover:shadow-sm"
            onClick={() => window.location.href = '/library'}
          >
            <Users className="mr-3 h-4 w-4 text-warning" />
            <div>
              <p className="font-medium">Library Management</p>
              <p className="text-sm text-muted-foreground">Manage books and members</p>
            </div>
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <Card className={`shadow-card hover:shadow-glow transition-all duration-300 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            {renderQuickActions()}
          </div>
        </CardContent>
      </Card>

      {/* Hidden Dialogs with Triggers */}
      <div className="hidden">
        <AddStudentDialog onStudentAdded={() => setAddStudentOpen(false)} />
        <CollectFeeDialog />
        <AttendanceMarkingDialog />
      </div>
    </>
  );
}
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp,
  Calendar,
  DollarSign,
  UserCheck,
  ClipboardCheck
} from "lucide-react";
import { AddStudentDialog } from "@/components/forms/AddStudentDialog";
import { CollectFeeDialog } from "@/components/forms/CollectFeeDialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-header rounded-lg p-6 text-white shadow-header">
        <h1 className="text-3xl font-bold mb-2">Welcome to KK Patil Paramedical College ERP</h1>
        <p className="text-white/90">Manage your institution efficiently with our comprehensive system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="1,247"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Courses"
          value="4"
          icon={GraduationCap}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Monthly Revenue"
          value="₹5,67,890"
          icon={CreditCard}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Faculty Members"
          value="23"
          icon={UserCheck}
          trend={{ value: 4, isPositive: true }}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <AddStudentDialog 
                trigger={
                  <button className="flex items-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-left w-full">
                    <Users className="mr-3 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Add New Student</p>
                      <p className="text-sm text-muted-foreground">Register a new student</p>
                    </div>
                  </button>
                }
              />
              <CollectFeeDialog 
                trigger={
                  <button className="flex items-center p-3 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors text-left w-full">
                    <DollarSign className="mr-3 h-4 w-4 text-accent" />
                    <div>
                      <p className="font-medium">Collect Fee</p>
                      <p className="text-sm text-muted-foreground">Process fee payment</p>
                    </div>
                  </button>
                }
              />
              <button className="flex items-center p-3 bg-warning/10 hover:bg-warning/20 rounded-lg transition-colors text-left">
                <ClipboardCheck className="mr-3 h-4 w-4 text-warning" />
                <div>
                  <p className="font-medium">Mark Attendance</p>
                  <p className="text-sm text-muted-foreground">Daily attendance entry</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>

      {/* Upcoming Events & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <div className="bg-primary text-primary-foreground rounded-lg p-2 mr-3">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">DMLT Practical Exam</p>
                  <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <div className="bg-accent text-accent-foreground rounded-lg p-2 mr-3">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">New Batch Orientation</p>
                  <p className="text-sm text-muted-foreground">March 15, 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-warning">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="font-medium text-warning">Fee Reminders</p>
                <p className="text-sm text-muted-foreground">45 students have pending fees</p>
              </div>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-medium text-destructive">Low Attendance</p>
                <p className="text-sm text-muted-foreground">12 students below 75% attendance</p>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="font-medium text-primary">Certificates Pending</p>
                <p className="text-sm text-muted-foreground">8 course completion certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const recentActivities = [
  {
    id: 1,
    student: "Priya Sharma",
    action: "New Admission",
    course: "DMLT",
    time: "2 hours ago",
    type: "admission"
  },
  {
    id: 2,
    student: "Rahul Patil",
    action: "Fee Payment",
    course: "Radiology Technician",
    time: "4 hours ago",
    type: "payment"
  },
  {
    id: 3,
    student: "Anjali Desai",
    action: "Exam Completed",
    course: "PGDMLT",
    time: "6 hours ago",
    type: "exam"
  },
  {
    id: 4,
    student: "Vikram Singh",
    action: "ID Card Generated",
    course: "Hospital Management",
    time: "1 day ago",
    type: "id-card"
  }
];

const getActivityColor = (type: string) => {
  switch (type) {
    case "admission": return "bg-success";
    case "payment": return "bg-primary";
    case "exam": return "bg-warning";
    case "id-card": return "bg-accent";
    default: return "bg-muted";
  }
};

export function RecentActivity() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={getActivityColor(activity.type)}>
                  {activity.student.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.student}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action} - {activity.course}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {activity.time}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  KeyRound,
  Shield,
  Settings,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserManagementWidget() {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: UserPlus,
      label: "Create Faculty Login",
      description: "Add new faculty user account",
      onClick: () => navigate('/faculty'),
      color: "bg-primary/10 hover:bg-primary/20 text-primary"
    },
    {
      icon: Users,
      label: "Create Student Login",
      description: "Add new student user account",
      onClick: () => navigate('/students'),
      color: "bg-accent/10 hover:bg-accent/20 text-accent"
    },
    {
      icon: KeyRound,
      label: "Reset Password",
      description: "Reset user credentials",
      onClick: () => navigate('/users'),
      color: "bg-warning/10 hover:bg-warning/20 text-warning"
    },
    {
      icon: Shield,
      label: "Manage Roles",
      description: "Assign and modify user roles",
      onClick: () => navigate('/users'),
      color: "bg-success/10 hover:bg-success/20 text-success"
    }
  ];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            User Management
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/users')}
            className="text-xs"
          >
            View All
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-3 rounded-lg transition-all duration-200 text-left ${action.color}`}
            >
              <action.icon className="h-5 w-5 mb-2" />
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-xs opacity-75 line-clamp-1">{action.description}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

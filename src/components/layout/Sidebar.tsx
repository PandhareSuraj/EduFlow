import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Users, GraduationCap, UserCheck, CreditCard, MessageSquare, ClipboardCheck, FileText, BarChart3, Settings, Menu, X, IdCard, Package, Building2, IndianRupee, Shield, Database, TrendingUp, Globe, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const {
    userRole
  } = useAuth();
  const getNavigation = () => {
    if (userRole === 'super_admin') {
      // Super Admin Navigation - Multi-college management
      return [{
        name: "Dashboard",
        href: "/",
        icon: BarChart3
      }, {
        name: "College Management",
        href: "/colleges",
        icon: Building2
      }, {
        name: "AMC Revenue",
        href: "/amc-revenue",
        icon: IndianRupee
      }, {
        name: "System Analytics",
        href: "/system-analytics",
        icon: TrendingUp
      }, {
        name: "Reports",
        href: "/reports",
        icon: FileText
      }, {
        name: "User Management",
        href: "/user-management",
        icon: Shield
      }, {
        name: "Settings",
        href: "/settings",
        icon: Settings
      }];
    } else if (userRole === 'student') {
      // Student Navigation - View own information and tests
      return [{
        name: "Dashboard",
        href: "/",
        icon: BarChart3
      }, {
        name: "My Profile",
        href: "/student-profile",
        icon: Users
      }, {
        name: "My Course",
        href: "/student-course",
        icon: GraduationCap
      }, {
        name: "My Results",
        href: "/student-results",
        icon: FileText
      }, {
        name: "MCQ Tests",
        href: "/student-tests",
        icon: ClipboardCheck
      }, {
        name: "Library",
        href: "/library",
        icon: BookOpen
      }, {
        name: "Settings",
        href: "/settings",
        icon: Settings
      }];
    } else {
      // College Admin Navigation - Single college operations
      return [{
        name: "Dashboard",
        href: "/",
        icon: BarChart3
      }, {
        name: "Students",
        href: "/students",
        icon: Users
      }, {
        name: "Courses",
        href: "/courses",
        icon: GraduationCap
      }, {
        name: "Faculty",
        href: "/faculty",
        icon: UserCheck
      }, {
        name: "Fees",
        href: "/fees",
        icon: CreditCard
      }, {
        name: "Enquiries",
        href: "/enquiries",
        icon: MessageSquare
      }, {
        name: "Attendance",
        href: "/attendance",
        icon: ClipboardCheck
      }, {
        name: "Exams",
        href: "/exams",
        icon: FileText
      }, {
        name: "Library",
        href: "/library",
        icon: BookOpen
      }, {
        name: "ID Cards",
        href: "/id-cards",
        icon: IdCard
      }, {
        name: "Inventory",
        href: "/inventory",
        icon: Package
      }, {
        name: "Reports",
        href: "/reports",
        icon: BarChart3
      }, {
        name: "Settings",
        href: "/settings",
        icon: Settings
      }];
    }
  };
  return <div className={cn("bg-card border-r border-border h-screen flex flex-col transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-header">
        <div className="flex items-center justify-between">
          {!isCollapsed && <div className="text-white">
              <h2 className="font-bold text-lg">
                {userRole === 'super_admin' ? 'Multi-College ERP' : userRole === 'student' ? 'Student Portal' : 'KK Patil College'}
              </h2>
              <p className="text-sm text-white/80">
                {userRole === 'super_admin' ? 'System Management' : userRole === 'student' ? 'Student Dashboard' : 'ERP System'}
              </p>
            </div>}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="text-white hover:bg-white/10">
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {getNavigation().map(item => {
        const isActive = location.pathname === item.href;
        return <NavLink key={item.name} to={item.href} className={cn("flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors", "hover:bg-muted hover:text-primary", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground")}>
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>;
      })}
      </nav>

      {/* Footer */}
      {!isCollapsed && <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            
            
          </div>
        </div>}
    </div>;
}
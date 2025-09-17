import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  CreditCard, 
  MessageSquare, 
  ClipboardCheck, 
  FileText, 
  BarChart3, 
  Settings, 
  IdCard, 
  Package, 
  Building2, 
  IndianRupee, 
  Shield, 
  TrendingUp, 
  BookOpen,
  Database,
  Activity
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { userRole } = useAuth();
  const { collegeName, logoUrl } = useBranding();
  const location = useLocation();
  const { state } = useSidebar();

  const getNavigation = () => {
    if (userRole === 'super_admin') {
      return [
        { name: "CRM Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "College Portfolio", href: "/colleges", icon: Building2 },
        { name: "Performance Monitor", href: "/college-performance", icon: TrendingUp },
        { name: "Multi-College Users", href: "/multi-college-users", icon: Users },
        { name: "AMC Revenue", href: "/amc-revenue", icon: IndianRupee },
        { name: "System Analytics", href: "/system-analytics", icon: Activity },
        { name: "System Health", href: "/system-health", icon: Shield },
        { name: "Reports", href: "/reports", icon: FileText },
        { name: "Audit Trail", href: "/audit-trail", icon: Database },
        { name: "Settings", href: "/settings", icon: Settings }
      ];
    } else if (userRole === 'student') {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "My Profile", href: "/student-profile", icon: Users },
        { name: "My Course", href: "/student-course", icon: GraduationCap },
        { name: "My Results", href: "/student-results", icon: FileText },
        { name: "MCQ Tests", href: "/student-tests", icon: ClipboardCheck },
        { name: "Library", href: "/library", icon: BookOpen }
      ];
    } else if (userRole === 'admin') {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "Students", href: "/students", icon: Users },
        { name: "Courses", href: "/courses", icon: GraduationCap },
        { name: "Faculty", href: "/faculty", icon: UserCheck },
        { name: "Fees", href: "/fees", icon: CreditCard },
        { name: "Enquiries", href: "/enquiries", icon: MessageSquare },
        { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
        { name: "Exams", href: "/exams", icon: FileText },
        { name: "Library", href: "/library", icon: BookOpen },
        { name: "ID Cards", href: "/id-cards", icon: IdCard },
        { name: "Inventory", href: "/inventory", icon: Package },
        { name: "Reports", href: "/reports", icon: BarChart3 },
        { name: "Audit Trail", href: "/audit-trail", icon: Database },
        { name: "Settings", href: "/settings", icon: Settings }
      ];
    } else if (userRole === 'teacher') {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "Students", href: "/students", icon: Users },
        { name: "Courses", href: "/courses", icon: GraduationCap },
        { name: "Attendance", href: "/attendance", icon: ClipboardCheck },
        { name: "Exams", href: "/exams", icon: FileText },
        { name: "Library", href: "/library", icon: BookOpen },
        { name: "Reports", href: "/reports", icon: BarChart3 }
      ];
    } else if (userRole === 'clerk') {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "Students", href: "/students", icon: Users },
        { name: "Enquiries", href: "/enquiries", icon: MessageSquare },
        { name: "Fees", href: "/fees", icon: CreditCard },
        { name: "Exams", href: "/exams", icon: FileText },
        { name: "ID Cards", href: "/id-cards", icon: IdCard },
        { name: "Inventory", href: "/inventory", icon: Package },
        { name: "Reports", href: "/reports", icon: BarChart3 }
      ];
    } else if (userRole === 'librarian') {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "Library", href: "/library", icon: BookOpen },
        { name: "Inventory", href: "/inventory", icon: Package }
      ];
    } else if (userRole === 'accountant') {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "Students", href: "/students", icon: Users },
        { name: "Fees", href: "/fees", icon: CreditCard },
        { name: "Reports", href: "/reports", icon: BarChart3 }
      ];
    } else {
      return [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 }
      ];
    }
  };

  const navigation = getNavigation();
  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";
  };

  const getPortalTitle = () => {
    switch (userRole) {
      case 'super_admin': return 'Multi-College ERP';
      case 'student': return 'Student Portal';
      case 'teacher': return 'Teacher Portal';
      case 'clerk': return 'Clerk Portal';
      case 'librarian': return 'Library Portal';
      case 'accountant': return 'Accounts Portal';
      default: return collegeName || 'College Management';
    }
  };

  const getPortalSubtitle = () => {
    switch (userRole) {
      case 'super_admin': return 'System Management';
      case 'student': return 'Student Dashboard';
      case 'teacher': return 'Teaching Tools';
      case 'clerk': return 'Administrative Tasks';
      case 'librarian': return 'Library Management';
      case 'accountant': return 'Financial Management';
      default: return 'ERP System';
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-header p-4">
        {!isCollapsed && (
          <div className="text-white flex items-center space-x-3">
            {logoUrl && userRole !== 'super_admin' && (
              <img src={logoUrl} alt={`Logo`} className="h-8 w-8 object-contain" />
            )}
            <div>
              <h2 className="font-bold text-lg leading-tight">{getPortalTitle()}</h2>
              <p className="text-sm text-white/80 mt-1">{getPortalSubtitle()}</p>
            </div>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-medium px-2 py-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    asChild 
                    className={getNavClassName(item.href)}
                  >
                    <NavLink 
                      to={item.href} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
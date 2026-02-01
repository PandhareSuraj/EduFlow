import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface RouteConfig {
  label: string;
  parent?: string;
}

const routeMap: Record<string, RouteConfig> = {
  "/dashboard": { label: "Dashboard" },
  "/students": { label: "Students", parent: "/dashboard" },
  "/courses": { label: "Courses", parent: "/dashboard" },
  "/faculty": { label: "Faculty", parent: "/dashboard" },
  "/fees": { label: "Fees", parent: "/dashboard" },
  "/attendance": { label: "Attendance", parent: "/dashboard" },
  "/exams": { label: "Exams", parent: "/dashboard" },
  "/library": { label: "Library", parent: "/dashboard" },
  "/reports": { label: "Reports", parent: "/dashboard" },
  "/settings": { label: "Settings", parent: "/dashboard" },
  "/id-cards": { label: "ID Cards", parent: "/dashboard" },
  "/inventory": { label: "Inventory", parent: "/dashboard" },
  "/hostel": { label: "Hostel", parent: "/dashboard" },
  "/transport": { label: "Transport", parent: "/dashboard" },
  "/events": { label: "Events", parent: "/dashboard" },
  "/placements": { label: "Placements", parent: "/dashboard" },
  "/grievances": { label: "Grievances", parent: "/dashboard" },
  "/enquiries": { label: "Enquiries", parent: "/dashboard" },
  "/follow-ups": { label: "Follow-ups", parent: "/dashboard" },
  "/student-promotion": { label: "Student Promotion", parent: "/dashboard" },
  "/user-management": { label: "User Management", parent: "/dashboard" },
  "/audit-trail": { label: "Audit Trail", parent: "/dashboard" },
  "/system-analytics": { label: "System Analytics", parent: "/dashboard" },
  "/system-health": { label: "System Health", parent: "/dashboard" },
  "/college-management": { label: "College Management", parent: "/dashboard" },
  "/college-performance": { label: "College Performance", parent: "/dashboard" },
  "/subscriptions": { label: "Subscriptions", parent: "/dashboard" },
  "/amc-plans": { label: "AMC Plans", parent: "/dashboard" },
  "/amc-revenue": { label: "AMC Revenue", parent: "/dashboard" },
  "/multi-college-users": { label: "Multi-College Users", parent: "/dashboard" },
  // Student portal routes
  "/student-dashboard": { label: "Dashboard" },
  "/student-profile": { label: "Profile", parent: "/student-dashboard" },
  "/student-course": { label: "Course", parent: "/student-dashboard" },
  "/student-results": { label: "Results", parent: "/student-dashboard" },
  "/student-tests": { label: "Tests", parent: "/student-dashboard" },
};

export function Breadcrumbs() {
  const location = useLocation();
  const currentRoute = location.pathname;

  // Don't show on dashboard, landing page, or auth pages
  if (
    currentRoute === "/dashboard" ||
    currentRoute === "/" ||
    currentRoute === "/auth" ||
    currentRoute === "/student-dashboard" ||
    currentRoute === "/product-tour"
  ) {
    return null;
  }

  const buildBreadcrumbs = (): { path: string; label: string }[] => {
    const crumbs: { path: string; label: string }[] = [];
    let current: string | undefined = currentRoute;

    while (current && routeMap[current]) {
      crumbs.unshift({ path: current, label: routeMap[current].label });
      current = routeMap[current].parent;
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  // Don't render if only one or no crumbs
  if (breadcrumbs.length <= 1) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            <BreadcrumbItem>
              {idx === breadcrumbs.length - 1 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

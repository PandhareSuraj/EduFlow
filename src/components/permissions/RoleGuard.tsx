import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: readonly string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles, if false (default), user needs ANY role
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback, 
  requireAll = false 
}: RoleGuardProps) {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Super admin has access to everything
  if (userRole === 'super_admin') {
    return <>{children}</>;
  }

  const hasAccess = requireAll 
    ? allowedRoles.every(role => role === userRole)
    : allowedRoles.includes(userRole as any || '');

  if (!hasAccess) {
    return fallback || (
      <Alert className="border-destructive/50 text-destructive">
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this content. Required role(s): {allowedRoles.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Permission system for different features
export const PERMISSIONS = {
  // Student Management
  STUDENTS_VIEW: ['admin', 'teacher', 'clerk', 'assistant'],
  STUDENTS_CREATE: ['admin', 'clerk'],
  STUDENTS_EDIT: ['admin', 'clerk'],
  STUDENTS_DELETE: ['admin'],

  // Course Management  
  COURSES_VIEW: ['admin', 'teacher', 'clerk'],
  COURSES_CREATE: ['admin'],
  COURSES_EDIT: ['admin'],
  COURSES_DELETE: ['admin'],

  // Fee Management
  FEES_VIEW: ['admin', 'accountant', 'clerk'],
  FEES_COLLECT: ['admin', 'accountant', 'clerk'],
  FEES_STRUCTURE: ['admin', 'accountant'],

  // Attendance Management
  ATTENDANCE_VIEW: ['admin', 'teacher', 'clerk'],
  ATTENDANCE_MARK: ['admin', 'teacher'],
  ATTENDANCE_EDIT: ['admin', 'teacher'],

  // Exam Management
  EXAMS_VIEW: ['admin', 'teacher', 'clerk'],
  EXAMS_CREATE: ['admin', 'teacher'],
  EXAMS_CONDUCT: ['admin', 'teacher'],
  EXAMS_GRADE: ['admin', 'teacher'],
  EXAMS_DELETE: ['admin'],
  EXAMS_PREVIEW: ['admin'],
  EXAMS_RUN_NOW: ['admin'],

  // Results Management
  RESULTS_VIEW: ['admin', 'teacher', 'student'],
  RESULTS_CREATE: ['admin', 'teacher'],
  RESULTS_EDIT: ['admin', 'teacher'],

  // Reports
  REPORTS_VIEW: ['admin', 'teacher', 'accountant'],
  REPORTS_FINANCIAL: ['admin', 'accountant'],
  REPORTS_ACADEMIC: ['admin', 'teacher'],

  // Faculty Management
  FACULTY_VIEW: ['admin'],
  FACULTY_CREATE: ['admin'],
  FACULTY_EDIT: ['admin'],
  FACULTY_DELETE: ['admin'],

  // Inventory Management
  INVENTORY_VIEW: ['admin', 'clerk', 'librarian'],
  INVENTORY_MANAGE: ['admin', 'clerk'],

  // System Administration
  SYSTEM_SETTINGS: ['admin'],
  USER_ROLES: ['admin'],
  COLLEGE_SETTINGS: ['admin']
} as const;

// Component-level permission wrapper
interface PermissionWrapperProps {
  children: React.ReactNode;
  permission: keyof typeof PERMISSIONS;
  fallback?: React.ReactNode;
}

export function PermissionWrapper({ children, permission, fallback }: PermissionWrapperProps) {
  const allowedRoles = PERMISSIONS[permission];
  
  return (
    <RoleGuard allowedRoles={allowedRoles} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

// Hook for checking permissions in components
export function usePermissions() {
  const { userRole } = useAuth();

  const hasPermission = (permission: keyof typeof PERMISSIONS): boolean => {
    if (userRole === 'super_admin') return true;
    
    const allowedRoles = [...PERMISSIONS[permission]] as string[];
    return userRole ? allowedRoles.includes(userRole) : false;
  };

  const hasAnyPermission = (permissions: Array<keyof typeof PERMISSIONS>): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Array<keyof typeof PERMISSIONS>): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole
  };
}

// Feature flag system for gradual rollout
export const FEATURE_FLAGS = {
  ADVANCED_REPORTS: ['admin'],
  BULK_OPERATIONS: ['admin', 'clerk'],
  REAL_TIME_NOTIFICATIONS: ['admin', 'teacher'],
  MOBILE_APP_ACCESS: ['admin', 'teacher', 'student'],
  AUTOMATED_CERTIFICATES: ['admin'],
  PARENT_PORTAL: ['admin', 'teacher', 'student'],
} as const;

export function useFeatureFlags() {
  const { userRole } = useAuth();

  const hasFeatureAccess = (feature: keyof typeof FEATURE_FLAGS): boolean => {
    if (userRole === 'super_admin') return true;
    
    const allowedRoles = [...FEATURE_FLAGS[feature]] as string[];
    return userRole ? allowedRoles.includes(userRole) : false;
  };

  return { hasFeatureAccess };
}
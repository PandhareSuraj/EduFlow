import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while authentication is being checked OR while userRole is being fetched
  if (loading || (user && userRole === null && (requiredRole || allowedRoles))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return null;
  }

  // Check role-based access if required
  const hasAccess = () => {
    // No role restrictions
    if (!requiredRole && !allowedRoles) return true;
    
    // Super admin and admin always have access
    if (userRole === 'super_admin' || userRole === 'admin') return true;
    
    // Check single required role
    if (requiredRole && userRole === requiredRole) return true;
    
    // Check multiple allowed roles
    if (allowedRoles && allowedRoles.includes(userRole || '')) return true;
    
    return false;
  };

  if ((requiredRole || allowedRoles) && !hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Required: {requiredRole || (allowedRoles ? allowedRoles.join(', ') : '')}
          </p>
          <p className="text-sm text-muted-foreground">Your role: {userRole}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
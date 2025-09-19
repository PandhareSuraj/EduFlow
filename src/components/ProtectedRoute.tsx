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

  console.log('ProtectedRoute - User:', !!user, 'Loading:', loading, 'UserRole:', userRole, 'Required:', requiredRole || allowedRoles);

  // Show loading while authentication is being checked
  if (loading) {
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

  // If user is authenticated but role is still loading and we need role-based access
  if (user && userRole === null && (requiredRole || allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading user permissions...</p>
          <p className="text-xs text-muted-foreground">This may take a moment...</p>
        </div>
      </div>
    );
  }

  // Check role-based access if required
  const hasAccess = () => {
    // No role restrictions - allow access
    if (!requiredRole && !allowedRoles) return true;
    
    // If role is still null after loading and we need role-based access, deny
    if (userRole === null) return false;
    
    // Super admin always has access
    if (userRole === 'super_admin') return true;
    
    // Check single required role
    if (requiredRole && userRole === requiredRole) return true;
    
    // Check multiple allowed roles
    if (allowedRoles && allowedRoles.includes(userRole)) return true;
    
    return false;
  };

  // Only show access denied if we actually have role restrictions
  if ((requiredRole || allowedRoles) && !hasAccess()) {
    console.log('Access denied - User role:', userRole, 'Required:', requiredRole || allowedRoles);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Required role:</strong> {requiredRole || (allowedRoles ? allowedRoles.join(', ') : '')}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Your current role:</strong> {userRole || 'No role assigned'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact your administrator if you believe this is an error.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
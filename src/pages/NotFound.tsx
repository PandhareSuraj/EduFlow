import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import eduflowLogo from "@/assets/eduflow-logo.png";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  useEffect(() => {
    // Log 404 in development only
    if (import.meta.env.DEV) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  // Determine where to redirect based on user role
  const getHomeRoute = () => {
    if (!user) return "/";
    if (userRole === "student") return "/student-profile";
    return "/dashboard";
  };

  // Get suggested pages based on role
  const getSuggestedPages = () => {
    if (!user) {
      return [
        { label: "Home", path: "/", icon: Home },
        { label: "Product Tour", path: "/product-tour", icon: Search },
        { label: "Sign In", path: "/auth", icon: ArrowLeft },
      ];
    }

    if (userRole === "student") {
      return [
        { label: "My Profile", path: "/student-profile", icon: Home },
        { label: "My Results", path: "/student-results", icon: FileQuestion },
        { label: "My Tests", path: "/student-tests", icon: Search },
      ];
    }

    if (userRole === "super_admin") {
      return [
        { label: "Dashboard", path: "/dashboard", icon: Home },
        { label: "College Management", path: "/colleges", icon: FileQuestion },
        { label: "System Analytics", path: "/system-analytics", icon: Search },
      ];
    }

    return [
      { label: "Dashboard", path: "/dashboard", icon: Home },
      { label: "Students", path: "/students", icon: FileQuestion },
      { label: "Courses", path: "/courses", icon: Search },
    ];
  };

  const suggestedPages = getSuggestedPages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-elegant">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={eduflowLogo} 
              alt="EduFlow" 
              className="h-24 w-auto opacity-80"
            />
          </div>
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-5xl font-bold text-muted-foreground">404</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            The page you're looking for doesn't exist or has been moved.
            <span className="block mt-2 text-sm font-mono text-muted-foreground/70">
              {location.pathname}
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate(getHomeRoute())} 
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              {user ? "Go to Dashboard" : "Go Home"}
            </Button>
          </div>

          {/* Suggested Pages */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Perhaps you were looking for:
            </p>
            <div className="grid gap-2">
              {suggestedPages.map((page) => (
                <Button
                  key={page.path}
                  variant="ghost"
                  className="justify-start h-auto py-3"
                  onClick={() => navigate(page.path)}
                >
                  <page.icon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{page.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
            If you believe this is an error, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;

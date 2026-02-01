import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  CreditCard, 
  BookOpen, 
  Menu,
  FileText,
  ClipboardCheck,
  User
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface BottomNavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  action?: () => void;
}

export function BottomNavigation() {
  const isMobile = useIsMobile();
  const { userRole } = useAuth();
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  const items = useMemo((): BottomNavItem[] => {
    // Student-specific navigation
    if (userRole === 'student') {
      return [
        { label: 'Home', icon: Home, href: '/dashboard' },
        { label: 'Courses', icon: BookOpen, href: '/student-course' },
        { label: 'Results', icon: FileText, href: '/student-results' },
        { label: 'Tests', icon: ClipboardCheck, href: '/student-tests' },
        { label: 'Profile', icon: User, href: '/student-profile' },
      ];
    }
    
    // Admin and other staff roles
    return [
      { label: 'Home', icon: Home, href: '/dashboard' },
      { label: 'Students', icon: Users, href: '/students' },
      { label: 'Fees', icon: CreditCard, href: '/fees' },
      { label: 'Courses', icon: BookOpen, href: '/courses' },
      { label: 'More', icon: Menu, href: '#more' },
    ];
  }, [userRole]);

  const handleNavClick = (item: BottomNavItem, e: React.MouseEvent) => {
    if (item.href === '#more') {
      e.preventDefault();
      setOpenMobile(true);
    }
  };

  // Don't render on desktop or on landing page
  if (!isMobile || location.pathname === '/') return null;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 pb-safe">
        {items.map((item) => {
          const isActive = item.href !== '#more' && location.pathname === item.href;
          const Icon = item.icon;
          
          if (item.href === '#more') {
            return (
              <button
                key={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] min-h-[44px] py-2",
                  "touch-manipulation active:scale-95 transition-transform",
                  "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Open navigation menu"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          }
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] min-h-[44px] py-2",
                "touch-manipulation active:scale-95 transition-transform",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

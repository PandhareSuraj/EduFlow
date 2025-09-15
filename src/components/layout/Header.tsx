import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      console.log('Header: Starting logout process');
      await supabase.auth.signOut();
      console.log('Header: Logout successful, navigating to auth');
      navigate('/auth');
    } catch (error) {
      console.error('Header: Logout error:', error);
      navigate('/auth');
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'teacher': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'clerk': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'librarian': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'accountant': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'assistant': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <header className="bg-card border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9" />
          {!isMobile && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students, courses..."
                className="pl-10 w-48 md:w-64 lg:w-80"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isMobile && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
              3
            </span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center ${isMobile ? 'p-1' : 'space-x-2'} h-8 sm:h-auto`}>
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                  <AvatarFallback className="text-xs">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isMobile && (
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium truncate max-w-32">{user?.email}</p>
                    <div className="flex items-center gap-1">
                      <Badge className={getRoleColor(userRole)} variant="outline">
                        {userRole?.charAt(0).toUpperCase()}{userRole?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isMobile && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Role: {userRole}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
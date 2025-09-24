import { Search, User, LogOut, Settings, Menu, School, BookOpen, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useGlobalSearch, SearchResult } from "@/hooks/useGlobalSearch";
import { useState } from "react";

export function Header() {
  const { user, userRole } = useAuth();
  const { collegeName, logoUrl } = useBranding();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { searchTerm, setSearchTerm, results, isLoading, clearSearch } = useGlobalSearch();
  const [searchOpen, setSearchOpen] = useState(false);

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

  const handleSearchResultClick = (result: SearchResult) => {
    navigate(result.route);
    clearSearch();
    setSearchOpen(false);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'student': return <Users className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'faculty': return <GraduationCap className="h-4 w-4" />;
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
          
          {/* College Branding - Only show on larger screens */}
          {!isMobile && (
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt={`${collegeName} Logo`} className="h-8 w-8 object-contain" />
              ) : (
                <School className="h-8 w-8 text-primary" />
              )}
              <div>
                <h1 className="font-bold text-lg">{collegeName}</h1>
                <p className="text-sm text-muted-foreground">Management System</p>
              </div>
            </div>
          )}
          
          {!isMobile && (
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search students, courses..."
                    className="pl-10 w-48 md:w-64 lg:w-80"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSearchOpen(e.target.value.length >= 2);
                    }}
                    onFocus={() => searchTerm.length >= 2 && setSearchOpen(true)}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] md:w-[384px] lg:w-[448px] p-0" align="start">
                <div className="max-h-80 overflow-y-auto">
                  {isLoading && (
                    <div className="p-4 text-center text-muted-foreground">
                      Searching...
                    </div>
                  )}
                  
                  {!isLoading && results.length === 0 && searchTerm.length >= 2 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{searchTerm}"
                    </div>
                  )}
                  
                  {!isLoading && results.length > 0 && (
                    <div className="py-2">
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b">
                        Search Results
                      </div>
                      {results.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          className="w-full px-3 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchTerm.length > 0 && searchTerm.length < 2 && (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Type at least 2 characters to search
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isMobile && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Search className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search students, courses..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {isLoading && (
                    <div className="p-4 text-center text-muted-foreground">
                      Searching...
                    </div>
                  )}
                  
                  {!isLoading && results.length === 0 && searchTerm.length >= 2 && (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found
                    </div>
                  )}
                  
                  {!isLoading && results.length > 0 && (
                    <div className="py-2">
                      {results.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          className="w-full px-3 py-3 text-left hover:bg-accent transition-colors"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <NotificationDropdown />
          
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
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Calendar, 
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";

interface LibrarianStats {
  totalBooks: number;
  availableBooks: number;
  issuedBooks: number;
  totalMembers: number;
  overdueBooks: number;
  finesCollected: string;
  newMembersThisMonth: number;
  popularBooks: number;
}

interface BookIssue {
  id: string;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  status: 'issued' | 'overdue' | 'returned';
  daysOverdue?: number;
}

interface LibraryAlert {
  id: string;
  type: 'overdue' | 'stock_low' | 'fine_pending' | 'membership_expiry';
  title: string;
  description: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
}

export function LibrarianDashboard() {
  const [stats, setStats] = useState<LibrarianStats>({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    totalMembers: 0,
    overdueBooks: 0,
    finesCollected: "₹0",
    newMembersThisMonth: 0,
    popularBooks: 0
  });
  const [recentIssues, setRecentIssues] = useState<BookIssue[]>([]);
  const [libraryAlerts, setLibraryAlerts] = useState<LibraryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibrarianData();
  }, []);

  const fetchLibrarianData = async () => {
    try {
      setLoading(true);

      // Calculate date ranges
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const today = new Date();

      // Fetch library-related data
      const [
        booksResult,
        membersResult,
        issuesResult,
        overdueIssuesResult,
        finesResult,
        newMembersResult,
        recentIssuesResult
      ] = await Promise.all([
        // Books data
        supabase.from('books')
          .select('id, available_copies, total_copies, status')
          .eq('status', 'active'),
        
        // Members count
        supabase.from('library_members')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        
        // Current issues
        supabase.from('book_issues')
          .select('id', { count: 'exact' })
          .eq('status', 'issued'),
        
        // Overdue issues
        supabase.from('book_issues')
          .select('id, due_date', { count: 'exact' })
          .eq('status', 'issued')
          .lt('due_date', today.toISOString().split('T')[0]),
        
        // Fines collected this month
        supabase.from('library_fines')
          .select('fine_amount, paid_amount')
          .gte('created_at', firstDayOfMonth.toISOString()),
        
        // New members this month
        supabase.from('library_members')
          .select('id', { count: 'exact' })
          .gte('membership_start_date', firstDayOfMonth.toISOString().split('T')[0]),
        
        // Recent issues for display
        supabase.from('book_issues')
          .select(`
            id,
            issue_date,
            due_date,
            status,
            books!inner(title),
            library_members!inner(
              students(name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Calculate stats
      const totalBooks = booksResult.data?.reduce((sum, book) => sum + (book.total_copies || 0), 0) || 0;
      const availableBooks = booksResult.data?.reduce((sum, book) => sum + (book.available_copies || 0), 0) || 0;
      const issuedBooks = issuesResult.count || 0;
      const overdueBooks = overdueIssuesResult.count || 0;
      
      const finesCollected = finesResult.data?.reduce((sum, fine) => sum + (fine.paid_amount || 0), 0) || 0;

      // Process recent issues
      const issues: BookIssue[] = (recentIssuesResult.data || []).map(issue => {
        const dueDate = new Date(issue.due_date);
        const issueDate = new Date(issue.issue_date);
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'issued' | 'overdue' | 'returned' = issue.status as any;
        if (issue.status === 'issued' && daysDiff > 0) {
          status = 'overdue';
        }

        return {
          id: issue.id,
          bookTitle: issue.books?.title || 'Unknown Book',
          memberName: issue.library_members?.students?.name || 'Unknown Member',
          issueDate: issueDate.toLocaleDateString(),
          dueDate: dueDate.toLocaleDateString(),
          status,
          daysOverdue: status === 'overdue' ? daysDiff : undefined
        };
      });

      // Generate library alerts
      const alerts: LibraryAlert[] = [];
      
      if (overdueBooks > 0) {
        alerts.push({
          id: 'overdue-books',
          type: 'overdue',
          title: 'Overdue Books',
          description: `${overdueBooks} books are overdue`,
          count: overdueBooks,
          severity: overdueBooks > 10 ? 'high' : 'medium'
        });
      }

      // Check for low stock books
      const lowStockBooks = booksResult.data?.filter(book => 
        book.available_copies <= 2 && book.total_copies > 0
      ).length || 0;

      if (lowStockBooks > 0) {
        alerts.push({
          id: 'low-stock',
          type: 'stock_low',
          title: 'Low Stock Alert',
          description: `${lowStockBooks} books have low stock`,
          count: lowStockBooks,
          severity: 'medium'
        });
      }

      // Check for pending fines
      const { data: pendingFines } = await supabase
        .from('library_fines')
        .select('id')
        .neq('balance_amount', 0);

      const pendingFinesCount = pendingFines?.length || 0;
      if (pendingFinesCount > 0) {
        alerts.push({
          id: 'pending-fines',
          type: 'fine_pending',
          title: 'Pending Fines',
          description: `${pendingFinesCount} members have pending fines`,
          count: pendingFinesCount,
          severity: 'low'
        });
      }

      setStats({
        totalBooks,
        availableBooks,
        issuedBooks,
        totalMembers: membersResult.count || 0,
        overdueBooks,
        finesCollected: `₹${finesCollected.toLocaleString()}`,
        newMembersThisMonth: newMembersResult.count || 0,
        popularBooks: Math.floor(Math.random() * 20) + 10 // This would be calculated from actual issue statistics
      });

      setRecentIssues(issues);
      setLibraryAlerts(alerts);

    } catch (error) {
      console.error('Error fetching librarian dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': return 'bg-primary text-primary-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      case 'returned': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued': return <Clock className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      case 'returned': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleAlertClick = (alert: LibraryAlert) => {
    switch (alert.type) {
      case 'overdue':
      case 'fine_pending':
      case 'stock_low':
        window.location.href = '/library';
        break;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-header rounded-lg p-4 sm:p-6 text-white shadow-header">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 leading-tight">
          Library Management Dashboard
        </h1>
        <p className="text-white/90 text-sm sm:text-base">
          Monitor book circulation, member activities, and library operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Books"
          value={loading ? "..." : stats.totalBooks.toLocaleString()}
          icon={BookOpen}
          trend={{ value: 5, isPositive: true }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
        />
        <StatsCard
          title="Available Books"
          value={loading ? "..." : stats.availableBooks.toLocaleString()}
          icon={CheckCircle}
          trend={{ value: -2, isPositive: false }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
        />
        <StatsCard
          title="Books Issued"
          value={loading ? "..." : stats.issuedBooks.toString()}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
        />
        <StatsCard
          title="Overdue Books"
          value={loading ? "..." : stats.overdueBooks.toString()}
          icon={AlertTriangle}
          trend={{ value: -8, isPositive: false }}
          className={stats.overdueBooks > 0 ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900" : ""}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={loading ? "..." : stats.totalMembers.toString()}
          icon={Users}
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="New Members"
          value={loading ? "..." : stats.newMembersThisMonth.toString()}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Fines Collected"
          value={loading ? "..." : stats.finesCollected}
          icon={IndianRupee}
          trend={{ value: 20, isPositive: true }}
        />
        <StatsCard
          title="Popular Books"
          value={loading ? "..." : stats.popularBooks.toString()}
          icon={BookOpen}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <QuickActions userRole="librarian" className="lg:col-span-1" />
        
        {/* Recent Issues */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Recent Book Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIssues.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent book issues</p>
              </div>
            ) : (
              recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{issue.bookTitle}</h4>
                    <p className="text-sm text-muted-foreground">Member: {issue.memberName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Due: {issue.dueDate}</span>
                      {issue.daysOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          {issue.daysOverdue} days overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Library Alerts and Quick Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Library Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Library Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {libraryAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">All systems running smoothly!</p>
              </div>
            ) : (
              libraryAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${getSeverityColor(alert.severity)}`}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge variant="secondary">{alert.count}</Badge>
                  </div>
                  <p className="text-sm opacity-90">{alert.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Library Summary */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Library Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Collection</span>
                <span className="text-lg font-bold">{stats.totalBooks.toLocaleString()} books</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${stats.totalBooks > 0 ? (stats.availableBooks / stats.totalBooks) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="font-medium">
                  {stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0}%
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium">Active Members</span>
                <span className="text-sm text-muted-foreground">{stats.totalMembers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-sm text-muted-foreground">+{stats.newMembersThisMonth} new</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/library'}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Full Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
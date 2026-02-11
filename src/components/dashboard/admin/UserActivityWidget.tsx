import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock,
  Activity,
  UserPlus,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UserActivityStats {
  totalUsers: number;
  recentRegistrations: number;
  recentUsers: Array<{
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export function UserActivityWidget() {
  const [stats, setStats] = useState<UserActivityStats>({
    totalUsers: 0,
    recentRegistrations: 0,
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const fetchUserActivity = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [totalResult, recentResult, recentUsersResult] = await Promise.all([
        supabase.from('user_roles').select('user_id', { count: 'exact' }),
        supabase.from('user_roles').select('user_id', { count: 'exact' })
          .gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('user_roles').select('user_id, role, created_at')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const recentUsers = (recentUsersResult.data || []).map(user => ({
        email: `User ${user.user_id.substring(0, 8)}...`,
        role: user.role,
        createdAt: new Date(user.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));

      setStats({
        totalUsers: totalResult.count || 0,
        recentRegistrations: recentResult.count || 0,
        recentUsers
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default' as const;
      case 'teacher': return 'secondary' as const;
      case 'student': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <Activity className="mr-2 h-5 w-5" />
            User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            User Activity
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">Login tracking requires an audit log. Showing registration data only.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <UserPlus className="h-5 w-5 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold">{stats.recentRegistrations}</p>
            <p className="text-xs text-muted-foreground">New This Week</p>
          </div>
        </div>

        {/* Recent Registrations */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Recently Added Users
          </h4>
          <div className="space-y-2">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent registrations</p>
            ) : (
              stats.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]">{user.email}</span>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

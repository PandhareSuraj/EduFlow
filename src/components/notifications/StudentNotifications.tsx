import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Calendar, DollarSign, CheckCircle } from "lucide-react";
import { useDashboardNotifications } from "@/hooks/useDashboardNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function StudentNotifications() {
  const { notifications, loading, markAsRead } = useDashboardNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (notification: any) => {
    // Enhanced icons for exam notifications with animation for urgent ones
    if (notification.title.includes('Today')) {
      return <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />;
    }
    if (notification.title.includes('Tomorrow')) {
      return <Calendar className="h-5 w-5 text-warning" />;
    }
    if (notification.title.includes('Results')) {
      return <CheckCircle className="h-5 w-5 text-success" />;
    }
    
    // Default type-based icons
    switch (notification.type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <DollarSign className="h-4 w-4 text-warning" />;
      case 'info':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Loading your notifications...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  
  // Sort notifications by urgency: error > warning > success > info
  const sortedNotifications = [...notifications].sort((a, b) => {
    const typeOrder = { error: 0, warning: 1, success: 2, info: 3 };
    const aOrder = typeOrder[a.type as keyof typeof typeOrder] ?? 4;
    const bOrder = typeOrder[b.type as keyof typeof typeOrder] ?? 4;
    
    // If same type, sort by created_at (newest first)
    if (aOrder === bOrder) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    return aOrder - bOrder;
  });
  
  const recentNotifications = sortedNotifications.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive">{unreadNotifications.length}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Your recent notifications and important updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see important updates here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.is_read ? 'bg-muted/30 border-primary/20' : 'border-border'
                } ${
                  notification.type === 'error' && !notification.is_read 
                    ? 'border-destructive/40 shadow-sm' 
                    : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {getNotificationIcon(notification)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    {!notification.is_read && (
                      <div className="h-2 w-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.count > 1 && (
                      <Badge variant="secondary" className="mr-2 text-xs">
                        {notification.count}
                      </Badge>
                    )}
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {notification.action_url && (
                  <Button variant="outline" size="sm" className="ml-2">
                    View
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
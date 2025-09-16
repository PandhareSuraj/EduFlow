import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  title: string;
  message: string;
  count: number;
  type: 'warning' | 'error' | 'info' | 'success';
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  count: number;
  type: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export function useDashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      generateNotifications();
      
      // Set up real-time subscriptions for notifications
      const channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => fetchNotifications()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const typedNotifications: Notification[] = (data || []).map((item: DatabaseNotification) => ({
        ...item,
        type: ['warning', 'error', 'info', 'success'].includes(item.type) 
          ? item.type as 'warning' | 'error' | 'info' | 'success'
          : 'info'
      }));
      
      setNotifications(typedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = async () => {
    try {
      await supabase.rpc('generate_role_based_notifications');
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { 
    notifications, 
    loading, 
    unreadCount,
    refetch: fetchNotifications, 
    markAsRead,
    markAllAsRead,
    generateNotifications
  };
}
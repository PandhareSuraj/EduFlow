import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

// IMPORTANT: Replace this with your actual VAPID public key after generating it
// Generate VAPID keys by running: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      // Check if VAPID key is configured
      if (VAPID_PUBLIC_KEY === 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY') {
        toast.error('Push notifications not configured', {
          description: 'Please configure VAPID keys first. See console for instructions.'
        });
        console.error(`
          ⚠️ VAPID Keys Not Configured ⚠️
          
          To enable push notifications:
          1. Run: npx web-push generate-vapid-keys
          2. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to Supabase secrets
          3. Update VAPID_PUBLIC_KEY in PushNotificationManager.tsx
          
          See: https://github.com/web-push-libs/web-push#command-line
        `);
        return;
      }

      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        toast.error('Permission Denied', {
          description: 'Please enable notifications in your browser settings'
        });
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Get device info
      const deviceInfo = `${navigator.userAgent} | ${navigator.platform}`;

      // Save subscription to database via edge function
      const { error } = await supabase.functions.invoke('save-push-subscription', {
        body: {
          subscription: subscription.toJSON(),
          device_info: deviceInfo
        }
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Push Notifications Enabled!', {
        description: 'You\'ll receive exam updates on your device, even when the app is closed.',
      });
    } catch (error: any) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to Enable Notifications', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase.functions.invoke('remove-push-subscription', {
          body: { user_id: user?.id }
        });
        
        setIsSubscribed(false);
        toast.success('Push Notifications Disabled', {
          description: 'You won\'t receive push notifications anymore'
        });
      }
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to Disable Notifications', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Alert>
        <AlertDescription>
          Push notifications are not supported on this device or browser.
        </AlertDescription>
      </Alert>
    );
  }

  if (permission === 'denied') {
    return (
      <Alert>
        <AlertDescription>
          Push notifications are blocked. Please enable them in your browser settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isSubscribed ? (
            <BellOff className="h-4 w-4 mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          {isSubscribed ? 'Disable Push Notifications' : 'Enable Push Notifications'}
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {isSubscribed 
          ? '✓ Push notifications are enabled. You\'ll receive exam reminders on your device.' 
          : 'Enable push notifications to receive exam updates directly on your device, even when the app is closed.'}
      </p>
    </div>
  );
}

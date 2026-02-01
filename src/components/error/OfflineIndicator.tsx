import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();
  const wasOffline = useRef(false);

  useEffect(() => {
    // Show success toast when coming back online
    if (isOnline && wasOffline.current) {
      toast({
        title: "You're back online",
        description: "Your connection has been restored.",
      });
    }
    wasOffline.current = !isOnline;
  }, [isOnline, toast]);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">
        You're offline. Please check your internet connection.
      </span>
    </div>
  );
}

export default OfflineIndicator;

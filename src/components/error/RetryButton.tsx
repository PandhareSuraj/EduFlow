import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetryButtonProps {
  onClick: () => Promise<void> | void;
  label?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

export function RetryButton({ 
  onClick, 
  label = "Try Again",
  size = "sm",
  variant = "outline",
  className
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onClick();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleRetry} 
      disabled={isRetrying}
      className={cn("gap-2", className)}
    >
      <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
      {isRetrying ? "Retrying..." : label}
    </Button>
  );
}

export default RetryButton;

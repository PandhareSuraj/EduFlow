import { useState, useRef, useCallback } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  disabled = false,
  className 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isMobile = useIsMobile();
  
  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only start pulling if scrolled to top
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, Math.min(currentY - startY.current, 120));
    
    if (distance > 0) {
      setPullDistance(distance);
      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (pullDistance >= threshold && !disabled) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh, disabled]);

  // On desktop, just render children without pull-to-refresh
  if (!isMobile) {
    return <>{children}</>;
  }

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10 transition-all duration-200",
          "pointer-events-none"
        )}
        style={{ 
          transform: `translate(-50%, ${Math.max(pullDistance - 50, -50)}px)`,
          opacity: pullProgress
        }}
        aria-hidden="true"
      >
        <div className="bg-background rounded-full p-2 shadow-md border">
          {isRefreshing ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ArrowDown 
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-200",
                shouldTrigger && "rotate-180 text-primary"
              )} 
            />
          )}
        </div>
      </div>
      
      {/* Content with transform for pull effect */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: isPulling ? `translateY(${pullDistance * 0.4}px)` : undefined 
        }}
      >
        {children}
      </div>
      
      {/* Screen reader announcement */}
      {isRefreshing && (
        <div className="sr-only" role="status" aria-live="polite">
          Refreshing content...
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileTableWrapperProps {
  children: React.ReactNode;
  showScrollHint?: boolean;
  className?: string;
}

export function MobileTableWrapper({ 
  children, 
  showScrollHint = true,
  className 
}: MobileTableWrapperProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const hasOverflow = scrollWidth > clientWidth;
      
      setCanScrollLeft(hasOverflow && scrollLeft > 5);
      setCanScrollRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      
      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  // Re-check scroll when children change
  useEffect(() => {
    // Delay to allow table to render
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [children, checkScroll]);

  return (
    <div className={cn("relative", className)}>
      {/* Left scroll gradient */}
      {isMobile && showScrollHint && canScrollLeft && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      )}
      
      {/* Scrollable container */}
      <div 
        ref={scrollRef}
        className={cn(
          "overflow-x-auto",
          isMobile && "-mx-3 px-3 sm:-mx-4 sm:px-4"
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
        tabIndex={0}
        role="region"
        aria-label="Scrollable table"
      >
        {children}
      </div>
      
      {/* Right scroll gradient */}
      {isMobile && showScrollHint && canScrollRight && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      )}
      
      {/* Scroll hint for screen readers */}
      {isMobile && (canScrollLeft || canScrollRight) && (
        <div className="sr-only">
          Table can be scrolled horizontally
        </div>
      )}
    </div>
  );
}

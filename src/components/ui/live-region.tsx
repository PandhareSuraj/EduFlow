import * as React from "react";

interface LiveRegionProps {
  children: React.ReactNode;
  /** 
   * The politeness level of the live region:
   * - "polite": announcements wait for user to stop interacting (default)
   * - "assertive": interrupts the user immediately
   */
  mode?: 'polite' | 'assertive';
  /** Whether the entire region should be announced as a single unit */
  atomic?: boolean;
  /** Optional className for styling (defaults to sr-only) */
  className?: string;
}

/**
 * ARIA live region component for dynamic content announcements to screen readers.
 * Use for toast notifications, loading states, form validation messages, etc.
 */
export function LiveRegion({ 
  children, 
  mode = 'polite',
  atomic = true,
  className = 'sr-only'
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={mode}
      aria-atomic={atomic}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Hook to announce messages to screen readers programmatically
 */
export function useAnnounce() {
  const announce = React.useCallback((message: string, mode: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', mode);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    // Remove after announcement is made
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }, []);
  
  return announce;
}

export default LiveRegion;

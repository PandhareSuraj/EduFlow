import { useEffect } from 'react';

/**
 * Hook to update document title and announce page changes to screen readers
 * @param title - The page title to display
 * @param suffix - Optional suffix (defaults to "EduFlow")
 */
export function usePageTitle(title: string, suffix: string = "EduFlow") {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${suffix}` : suffix;
    const previousTitle = document.title;
    document.title = fullTitle;
    
    // Announce page change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${title}`;
    document.body.appendChild(announcement);
    
    // Clean up announcement after it's been read
    const cleanupTimeout = setTimeout(() => {
      announcement.remove();
    }, 1000);
    
    return () => {
      document.title = previousTitle;
      clearTimeout(cleanupTimeout);
      if (announcement.parentNode) {
        announcement.remove();
      }
    };
  }, [title, suffix]);
}

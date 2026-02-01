import * as React from "react";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** HTML element to render (default: span) */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Component to hide content visually while keeping it accessible to screen readers.
 * Uses the sr-only class from Tailwind CSS.
 */
export function VisuallyHidden({ 
  children, 
  as: Component = 'span' 
}: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

export default VisuallyHidden;

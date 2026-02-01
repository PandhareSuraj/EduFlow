import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputMode, ...props }, ref) => {
    // Auto-derive inputMode based on type if not explicitly provided
    const derivedInputMode = inputMode ?? 
      (type === 'email' ? 'email' : 
       type === 'tel' ? 'tel' : 
       type === 'number' ? 'numeric' : 
       type === 'url' ? 'url' :
       type === 'search' ? 'search' : undefined);

    return (
      <input
        type={type}
        inputMode={derivedInputMode}
        className={cn(
          // Base styles with mobile-first approach
          "flex h-10 min-h-[44px] md:min-h-0 w-full rounded-md border border-input bg-background px-3 py-2",
          // 16px font on mobile to prevent iOS zoom, 14px on desktop
          "text-base md:text-sm",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          // Placeholder and focus states
          "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Touch optimization
          "touch-manipulation",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

import { Loader2 } from "lucide-react"
import eduflowLogo from "@/assets/eduflow-logo.png"

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        {/* Logo */}
        <img 
          src={eduflowLogo} 
          alt="EduFlow" 
          className="h-24 w-auto animate-pulse"
        />
        
        {/* Spinner */}
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-primary/20" />
        </div>
        
        {/* Loading text with animated dots */}
        <div className="flex items-center space-x-1 text-muted-foreground">
          <span>{message}</span>
          <span className="flex space-x-1">
            <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function PageLoaderInline({ message = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

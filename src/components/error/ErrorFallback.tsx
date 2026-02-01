import { ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import eduflowLogo from '@/assets/eduflow-logo.png';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

export function ErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-elegant border-destructive/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={eduflowLogo} 
              alt="EduFlow" 
              className="h-16 w-auto opacity-80"
            />
          </div>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            We're sorry, but something unexpected happened. Please try refreshing the page or return to the home page.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onReset} 
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              onClick={handleGoHome} 
              variant="outline"
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          <Button 
            onClick={handleRefresh} 
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Refresh Page
          </Button>

          {/* Error details - only in development */}
          {isDevelopment && error && (
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Error Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Error Details (Dev Only)
                  </>
                )}
              </button>
              
              {showDetails && (
                <div className="mt-4 p-4 bg-muted rounded-lg overflow-auto max-h-64">
                  <p className="text-sm font-mono text-destructive mb-2">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  )}
                  {errorInfo?.componentStack && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap mt-2 pt-2 border-t border-border">
                      Component Stack:{errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorFallback;

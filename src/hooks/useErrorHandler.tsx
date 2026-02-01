import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

type ErrorType = 'network' | 'auth' | 'permission' | 'validation' | 'notFound' | 'server' | 'unknown';

interface ErrorOptions {
  userMessage?: string;
  retry?: () => void;
  silent?: boolean;
  redirectTo?: string;
}

interface ParsedError {
  type: ErrorType;
  message: string;
  status?: number;
  originalError: unknown;
}

// Error classification helpers
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('failed to fetch') ||
           message.includes('connection') ||
           message.includes('offline');
  }
  return false;
}

function isAuthError(error: unknown): boolean {
  if (hasStatus(error, 401) || hasStatus(error, 403)) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('jwt expired') ||
           message.includes('session expired') ||
           message.includes('not authenticated') ||
           message.includes('unauthorized') ||
           message.includes('invalid token');
  }
  return false;
}

function isPermissionError(error: unknown): boolean {
  if (hasStatus(error, 403)) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('permission denied') ||
           message.includes('access denied') ||
           message.includes('forbidden') ||
           message.includes('not allowed');
  }
  return false;
}

function isValidationError(error: unknown): boolean {
  if (hasStatus(error, 400) || hasStatus(error, 422)) {
    return true;
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('validation') ||
           message.includes('invalid input') ||
           message.includes('required field');
  }
  return false;
}

function isNotFoundError(error: unknown): boolean {
  return hasStatus(error, 404);
}

function isServerError(error: unknown): boolean {
  const status = getStatus(error);
  return status !== undefined && status >= 500;
}

function hasStatus(error: unknown, status: number): boolean {
  return getStatus(error) === status;
}

function getStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if ('code' in error && typeof error.code === 'number') {
      return error.code;
    }
  }
  return undefined;
}

function classifyError(error: unknown): ParsedError {
  const message = error instanceof Error ? error.message : String(error);
  
  if (isNetworkError(error)) {
    return { type: 'network', message, originalError: error };
  }
  if (isAuthError(error)) {
    return { type: 'auth', message, status: getStatus(error), originalError: error };
  }
  if (isPermissionError(error)) {
    return { type: 'permission', message, status: 403, originalError: error };
  }
  if (isValidationError(error)) {
    return { type: 'validation', message, status: getStatus(error), originalError: error };
  }
  if (isNotFoundError(error)) {
    return { type: 'notFound', message, status: 404, originalError: error };
  }
  if (isServerError(error)) {
    return { type: 'server', message, status: getStatus(error), originalError: error };
  }
  
  return { type: 'unknown', message, originalError: error };
}

const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string }> = {
  network: {
    title: "Network Error",
    description: "Please check your internet connection and try again."
  },
  auth: {
    title: "Session Expired",
    description: "Your session has expired. Please log in again."
  },
  permission: {
    title: "Access Denied",
    description: "You don't have permission to perform this action."
  },
  validation: {
    title: "Validation Error",
    description: "Please check your input and try again."
  },
  notFound: {
    title: "Not Found",
    description: "The requested resource could not be found."
  },
  server: {
    title: "Server Error",
    description: "Something went wrong on our end. Please try again later."
  },
  unknown: {
    title: "Error",
    description: "Something went wrong. Please try again."
  }
};

export function useErrorHandler() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleError = useCallback((error: unknown, options?: ErrorOptions) => {
    const parsed = classifyError(error);
    
    // Log in development
    if (import.meta.env.DEV) {
      console.error(`[${parsed.type.toUpperCase()}]`, error);
    }

    // Silent mode - just log, don't show toast
    if (options?.silent) {
      return parsed;
    }

    // Get error message
    const errorInfo = ERROR_MESSAGES[parsed.type];
    const title = errorInfo.title;
    const description = options?.userMessage || errorInfo.description;

    // Handle auth errors with redirect
    if (parsed.type === 'auth') {
      const currentPath = window.location.pathname;
      toast({
        title,
        description,
        variant: "destructive",
      });
      navigate(`/auth?redirect=${encodeURIComponent(currentPath)}`);
      return parsed;
    }

    // Handle custom redirect
    if (options?.redirectTo) {
      toast({
        title,
        description,
        variant: "destructive",
      });
      navigate(options.redirectTo);
      return parsed;
    }

    // Show toast with optional retry
    toast({
      title,
      description,
      variant: "destructive",
      action: options?.retry ? (
        <ToastAction altText="Try again" onClick={options.retry}>
          Try Again
        </ToastAction>
      ) : undefined,
    });

    return parsed;
  }, [toast, navigate]);

  const showSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  const showError = useCallback((message: string, title: string = "Error") => {
    toast({
      title,
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const showInfo = useCallback((message: string, title: string = "Info") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  return {
    handleError,
    showSuccess,
    showError,
    showInfo,
    classifyError,
    isNetworkError,
    isAuthError,
    isPermissionError,
  };
}

export default useErrorHandler;

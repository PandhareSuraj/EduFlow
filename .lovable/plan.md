

# Comprehensive Error Handling Implementation

## Overview

This plan adds robust error handling throughout the EduFlow application including a global error boundary, network status detection, session expiration handling, enhanced toast notifications, and a user-friendly 404 page.

---

## Current State Analysis

| Component | Current Status | Gap |
|-----------|---------------|-----|
| Error Boundary | Not implemented | No React error catching |
| Toast System | Exists (dual: useToast + Sonner) | Inconsistent usage, no standardized helpers |
| Network Detection | Not implemented | No offline/online detection |
| Session Expiration | Basic auth state | No proactive session refresh handling |
| 404 Page | Basic implementation | Missing navigation, styling, suggestions |
| Loading States | Inconsistent | Some components lack loading feedback |
| Retry Logic | Minimal | Most operations don't offer retry |

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/components/error/ErrorBoundary.tsx` | Global React error boundary |
| Create | `src/components/error/ErrorFallback.tsx` | User-friendly error display |
| Create | `src/components/error/OfflineIndicator.tsx` | Network status banner |
| Create | `src/hooks/useNetworkStatus.tsx` | Online/offline detection hook |
| Create | `src/hooks/useErrorHandler.tsx` | Centralized error handling utilities |
| Modify | `src/App.tsx` | Wrap with ErrorBoundary, add network monitoring |
| Modify | `src/pages/NotFound.tsx` | Enhanced 404 page with navigation |
| Modify | `src/hooks/useAuth.tsx` | Add session expiration detection |

---

## Implementation Details

### 1. Global Error Boundary Component

Create a React Error Boundary that catches JavaScript errors anywhere in the component tree:

**Features:**
- Catches render errors, lifecycle errors, and errors in constructors
- Shows user-friendly message instead of white screen
- Provides "Try Again" button to reset the app
- Logs errors to console in development only
- Includes error details in collapsible section for debugging

**Key Code Pattern:**
```tsx
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.resetError} />;
    }
    return this.props.children;
  }
}
```

### 2. Error Fallback Component

A friendly UI shown when errors occur:

- EduFlow branding maintained
- Clear message: "Something went wrong"
- Description: "We're sorry, but something unexpected happened. Please try refreshing the page."
- Retry button to reset the error boundary
- Link to return home
- Optional: Show error details in development mode

### 3. Network Status Hook and Indicator

Detect online/offline status and show persistent banner:

**Hook Features:**
- Uses `navigator.onLine` for initial state
- Listens to `online`/`offline` events
- Returns `{ isOnline, isOffline }`

**Offline Banner:**
- Fixed position at top of screen
- Yellow/warning styling
- Message: "You're offline. Please check your internet connection."
- Auto-hides when connection restored with success toast

### 4. Centralized Error Handler Hook

Create standardized error handling utilities:

```tsx
function useErrorHandler() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleError = (error: unknown, options?: ErrorOptions) => {
    const message = parseErrorMessage(error);
    
    // Handle specific error types
    if (isNetworkError(error)) {
      toast({ title: "Network Error", description: "Please check your connection.", variant: "destructive" });
      return;
    }
    
    if (isAuthError(error)) {
      toast({ title: "Session Expired", description: "Please log in again.", variant: "destructive" });
      navigate('/auth');
      return;
    }
    
    if (isPermissionError(error)) {
      toast({ title: "Access Denied", description: "You don't have permission to perform this action.", variant: "destructive" });
      return;
    }
    
    // Generic error
    toast({ 
      title: "Error", 
      description: options?.userMessage || "Something went wrong. Please try again.", 
      variant: "destructive",
      action: options?.retry ? <RetryButton onClick={options.retry} /> : undefined
    });
  };
  
  return { handleError, showSuccess, showLoading };
}
```

**Error Classification:**
- Network errors: `TypeError: Failed to fetch`, `NetworkError`
- Auth errors: 401, 403, `JWT expired`, `session expired`
- Permission errors: `permission denied`, `access denied`
- Validation errors: 400, `validation failed`
- Server errors: 500+, `internal server error`

### 5. Session Expiration Handling

Enhance the AuthProvider to detect and handle session expiration:

**Changes to useAuth.tsx:**
- Listen for `TOKEN_REFRESHED` event from Supabase
- Detect `SIGNED_OUT` due to session expiration
- Show toast notification when session expires
- Redirect to login page with return URL
- Clear local state immediately

**Pattern:**
```tsx
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' && !intentionalSignOut) {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please log in again.",
      variant: "destructive"
    });
    navigate('/auth?redirect=' + window.location.pathname);
  }
});
```

### 6. Enhanced 404 Page

Improve the NotFound page with better UX:

**Features:**
- EduFlow branding and styling
- Clear 404 heading with friendly message
- Navigation suggestions based on user role
- Search functionality (optional)
- Animated illustration
- "Go to Dashboard" and "Go Home" buttons
- Recent pages visited (if available)

### 7. QueryClient Configuration

Configure React Query with sensible defaults:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (isClientError(error)) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        // Global error handling for queries
        console.error('Query error:', error);
      }
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Global error handling for mutations
        console.error('Mutation error:', error);
      }
    }
  }
});
```

---

## Error Message Mapping

| Error Type | User Message |
|------------|--------------|
| Network offline | "You're offline. Please check your connection." |
| Network timeout | "The request timed out. Please try again." |
| Session expired | "Your session has expired. Please log in again." |
| Permission denied | "You don't have access to this resource." |
| Not found (404) | "The page you're looking for doesn't exist." |
| Validation error | "Please check your input and try again." |
| Server error (500) | "Something went wrong on our end. Please try again later." |
| Generic error | "Something went wrong. Please try again." |

---

## Toast Notification Patterns

Standardize toast usage across the app:

**Success Pattern:**
```tsx
toast({
  title: "Success",
  description: "Data saved successfully",
});
```

**Error Pattern:**
```tsx
toast({
  title: "Error", 
  description: "Something went wrong. Please try again.",
  variant: "destructive",
  action: <ToastAction onClick={retry}>Try Again</ToastAction>
});
```

**Loading Pattern:**
Use loading states in buttons/components rather than toasts for operations under 2 seconds.

---

## Retry Button Component

Create a reusable retry button for failed operations:

```tsx
function RetryButton({ onClick, label = "Try Again" }: RetryButtonProps) {
  const [retrying, setRetrying] = useState(false);
  
  const handleRetry = async () => {
    setRetrying(true);
    await onClick();
    setRetrying(false);
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
      <RefreshCw className={cn("h-4 w-4 mr-2", retrying && "animate-spin")} />
      {retrying ? "Retrying..." : label}
    </Button>
  );
}
```

---

## App.tsx Structure After Changes

```tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <CollegeProvider>
            <ThemeProvider>
              <NetworkStatusProvider>
                <Toaster />
                <Sonner />
                <OfflineIndicator />
                <BrowserRouter>
                  <Routes>
                    {/* ... routes ... */}
                  </Routes>
                </BrowserRouter>
              </NetworkStatusProvider>
            </ThemeProvider>
          </CollegeProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);
```

---

## File Structure

```text
src/
├── components/
│   └── error/
│       ├── ErrorBoundary.tsx       # Class component for error catching
│       ├── ErrorFallback.tsx       # UI for error state
│       ├── OfflineIndicator.tsx    # Network status banner
│       ├── RetryButton.tsx         # Reusable retry button
│       └── index.ts                # Exports
├── hooks/
│   ├── useNetworkStatus.tsx        # Online/offline detection
│   └── useErrorHandler.tsx         # Centralized error utilities
├── pages/
│   └── NotFound.tsx                # Enhanced 404 page
└── App.tsx                         # Updated with error boundary
```

---

## Implementation Checklist

1. Create ErrorBoundary class component with error catching
2. Create ErrorFallback with user-friendly UI and retry button
3. Create useNetworkStatus hook with event listeners
4. Create OfflineIndicator component with fixed banner
5. Create useErrorHandler hook with error classification
6. Update useAuth.tsx with session expiration detection
7. Update App.tsx to wrap everything in ErrorBoundary
8. Update QueryClient with retry configuration
9. Enhance NotFound.tsx with navigation and styling
10. Create RetryButton component for failed operations

---

## Behavior Summary

| Scenario | User Experience |
|----------|-----------------|
| React component error | Shows ErrorFallback with "Try Again" button |
| Network goes offline | Yellow banner appears at top with message |
| Network comes online | Banner disappears, success toast shown |
| Session expires | Toast notification, redirect to login |
| Permission denied | Toast with access denied message |
| 404 page | Friendly page with navigation options |
| API call fails | Toast with error + optional retry button |
| Mutation succeeds | Toast with success message |


import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingContextType {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  isTourRunning: boolean;
  currentStepIndex: number;
  setHasSeenWelcome: (value: boolean) => void;
  setHasCompletedTour: (value: boolean) => void;
  startTour: () => void;
  stopTour: () => void;
  skipTour: () => void;
  restartTour: () => void;
  setCurrentStepIndex: (index: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const getStorageKey = (userId: string | undefined, key: string) => {
  return `onboarding_${userId || 'anonymous'}_${key}`;
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const [hasSeenWelcome, setHasSeenWelcomeState] = useState(true); // Default true to prevent flash
  const [hasCompletedTour, setHasCompletedTourState] = useState(true);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Load onboarding state from localStorage when user is available
  useEffect(() => {
    if (!loading && user && userRole) {
      const welcomeKey = getStorageKey(user.id, 'hasSeenWelcome');
      const tourKey = getStorageKey(user.id, 'hasCompletedTour');
      
      const storedWelcome = localStorage.getItem(welcomeKey);
      const storedTour = localStorage.getItem(tourKey);
      
      setHasSeenWelcomeState(storedWelcome === 'true');
      setHasCompletedTourState(storedTour === 'true');
      setInitialized(true);
    }
  }, [user, userRole, loading]);

  const setHasSeenWelcome = useCallback((value: boolean) => {
    if (user) {
      const key = getStorageKey(user.id, 'hasSeenWelcome');
      localStorage.setItem(key, String(value));
    }
    setHasSeenWelcomeState(value);
  }, [user]);

  const setHasCompletedTour = useCallback((value: boolean) => {
    if (user) {
      const key = getStorageKey(user.id, 'hasCompletedTour');
      localStorage.setItem(key, String(value));
    }
    setHasCompletedTourState(value);
  }, [user]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsTourRunning(true);
  }, []);

  const stopTour = useCallback(() => {
    setIsTourRunning(false);
    setHasCompletedTour(true);
  }, [setHasCompletedTour]);

  const skipTour = useCallback(() => {
    setIsTourRunning(false);
    setHasCompletedTour(true);
  }, [setHasCompletedTour]);

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsTourRunning(true);
  }, []);

  // Don't show anything until initialized
  if (!initialized && user && !loading) {
    return null;
  }

  return (
    <OnboardingContext.Provider
      value={{
        hasSeenWelcome,
        hasCompletedTour,
        isTourRunning,
        currentStepIndex,
        setHasSeenWelcome,
        setHasCompletedTour,
        startTour,
        stopTour,
        skipTour,
        restartTour,
        setCurrentStepIndex,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

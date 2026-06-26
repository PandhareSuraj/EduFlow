import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeModal } from './WelcomeModal';
import { ProductTour } from './ProductTour';

interface OnboardingContextType {
  startTour: () => void;
  isFirstVisit: boolean;
  hasCompletedTour: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    const storageKey = `eduerpOnboarding_${user.id}`;
    const skipWelcome = localStorage.getItem('eduerpSkipWelcome');
    const tourCompleted = localStorage.getItem(storageKey);

    if (tourCompleted) {
      setHasCompletedTour(true);
      return;
    }

    if (!skipWelcome) {
      setIsFirstVisit(true);
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    // Small delay to ensure modal is closed
    setTimeout(() => {
      setRunTour(true);
    }, 300);
  };

  const handleTourComplete = () => {
    setRunTour(false);
    setHasCompletedTour(true);
    if (user) {
      localStorage.setItem(`eduerpOnboarding_${user.id}`, 'completed');
    }
  };

  const startTour = () => {
    setRunTour(true);
  };

  return (
    <OnboardingContext.Provider value={{ startTour, isFirstVisit, hasCompletedTour }}>
      {children}
      <WelcomeModal
        open={showWelcome}
        onClose={handleCloseWelcome}
        onStartTour={handleStartTour}
        userName={user?.user_metadata?.full_name?.split(' ')[0]}
      />
      <ProductTour run={runTour} onComplete={handleTourComplete} />
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

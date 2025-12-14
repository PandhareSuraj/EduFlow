import Joyride, { CallBackProps, STATUS, ACTIONS } from 'react-joyride';
import { getTourStepsForRole } from '@/config/tourSteps';
import { useAuth } from '@/hooks/useAuth';

interface ProductTourProps {
  run: boolean;
  onComplete: () => void;
}

export function ProductTour({ run, onComplete }: ProductTourProps) {
  const { userRole } = useAuth();
  const steps = getTourStepsForRole(userRole);

  const handleCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }

    // Handle close button click
    if (action === ACTIONS.CLOSE) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--background))',
          textColor: 'hsl(var(--foreground))',
          arrowColor: 'hsl(var(--background))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: 1.5,
          padding: '8px 0',
        },
        buttonNext: {
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 500,
        },
        buttonBack: {
          color: 'hsl(var(--muted-foreground))',
          marginRight: '8px',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '13px',
        },
        buttonClose: {
          color: 'hsl(var(--muted-foreground))',
        },
        spotlight: {
          borderRadius: '8px',
        },
        beacon: {
          display: 'none',
        },
        beaconInner: {
          backgroundColor: 'hsl(var(--primary))',
        },
        beaconOuter: {
          backgroundColor: 'hsl(var(--primary) / 0.2)',
          border: '2px solid hsl(var(--primary))',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}

import { useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, ACTIONS, EVENTS, TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/hooks/useAuth';
import { getTourSteps } from './tourSteps';

// Custom tooltip component matching shadcn/ui design
function TourTooltip({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
}: TooltipRenderProps) {
  const progress = ((index + 1) / size) * 100;

  return (
    <Card {...tooltipProps} className="max-w-sm shadow-lg border-2">
      <CardHeader className="pb-2 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          {...closeProps}
        >
          <X className="h-4 w-4" />
        </Button>
        {step.title && (
          <CardTitle className="text-lg pr-8">{step.title}</CardTitle>
        )}
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">{step.content}</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0">
        <div className="w-full space-y-1">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-center">
            Step {index + 1} of {size}
          </p>
        </div>
        
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            {...skipProps}
            className="text-muted-foreground"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip Tour
          </Button>
          
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="outline" size="sm" {...backProps}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button size="sm" {...primaryProps}>
              {continuous ? (
                <>
                  {index === size - 1 ? 'Finish' : 'Next'}
                  {index < size - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </>
              ) : (
                'Got it!'
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ProductTour() {
  const { isTourRunning, stopTour, setCurrentStepIndex } = useOnboarding();
  const { userRole } = useAuth();

  const steps = getTourSteps(userRole);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data;

    // Update current step index
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setCurrentStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    // Handle tour completion or skip
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      stopTour();
    }

    // Handle close button
    if (action === ACTIONS.CLOSE) {
      stopTour();
    }
  }, [stopTour, setCurrentStepIndex]);

  if (!isTourRunning || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={isTourRunning}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      tooltipComponent={TourTooltip}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: 'hsl(var(--card))',
          backgroundColor: 'hsl(var(--card))',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: 'hsl(var(--primary))',
          textColor: 'hsl(var(--foreground))',
        },
        spotlight: {
          borderRadius: 8,
        },
        overlay: {
          mixBlendMode: 'normal',
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}

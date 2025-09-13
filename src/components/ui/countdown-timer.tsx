import { useState, useEffect, useMemo } from 'react';
import { getCurrentISTTime, convertToIST } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  onExpire?: () => void;
  urgencyThreshold?: number; // hours
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean;
  totalMilliseconds: number;
}

export function CountdownTimer({ 
  targetDate, 
  onExpire, 
  urgencyThreshold = 24, 
  size = 'md',
  className 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false,
    totalMilliseconds: 0
  });

  const [prevTimeRemaining, setPrevTimeRemaining] = useState<TimeRemaining | null>(null);

  const calculateTimeRemaining = useMemo(() => {
    return (): TimeRemaining => {
      const now = getCurrentISTTime();
      const target = convertToIST(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isUrgent: false,
          totalMilliseconds: 0
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const totalHours = diff / (1000 * 60 * 60);
      const isUrgent = totalHours <= urgencyThreshold;

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isUrgent,
        totalMilliseconds: diff
      };
    };
  }, [targetDate, urgencyThreshold]);

  useEffect(() => {
    const updateTimer = () => {
      const newTime = calculateTimeRemaining();
      
      // Check if values changed for animation
      if (timeRemaining) {
        setPrevTimeRemaining(timeRemaining);
      }
      
      setTimeRemaining(newTime);

      // Call onExpire when timer reaches zero
      if (newTime.isExpired && !timeRemaining.isExpired && onExpire) {
        onExpire();
      }
    };

    // Initial calculation
    updateTimer();

    // Set up interval
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, onExpire, timeRemaining.isExpired]);

  const sizeClasses = {
    sm: {
      container: "gap-1",
      timeUnit: "p-2",
      number: "text-lg font-bold",
      label: "text-xs"
    },
    md: {
      container: "gap-2",
      timeUnit: "p-3",
      number: "text-2xl font-bold",
      label: "text-sm"
    },
    lg: {
      container: "gap-4",
      timeUnit: "p-4",
      number: "text-3xl font-bold",
      label: "text-base"
    }
  };

  const classes = sizeClasses[size];

  const TimeUnit = ({ 
    value, 
    label, 
    hasChanged 
  }: { 
    value: number; 
    label: string; 
    hasChanged: boolean;
  }) => (
    <div className={cn(
      "relative bg-card border rounded-lg flex flex-col items-center justify-center transition-all duration-300",
      classes.timeUnit,
      hasChanged && "animate-pulse",
      timeRemaining.isUrgent && "border-destructive bg-destructive/5"
    )}>
      <div className={cn(
        "transition-all duration-300",
        classes.number,
        timeRemaining.isUrgent ? "text-destructive" : "text-foreground",
        hasChanged && "animate-scale-in"
      )}>
        {value.toString().padStart(2, '0')}
      </div>
      <div className={cn(
        "text-muted-foreground uppercase tracking-wide",
        classes.label
      )}>
        {label}
      </div>
    </div>
  );

  if (timeRemaining.isExpired) {
    return (
      <div className={cn(
        "text-center p-4 bg-muted rounded-lg border-2 border-dashed",
        className
      )}>
        <div className="text-muted-foreground font-medium">
          Test has started or expired
        </div>
      </div>
    );
  }

  // Determine which values changed for animation
  const daysChanged = prevTimeRemaining?.days !== timeRemaining.days;
  const hoursChanged = prevTimeRemaining?.hours !== timeRemaining.hours;
  const minutesChanged = prevTimeRemaining?.minutes !== timeRemaining.minutes;
  const secondsChanged = prevTimeRemaining?.seconds !== timeRemaining.seconds;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Urgency indicator */}
      {timeRemaining.isUrgent && (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full animate-pulse">
            <div className="w-2 h-2 bg-destructive rounded-full animate-ping" />
            Starting Soon
          </span>
        </div>
      )}
      
      {/* Countdown display */}
      <div className={cn(
        "flex items-center justify-center",
        classes.container,
        timeRemaining.isUrgent && "animate-pulse"
      )}>
        {timeRemaining.days > 0 && (
          <TimeUnit 
            value={timeRemaining.days} 
            label="Days" 
            hasChanged={daysChanged}
          />
        )}
        
        <TimeUnit 
          value={timeRemaining.hours} 
          label="Hours" 
          hasChanged={hoursChanged}
        />
        
        <TimeUnit 
          value={timeRemaining.minutes} 
          label="Mins" 
          hasChanged={minutesChanged}
        />
        
        <TimeUnit 
          value={timeRemaining.seconds} 
          label="Secs" 
          hasChanged={secondsChanged}
        />
      </div>

      {/* Additional info */}
      <div className="text-center text-sm text-muted-foreground">
        {timeRemaining.isUrgent ? (
          <span className="font-medium">Test starts very soon!</span>
        ) : timeRemaining.days > 0 ? (
          <span>Test starts in {timeRemaining.days} day{timeRemaining.days !== 1 ? 's' : ''}</span>
        ) : (
          <span>Test starts today</span>
        )}
      </div>
    </div>
  );
}
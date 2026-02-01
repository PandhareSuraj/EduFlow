import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseRateLimitOptions {
  cooldownMs?: number;
  maxAttempts?: number;
  windowMs?: number;
  showToast?: boolean;
}

interface UseRateLimitReturn {
  checkRateLimit: () => boolean;
  isLimited: boolean;
  remainingCooldown: number;
  reset: () => void;
}

/**
 * Hook for rate limiting form submissions and other actions
 * 
 * @param options Configuration options
 * @param options.cooldownMs Minimum time between submissions (default: 3000ms)
 * @param options.maxAttempts Maximum attempts within window (default: 5)
 * @param options.windowMs Time window for max attempts (default: 60000ms)
 * @param options.showToast Whether to show toast on rate limit (default: true)
 */
export function useRateLimit(options: UseRateLimitOptions = {}): UseRateLimitReturn {
  const {
    cooldownMs = 3000,
    maxAttempts = 5,
    windowMs = 60000,
    showToast = true,
  } = options;

  const { toast } = useToast();
  const [isLimited, setIsLimited] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  
  const lastSubmitRef = useRef<number>(0);
  const attemptsRef = useRef<number[]>([]);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  const startCooldownTimer = useCallback((duration: number) => {
    clearCooldownTimer();
    setRemainingCooldown(Math.ceil(duration / 1000));
    
    const interval = setInterval(() => {
      setRemainingCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    cooldownTimerRef.current = setTimeout(() => {
      clearInterval(interval);
      setIsLimited(false);
      setRemainingCooldown(0);
    }, duration);
  }, [clearCooldownTimer]);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Clean up old attempts outside the window
    attemptsRef.current = attemptsRef.current.filter(
      timestamp => now - timestamp < windowMs
    );
    
    // Check if too many attempts in the window
    if (attemptsRef.current.length >= maxAttempts) {
      setIsLimited(true);
      const oldestAttempt = attemptsRef.current[0];
      const waitTime = windowMs - (now - oldestAttempt);
      
      if (showToast) {
        toast({
          title: "Too many attempts",
          description: `Please wait ${Math.ceil(waitTime / 1000)} seconds before trying again.`,
          variant: "destructive",
        });
      }
      
      startCooldownTimer(waitTime);
      return false;
    }
    
    // Check basic cooldown
    const timeSinceLastSubmit = now - lastSubmitRef.current;
    if (timeSinceLastSubmit < cooldownMs) {
      setIsLimited(true);
      const waitTime = cooldownMs - timeSinceLastSubmit;
      
      if (showToast) {
        toast({
          title: "Please wait",
          description: "You're submitting too quickly. Please wait a moment.",
          variant: "destructive",
        });
      }
      
      startCooldownTimer(waitTime);
      return false;
    }
    
    // Record this attempt
    lastSubmitRef.current = now;
    attemptsRef.current.push(now);
    setIsLimited(false);
    
    return true;
  }, [cooldownMs, maxAttempts, windowMs, showToast, toast, startCooldownTimer]);

  const reset = useCallback(() => {
    clearCooldownTimer();
    lastSubmitRef.current = 0;
    attemptsRef.current = [];
    setIsLimited(false);
    setRemainingCooldown(0);
  }, [clearCooldownTimer]);

  return {
    checkRateLimit,
    isLimited,
    remainingCooldown,
    reset,
  };
}

export default useRateLimit;

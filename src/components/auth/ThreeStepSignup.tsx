import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validatePhone, validateEmail, validatePassword } from "@/lib/validationSchemas";

interface SignupData {
  phone_number: string;
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ThreeStepSignupProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export const ThreeStepSignup: React.FC<ThreeStepSignupProps> = ({ onSuccess, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  const [signupData, setSignupData] = useState<SignupData>({
    phone_number: '',
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Cooldown timer for resend OTP
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validatePhoneNumber = (phone: string) => {
    // For Indian phone numbers (10 digits starting with 6-9)
    const cleaned = phone.replace(/\D/g, '');
    try {
      validatePhone.parse(cleaned);
      setPhoneError("");
      return true;
    } catch (error: any) {
      setPhoneError(error.errors?.[0]?.message || "Invalid phone number");
      return false;
    }
  };

  const sendOTP = async () => {
    if (!validatePhoneNumber(signupData.phone_number)) {
      setError(phoneError || 'Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('send-sms-otp', {
        body: { phone_number: signupData.phone_number, sms_type: 'signup' }
      });

      // With new contract, error should only happen on network/system failures
      if (error) {
        console.error('Edge function invocation error:', error);
        setError('Network error. Please check your connection and try again.');
        return;
      }

      // Check the response body for ok status
      if (!data?.ok) {
        setError(data?.error || 'Failed to send OTP. Please try again.');
        return;
      }

      // Success!
      setOtpSent(true);
      setResendCooldown(60);

      if (data.dev_otp) {
        console.log('🔧 DEV MODE OTP:', data.dev_otp);
        toast({
          title: 'OTP Sent (Dev Mode)',
          description: `Use OTP: ${data.dev_otp}${data.store_ok === false ? ' (Not stored in DB)' : ''}`,
        });
      } else {
        toast({
          title: 'OTP Sent',
          description: 'Please check your phone for the verification code.',
        });
      }
    } catch (e: any) {
      console.error('Unexpected error:', e);
      setError(e?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('verify-sms-otp', {
        body: { 
          phone_number: signupData.phone_number,
          otp_code: otpCode 
        }
      });

      // With new contract, error should only happen on network/system failures
      if (error) {
        console.error('Edge function invocation error:', error);
        setError('Network error. Please check your connection and try again.');
        return;
      }

      // Check the response body for ok status
      if (!data?.ok) {
        setError(data?.error || 'Failed to verify OTP. Please try again.');
        return;
      }

      // Success!
      setIsPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully.",
      });
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateStep2 = () => {
    if (!signupData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    
    // Validate email
    try {
      validateEmail.parse(signupData.email);
      setEmailError("");
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Invalid email";
      setEmailError(message);
      setError(message);
      return false;
    }
    
    // Validate password
    try {
      validatePassword.parse(signupData.password);
      setPasswordError("");
    } catch (error: any) {
      const message = error.errors?.[0]?.message || "Invalid password";
      setPasswordError(message);
      setError(message);
      return false;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const completeSignup = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.full_name,
            phone: signupData.phone_number,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please try signing in instead.');
        } else {
          setError(error.message);
        }
        return;
      }

      setCurrentStep(3);
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });

      // Auto-close success screen after 2 seconds
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    
    // Real-time validation
    if (field === 'phone_number') {
      const cleaned = value.replace(/\D/g, '');
      try {
        validatePhone.parse(cleaned);
        setPhoneError("");
      } catch (error: any) {
        setPhoneError(error.errors?.[0]?.message || "Invalid phone number");
      }
    }
    
    if (field === 'email') {
      try {
        validateEmail.parse(value);
        setEmailError("");
      } catch (error: any) {
        setEmailError(error.errors?.[0]?.message || "Invalid email");
      }
    }
    
    if (field === 'password') {
      try {
        validatePassword.parse(value);
        setPasswordError("");
      } catch (error: any) {
        setPasswordError(error.errors?.[0]?.message || "Invalid password");
      }
    }
  };

  const getProgressValue = () => {
    if (currentStep === 1 && !isPhoneVerified) return 0;
    if (currentStep === 1 && isPhoneVerified) return 33;
    if (currentStep === 2) return 66;
    return 100;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={getProgressValue()} className="w-full" />
        <p className="text-sm text-muted-foreground text-center">
          Step {currentStep} of 3
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Phone Verification */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Verify Your Phone</h2>
            <p className="text-muted-foreground">
              Enter your phone number to receive a verification code
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={signupData.phone_number}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                handleInputChange('phone_number', cleaned);
              }}
              placeholder="e.g., 9876543210"
              maxLength={10}
              className={phoneError ? "border-destructive" : ""}
              disabled={otpSent}
            />
            {phoneError && (
              <p className="text-sm text-destructive">{phoneError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter 10-digit Indian mobile number (starts with 6-9)
            </p>
          </div>

          {!otpSent ? (
            <Button onClick={sendOTP} disabled={loading || !!phoneError || signupData.phone_number.length !== 10} className="w-full">
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otpCode}
                    onChange={setOtpCode}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button onClick={verifyOTP} disabled={loading || otpCode.length !== 6} className="w-full">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={sendOTP}
                  disabled={resendCooldown > 0}
                  className="text-sm"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </Button>
              </div>
            </div>
          )}

          {onBack && (
            <Button variant="outline" onClick={onBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          )}
        </div>
      )}

      {/* Step 2: Personal Details */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Personal Details</h2>
            <p className="text-muted-foreground">
              Complete your account information
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={signupData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={signupData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={emailError ? "border-destructive" : ""}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 8 chars)"
                value={signupData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={passwordError ? "border-destructive" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={completeSignup} 
              disabled={loading || !!emailError || !!passwordError || signupData.password !== signupData.confirmPassword} 
              className="flex-1"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {currentStep === 3 && (
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-green-700">Account Created!</h2>
          <p className="text-muted-foreground">
            Your account has been successfully created. You can now sign in to your account.
          </p>
          <Button onClick={onSuccess} className="w-full">
            Continue to Login
          </Button>
        </div>
      )}
    </div>
  );
};
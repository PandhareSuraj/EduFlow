import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { createDemoUsers } from '@/utils/createDemoUsers';
import { supabase } from '@/integrations/supabase/client';
import { ThreeStepSignup } from '@/components/auth/ThreeStepSignup';
import eduflowLogo from '@/assets/eduflow-logo.png';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // Check for admin setup mode
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminSetup = urlParams.get('adminSetup') === '1';

  // Demo accounts (super admin credentials removed for security)
  const demoAccounts = [{
    email: 'admin@college.com',
    password: 'demo123',
    role: 'Admin',
    description: 'Full system access'
  }, {
    email: 'teacher@college.com',
    password: 'demo123',
    role: 'Teacher',
    description: 'Attendance, Study materials, Marks'
  }, {
    email: 'student@college.com',
    password: 'demo123',
    role: 'Student',
    description: 'View profile, results, take tests'
  }, {
    email: 'clerk@college.com',
    password: 'demo123',
    role: 'Clerk',
    description: 'Admissions, Fees, Reports'
  }, {
    email: 'librarian@college.com',
    password: 'demo123',
    role: 'Librarian',
    description: 'Book management'
  }, {
    email: 'accountant@college.com',
    password: 'demo123',
    role: 'Accountant',
    description: 'Fees, Salary, Expenses'
  }, {
    email: 'assistant@college.com',
    password: 'demo123',
    role: 'Assistant',
    description: 'Basic access'
  }];

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const {
        error
      } = await signIn(loginForm.email, loginForm.password);
      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message === 'Email not confirmed') {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(error.message);
        }
        return;
      }
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in."
      });
      navigate('/');
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    try {
      const {
        error
      } = await signUp(signupForm.email, signupForm.password, {
        full_name: signupForm.fullName,
        phone: signupForm.phone
      });
      if (error) {
        if (error.message === 'User already registered') {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(error.message);
        }
        return;
      }
      toast({
        title: "Account created successfully!",
        description: "Please check your email to confirm your account before signing in."
      });

      // Clear form
      setSignupForm({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: ''
      });
    } catch (error: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDemoLogin = (email: string, password: string) => {
    setLoginForm({
      email,
      password
    });
    setError('');
  };
  
  const handleCreateDemoUsers = async () => {
    setIsLoading(true);
    try {
      await createDemoUsers();
      toast({
        title: "Demo users created!",
        description: "All demo accounts have been set up. You can now use them to log in."
      });
    } catch (error) {
      toast({
        title: "Error creating demo users",
        description: "Some demo users may already exist.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinalizeSuperAdmin = async () => {
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.functions.invoke('reset-faculty-password', {
        body: {
          userId: 'a61f615c-e3a3-4cfa-970e-0f324b9aecb4',
          newPassword: '7588351751'
        }
      });
      if (error) {
        throw error;
      }
      toast({
        title: "Super Admin Setup Complete!",
        description: "Password has been set. You can now login with: a61f615c-e3a3-4cfa-970e-0f324b9aecb4 / 7588351751"
      });

      // Auto-fill the login form
      setLoginForm({
        email: 'a61f615c-e3a3-4cfa-970e-0f324b9aecb4',
        password: '7588351751'
      });
    } catch (error: any) {
      toast({
        title: "Error setting up super admin",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Return to Homepage Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={eduflowLogo} 
              alt="EduFlow" 
              className="h-32 md:h-40 w-auto animate-[fade-in_0.6s_ease-out,scale-in_0.5s_ease-out] hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300" 
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">EduFlow Platform</h1>
          <p className="text-muted-foreground">Smart Education Management System</p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Access your educational institution's management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="Enter your email" value={loginForm.email} onChange={e => setLoginForm({
                    ...loginForm,
                    email: e.target.value
                  })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginForm.password} onChange={e => setLoginForm({
                      ...loginForm,
                      password: e.target.value
                    })} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                {/* Demo Accounts Section */}
                

                 {/* Admin Setup Section - Only show with ?adminSetup=1 */}
                 {isAdminSetup && <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                     <h3 className="text-sm font-medium text-destructive mb-2">Super Admin Setup</h3>
                     <p className="text-xs text-muted-foreground mb-3">
                       Finalize the super admin account password setup.
                     </p>
                     <Button type="button" variant="destructive" size="sm" onClick={handleFinalizeSuperAdmin} disabled={isLoading} className="w-full">
                       {isLoading ? 'Setting up...' : 'Finalize Super Admin'}
                     </Button>
                   </div>}
               </TabsContent>

              <TabsContent value="signup">
                <div className="space-y-4">
                  <ThreeStepSignup 
                    onSuccess={() => {
                      // Switch back to login tab after successful signup
                      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                      loginTab?.click();
                    }}
                    onBack={() => {
                      // Switch back to login tab
                      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                      loginTab?.click();
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-3">
          
          <p className="text-sm text-muted-foreground">© 2025 EduFlow Platform. Empowering Educational Institutions Worldwide. Built at myweb (<a href="https://www.mywebz.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">www.mywebz.in</a>)</p>
        </div>
      </div>
    </div>
  );
}

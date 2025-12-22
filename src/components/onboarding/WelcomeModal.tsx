import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Users, BookOpen, DollarSign, Library, Settings, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/hooks/useAuth';
import { getWelcomeContent } from './tourSteps';

const roleIcons: Record<string, React.ReactNode> = {
  super_admin: <Settings className="h-12 w-12 text-primary" />,
  admin: <Users className="h-12 w-12 text-primary" />,
  teacher: <BookOpen className="h-12 w-12 text-primary" />,
  accountant: <DollarSign className="h-12 w-12 text-primary" />,
  librarian: <Library className="h-12 w-12 text-primary" />,
  student: <GraduationCap className="h-12 w-12 text-primary" />,
};

export function WelcomeModal() {
  const { hasSeenWelcome, setHasSeenWelcome, startTour, setHasCompletedTour } = useOnboarding();
  const { user, userRole, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Only show modal if user is logged in, role is loaded, and they haven't seen welcome
    if (!loading && user && userRole && !hasSeenWelcome) {
      // Small delay to ensure the page is rendered
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, userRole, hasSeenWelcome]);

  const handleTakeTour = () => {
    setHasSeenWelcome(true);
    setOpen(false);
    // Start tour after modal closes
    setTimeout(() => {
      startTour();
    }, 300);
  };

  const handleSkip = () => {
    setHasSeenWelcome(true);
    if (dontShowAgain) {
      setHasCompletedTour(true);
    }
    setOpen(false);
  };

  const content = getWelcomeContent(userRole);
  const Icon = roleIcons[userRole || 'admin'] || <Sparkles className="h-12 w-12 text-primary" />;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {Icon}
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">
              {userRole?.replace('_', ' ').toUpperCase() || 'USER'}
            </Badge>
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
          </div>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground">What you can do:</p>
          <div className="grid grid-cols-2 gap-2">
            {content.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button onClick={handleTakeTour} className="w-full">
            Take a Quick Tour
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShow"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              />
              <label
                htmlFor="dontShow"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Don't show again
              </label>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

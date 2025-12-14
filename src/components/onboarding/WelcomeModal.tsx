import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  IndianRupee, 
  ClipboardCheck, 
  FileText, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { featureSlides } from '@/config/tourSteps';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
  userName?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-12 h-12" />,
  IndianRupee: <IndianRupee className="w-12 h-12" />,
  ClipboardCheck: <ClipboardCheck className="w-12 h-12" />,
  FileText: <FileText className="w-12 h-12" />,
  BarChart3: <BarChart3 className="w-12 h-12" />,
};

export function WelcomeModal({ open, onClose, onStartTour, userName }: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleNext = () => {
    if (currentSlide < featureSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('eduerpSkipWelcome', 'true');
    }
    onClose();
  };

  const handleStartTour = () => {
    if (dontShowAgain) {
      localStorage.setItem('eduerpSkipWelcome', 'true');
    }
    onStartTour();
  };

  const currentFeature = featureSlides[currentSlide];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-background border-border">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Welcome to EduERP</span>
          </div>
          <h2 className="text-2xl font-bold">
            {userName ? `Hello, ${userName}!` : 'Welcome!'}
          </h2>
          <p className="text-sm opacity-90 mt-1">
            Let's get you started with your institution management platform
          </p>
        </div>

        {/* Feature Carousel */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 text-center px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
                {iconMap[currentFeature.icon]}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {currentFeature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentFeature.description}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentSlide === featureSlides.length - 1}
              className="shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {featureSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Skip for Now
              </Button>
              <Button
                className="flex-1"
                onClick={handleStartTour}
              >
                Take a Tour
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="dontShow"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              />
              <label
                htmlFor="dontShow"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Don't show this again
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

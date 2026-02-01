import { HelpCircle, PlayCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { AppFAQ } from "./AppFAQ";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { WhatsNewSection } from "./WhatsNewSection";
import { SupportSection } from "./SupportSection";

interface HelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
  const { restartTour } = useOnboarding();

  const handleStartTour = () => {
    onOpenChange(false);
    // Small delay to let the drawer close
    setTimeout(() => {
      restartTour();
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </SheetTitle>
          <SheetDescription>
            Find answers, learn shortcuts, and get support
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="faq" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq" className="text-xs sm:text-sm">FAQ</TabsTrigger>
            <TabsTrigger value="shortcuts" className="text-xs sm:text-sm">Shortcuts</TabsTrigger>
            <TabsTrigger value="whats-new" className="text-xs sm:text-sm">What's New</TabsTrigger>
            <TabsTrigger value="support" className="text-xs sm:text-sm">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="mt-4">
            <AppFAQ />
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-4">
            <KeyboardShortcuts />
          </TabsContent>

          <TabsContent value="whats-new" className="mt-4">
            <WhatsNewSection />
          </TabsContent>

          <TabsContent value="support" className="mt-4">
            <SupportSection />
          </TabsContent>
        </Tabs>

        {/* Quick Tour Button */}
        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleStartTour} className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" />
            Take a Guided Tour
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Breadcrumbs } from "./Breadcrumbs";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { WelcomeModal, ProductTour } from "@/components/onboarding";
import { BottomNavigation } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <OnboardingProvider>
        {/* Skip Link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main 
              id="main-content" 
              role="main"
              aria-label="Main content"
              className={cn(
                "flex-1 overflow-y-auto p-3 sm:p-4 md:p-6",
                // Add bottom padding for mobile bottom navigation
                isMobile && "pb-20"
              )}
            >
              <Breadcrumbs />
              {children}
            </main>
            {/* Footer - hidden on mobile */}
            {!isMobile && <Footer />}
          </div>
        </div>
        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
        <WelcomeModal />
        <ProductTour />
      </OnboardingProvider>
    </SidebarProvider>
  );
}
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { WelcomeModal, ProductTour } from "@/components/onboarding";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6"
            >
              {children}
            </main>
          </div>
        </div>
        <WelcomeModal />
        <ProductTour />
      </OnboardingProvider>
    </SidebarProvider>
  );
}
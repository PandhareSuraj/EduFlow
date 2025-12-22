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
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
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
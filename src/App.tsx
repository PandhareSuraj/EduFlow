import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Faculty from "./pages/Faculty";
import Fees from "./pages/Fees";
import Enquiries from "./pages/Enquiries";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import IDCards from "./pages/IDCards";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/students" element={
            <Layout>
              <Students />
            </Layout>
          } />
          <Route path="/courses" element={
            <Layout>
              <Courses />
            </Layout>
          } />
          <Route path="/faculty" element={
            <Layout>
              <Faculty />
            </Layout>
          } />
          <Route path="/fees" element={
            <Layout>
              <Fees />
            </Layout>
          } />
          <Route path="/enquiries" element={
            <Layout>
              <Enquiries />
            </Layout>
          } />
          <Route path="/attendance" element={
            <Layout>
              <Attendance />
            </Layout>
          } />
          <Route path="/exams" element={
            <Layout>
              <Exams />
            </Layout>
          } />
          <Route path="/id-cards" element={
            <Layout>
              <IDCards />
            </Layout>
          } />
          <Route path="/inventory" element={
            <Layout>
              <Inventory />
            </Layout>
          } />
          <Route path="/reports" element={
            <Layout>
              <Reports />
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <Settings />
            </Layout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

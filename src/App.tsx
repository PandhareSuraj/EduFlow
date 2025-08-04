import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import CollegeManagement from "./pages/CollegeManagement";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import StudentCourse from "./pages/StudentCourse";
import StudentResults from "./pages/StudentResults";
import StudentTests from "./pages/StudentTests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/welcome" element={<Index />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute>
                <Layout>
                  <Courses />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/faculty" element={
              <ProtectedRoute>
                <Layout>
                  <Faculty />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/fees" element={
              <ProtectedRoute requiredRole="clerk">
                <Layout>
                  <Fees />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/enquiries" element={
              <ProtectedRoute>
                <Layout>
                  <Enquiries />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute requiredRole="teacher">
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/exams" element={
              <ProtectedRoute>
                <Layout>
                  <Exams />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/id-cards" element={
              <ProtectedRoute>
                <Layout>
                  <IDCards />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute requiredRole="librarian">
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredRole="clerk">
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/colleges" element={
              <ProtectedRoute requiredRole="super_admin">
                <Layout>
                  <CollegeManagement />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student-profile" element={
              <ProtectedRoute requiredRole="student">
                <Layout>
                  <StudentProfile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/student-course" element={
              <ProtectedRoute requiredRole="student">
                <Layout>
                  <StudentCourse />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/student-results" element={
              <ProtectedRoute requiredRole="student">
                <Layout>
                  <StudentResults />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/student-tests" element={
              <ProtectedRoute requiredRole="student">
                <Layout>
                  <StudentTests />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

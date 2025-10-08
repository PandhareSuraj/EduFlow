import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CollegeProvider } from "@/contexts/CollegeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Faculty from "./pages/Faculty";
import Fees from "./pages/Fees";
import FollowUps from "./pages/FollowUps";
import Enquiries from "./pages/Enquiries";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Library from "./pages/Library";
import IDCards from "./pages/IDCards";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CollegeManagement from "./pages/CollegeManagement";
import CollegePerformance from "./pages/CollegePerformance";
import MultiCollegeUserManagement from "./pages/MultiCollegeUserManagement";
import SystemHealthMonitoring from "./pages/SystemHealthMonitoring";
import AuditTrail from "./pages/AuditTrail";
import UserManagement from "./pages/UserManagement";
import AMCRevenue from "./pages/AMCRevenue";
import SystemAnalytics from "./pages/SystemAnalytics";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentProfile from "./pages/StudentProfile";
import StudentCourse from "./pages/StudentCourse";
import StudentResults from "./pages/StudentResults";
import StudentTests from "./pages/StudentTests";
import Hostel from "./pages/Hostel";
import Transport from "./pages/Transport";
import Events from "./pages/Events";
import Placements from "./pages/Placements";
import Grievances from "./pages/Grievances";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CollegeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/welcome" element={<Index />} />
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
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
                <ProtectedRoute allowedRoles={['admin', 'accountant', 'clerk']}>
                  <Layout>
                    <Fees />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/followups" element={
                <ProtectedRoute allowedRoles={['admin', 'accountant', 'clerk', 'teacher']}>
                  <Layout>
                    <FollowUps />
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
                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Layout>
                    <Attendance />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/exams" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'clerk']}>
                  <Layout>
                    <Exams />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'librarian', 'student']}>
                  <Layout>
                    <Library />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/id-cards" element={
                <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                  <Layout>
                    <IDCards />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute allowedRoles={['admin', 'clerk', 'librarian']}>
                  <Layout>
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'accountant']}>
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
              <Route path="/user-management" element={
                <ProtectedRoute requiredRole="super_admin">
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/audit-trail" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <Layout>
                    <AuditTrail />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/amc-revenue" element={
                <ProtectedRoute requiredRole="super_admin">
                  <Layout>
                    <AMCRevenue />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/system-analytics" element={
                <ProtectedRoute requiredRole="super_admin">
                  <Layout>
                    <SystemAnalytics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/college-performance" element={
                <ProtectedRoute requiredRole="super_admin">
                  <Layout>
                    <CollegePerformance />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/multi-college-users" element={
                <ProtectedRoute requiredRole="super_admin">
                  <Layout>
                    <MultiCollegeUserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/system-health" element={
                <ProtectedRoute requiredRole="super_admin">
                  <Layout>
                    <SystemHealthMonitoring />
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
              
              {/* Hostel and Transport Routes */}
              <Route path="/hostel" element={
                <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                  <Layout>
                    <Hostel />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/transport" element={
                <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                  <Layout>
                    <Transport />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Event Management Routes */}
              <Route path="/events" element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'clerk', 'student']}>
                  <Layout>
                    <Events />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Placement Management Routes */}
              <Route path="/placements" element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student']}>
                  <Layout>
                    <Placements />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Grievance Management Routes */}
              <Route path="/grievances" element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'clerk', 'student']}>
                  <Layout>
                    <Grievances />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CollegeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CollegeProvider } from "@/contexts/CollegeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary, OfflineIndicator } from "@/components/error";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { PageLoader, PageLoaderInline } from "@/components/ui/page-loader";
import { DashboardSkeleton, TableSkeleton, CardGridSkeleton } from "@/components/skeletons";

// Eagerly loaded pages (common entry points)
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Courses = lazy(() => import("./pages/Courses"));
const Faculty = lazy(() => import("./pages/Faculty"));
const Fees = lazy(() => import("./pages/Fees"));
const FollowUps = lazy(() => import("./pages/FollowUps"));
const Enquiries = lazy(() => import("./pages/Enquiries"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Exams = lazy(() => import("./pages/Exams"));
const Library = lazy(() => import("./pages/Library"));
const IDCards = lazy(() => import("./pages/IDCards"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const CollegeManagement = lazy(() => import("./pages/CollegeManagement"));
const CollegePerformance = lazy(() => import("./pages/CollegePerformance"));
const MultiCollegeUserManagement = lazy(() => import("./pages/MultiCollegeUserManagement"));
const SystemHealthMonitoring = lazy(() => import("./pages/SystemHealthMonitoring"));
const AuditTrail = lazy(() => import("./pages/AuditTrail"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const AMCRevenue = lazy(() => import("./pages/AMCRevenue"));
const AMCPlans = lazy(() => import("./pages/AMCPlans"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const SystemAnalytics = lazy(() => import("./pages/SystemAnalytics"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const StudentCourse = lazy(() => import("./pages/StudentCourse"));
const StudentResults = lazy(() => import("./pages/StudentResults"));
const StudentTests = lazy(() => import("./pages/StudentTests"));
const Hostel = lazy(() => import("./pages/Hostel"));
const Transport = lazy(() => import("./pages/Transport"));
const Events = lazy(() => import("./pages/Events"));
const Placements = lazy(() => import("./pages/Placements"));
const Grievances = lazy(() => import("./pages/Grievances"));
const StudentPromotion = lazy(() => import("./pages/StudentPromotion"));
const ProductTourPage = lazy(() => import("./pages/ProductTourPage"));

// Configure QueryClient with retry logic and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx client errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

// Fallback components for different page types
const DashboardFallback = () => <Layout><DashboardSkeleton /></Layout>;
const TableFallback = () => <Layout><TableSkeleton rows={8} columns={6} /></Layout>;
const CardGridFallback = () => <Layout><CardGridSkeleton cards={6} /></Layout>;
const DefaultFallback = () => <Layout><PageLoaderInline /></Layout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <CollegeProvider>
            <ThemeProvider>
              <Toaster />
              <Sonner />
              <OfflineIndicator />
              <BrowserRouter>
                <NavigationProgress />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/welcome" element={<Index />} />
                  <Route path="/product-tour" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProductTourPage />
                    </Suspense>
                  } />
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Suspense fallback={<DashboardFallback />}>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/students" element={
                    <ProtectedRoute>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Students />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <Suspense fallback={<CardGridFallback />}>
                        <Layout>
                          <Courses />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/faculty" element={
                    <ProtectedRoute>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Faculty />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/fees" element={
                    <ProtectedRoute allowedRoles={['admin', 'accountant', 'clerk']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Fees />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/followups" element={
                    <ProtectedRoute allowedRoles={['admin', 'accountant', 'clerk', 'teacher']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <FollowUps />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/enquiries" element={
                    <ProtectedRoute>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Enquiries />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/attendance" element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Attendance />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/exams" element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher', 'clerk']}>
                      <Suspense fallback={<CardGridFallback />}>
                        <Layout>
                          <Exams />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/library" element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher', 'librarian', 'student']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Library />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/id-cards" element={
                    <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                      <Suspense fallback={<DefaultFallback />}>
                        <Layout>
                          <IDCards />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute allowedRoles={['admin', 'clerk', 'librarian']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Inventory />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher', 'accountant']}>
                      <Suspense fallback={<DefaultFallback />}>
                        <Layout>
                          <Reports />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRole="admin">
                      <Suspense fallback={<DefaultFallback />}>
                        <Layout>
                          <Settings />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/colleges" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <CollegeManagement />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/user-management" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <UserManagement />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/audit-trail" element={
                    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <AuditTrail />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/amc-revenue" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <AMCRevenue />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/amc-plans" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<CardGridFallback />}>
                        <Layout>
                          <AMCPlans />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/subscriptions" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Subscriptions />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/system-analytics" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<DashboardFallback />}>
                        <Layout>
                          <SystemAnalytics />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/college-performance" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<DashboardFallback />}>
                        <Layout>
                          <CollegePerformance />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/multi-college-users" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <MultiCollegeUserManagement />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/system-health" element={
                    <ProtectedRoute requiredRole="super_admin">
                      <Suspense fallback={<DashboardFallback />}>
                        <Layout>
                          <SystemHealthMonitoring />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Student Routes */}
                  <Route path="/student-profile" element={
                    <ProtectedRoute requiredRole="student">
                      <Suspense fallback={<DefaultFallback />}>
                        <Layout>
                          <StudentProfile />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/student-course" element={
                    <ProtectedRoute requiredRole="student">
                      <Suspense fallback={<CardGridFallback />}>
                        <Layout>
                          <StudentCourse />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/student-results" element={
                    <ProtectedRoute requiredRole="student">
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <StudentResults />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/student-tests" element={
                    <ProtectedRoute requiredRole="student">
                      <Suspense fallback={<CardGridFallback />}>
                        <Layout>
                          <StudentTests />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Hostel and Transport Routes */}
                  <Route path="/hostel" element={
                    <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Hostel />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  <Route path="/transport" element={
                    <ProtectedRoute allowedRoles={['admin', 'clerk']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Transport />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Event Management Routes */}
                  <Route path="/events" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'clerk', 'student']}>
                      <Suspense fallback={<CardGridFallback />}>
                        <Layout>
                          <Events />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Placement Management Routes */}
                  <Route path="/placements" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student']}>
                      <Suspense fallback={<DashboardFallback />}>
                        <Layout>
                          <Placements />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Grievance Management Routes */}
                  <Route path="/grievances" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'clerk', 'student']}>
                      <Suspense fallback={<TableFallback />}>
                        <Layout>
                          <Grievances />
                        </Layout>
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* Student Promotion Routes */}
                  <Route path="/student-promotion" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <StudentPromotion />
                      </Suspense>
                    </ProtectedRoute>
                  } />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </CollegeProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PreferencesProvider } from './context/PreferencesContext';
import { AuthProvider } from './context/AuthContext';
import { AppShell, ProtectedRoute } from './components/layout/AppShell';
import { Skeleton } from './components/ui/primitives';

// Route-level code splitting for all application and auth views
const LoginPage = React.lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const SignupPage = React.lazy(() =>
  import('./pages/auth/SignupPage').then((m) => ({ default: m.SignupPage }))
);
const ForgotPasswordPage = React.lazy(() =>
  import('./pages/auth/ForgotResetPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = React.lazy(() =>
  import('./pages/auth/ForgotResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const AssessmentPage = React.lazy(() =>
  import('./pages/assessment/AssessmentPage').then((m) => ({ default: m.AssessmentPage }))
);
const AssessmentResultsPage = React.lazy(() =>
  import('./pages/assessment/AssessmentResultsPage').then((m) => ({
    default: m.AssessmentResultsPage,
  }))
);
const DesignSystemPage = React.lazy(() =>
  import('./pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage }))
);

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback: React.FC = () => (
  <div className="p-6 max-w-5xl mx-auto">
    <Skeleton lines={4} className="h-12 w-full" />
  </div>
);

export const AppRoutes: React.FC = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Publicly inspectable /design showcase inside the responsive AppShell */}
      <Route element={<AppShell />}>
        <Route path="/design" element={<DesignSystemPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/results" element={<AssessmentResultsPage />} />
          <Route path="/careers" element={<DashboardPage />} />
          <Route path="/skills" element={<DashboardPage />} />
          <Route path="/roadmap" element={<DashboardPage />} />
          <Route path="/portfolio" element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export const App: React.FC<{ queryClient?: QueryClient }> = ({
  queryClient = defaultQueryClient,
}) => (
  <ErrorBoundary>
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </PreferencesProvider>
  </ErrorBoundary>
);

export default App;

import { lazy, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/common/PageLoader';

const AuthPage = lazy(() =>
  import('@/pages/Auth').then((m) => ({ default: m.AuthPage }))
);
const DashboardLayout = lazy(() =>
  import('@/components/layout/DashboardLayout').then((m) => ({
    default: m.DashboardLayout,
  }))
);
const DashboardPage = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage }))
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader tip="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader tip="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function RouterContent() {
  return (
    <Suspense fallback={<PageLoader tip="Loading page..." />}>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function AppRouter() {
  const router = (
    <BrowserRouter>
      <AuthProvider>
        <RouterContent />
      </AuthProvider>
    </BrowserRouter>
  );

  if (!googleClientId) {
    return router;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{router}</GoogleOAuthProvider>;
}

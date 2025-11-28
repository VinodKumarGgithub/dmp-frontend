import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { routes, publicRoutes } from './config/routes';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import UserOnboardingTour from './components/UserOnboardingTour';

function AppContent() {
  const { isAuthenticated, loading, pagesLoading } = useAuth();
  const location = useLocation();

  // Determine if we should show loading screen
  // Only show loading if pages are actually loading (not just initial state)
  const showLoading = loading || (isAuthenticated && pagesLoading === true && location.pathname !== '/login');
  
  // Safety check: if user is not authenticated and we're trying to show loading, redirect to login
  // This handles the case where 401 error occurred and user was logged out
  if (!isAuthenticated && showLoading && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking auth or loading pages
  if (showLoading) {
    // Use key to force remount and reset progress when loading state changes
    return <LoadingScreen key="loading" isLoading={true} />;
  }

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => route.path === location.pathname);

  // Redirect authenticated users away from login
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // Render public routes without layout (for unauthenticated users)
  if (!isAuthenticated && isPublicRoute) {
    return (
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Render protected routes with layout (for authenticated users)
  // Authenticated users should see HomePage at /, not LandingPage
  if (isAuthenticated) {
  return (
    <AppLayout>
      <Routes>
        {routes
          .filter((route) => !publicRoutes.some((pr) => pr.key === route.key))
          .map((route) => (
            <Route key={route.key} path={route.path} element={route.element} />
          ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
  }

  // Fallback: redirect unauthenticated users to landing page
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <UserOnboardingTour />
    </BrowserRouter>
  );
}

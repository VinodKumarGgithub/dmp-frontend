import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { routes, publicRoutes } from './config/routes';
import { useAuth } from './contexts/AuthContext';
import { Spin } from 'antd';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => route.path === location.pathname);

  // Redirect authenticated users away from login
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // Render public routes without layout
  if (isPublicRoute) {
    return (
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Render protected routes with layout
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

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

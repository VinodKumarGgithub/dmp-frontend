import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import PageConfigManagement from '../pages/PageConfigManagement';
import UserManagement from '../pages/UserManagement';
import DataPage from '../pages/DataPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';

export const publicRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
    key: 'login',
  },
];

export const protectedRoutes = [
  {
    path: '/',
    element: <HomePage />,
    label: 'Home',
    key: 'home',
  },
  {
    path: '/page-config',
    element: <PageConfigManagement />,
    label: 'Page Config',
    key: 'page-config',
    adminOnly: true,
  },
  {
    path: '/users',
    element: <UserManagement />,
    label: 'User Management',
    key: 'users',
    adminOnly: true,
  },
  {
    path: '/pages/:pageKey',
    element: <DataPage />,
    key: 'data-page',
    // No label - this is a dynamic route, not shown in menu
  },
];

// Wrap protected routes with ProtectedRoute or AdminRoute component
export const routes = [
  ...publicRoutes,
  ...protectedRoutes.map((route) => ({
    ...route,
    element: route.adminOnly ? (
      <ProtectedRoute>
        <AdminRoute>{route.element}</AdminRoute>
      </ProtectedRoute>
    ) : (
      <ProtectedRoute>{route.element}</ProtectedRoute>
    ),
  })),
];

export const getRouteByPath = (path) => {
  return [...publicRoutes, ...protectedRoutes].find((route) => route.path === path);
};

export const getRouteByKey = (key) => {
  return [...publicRoutes, ...protectedRoutes].find((route) => route.key === key);
};


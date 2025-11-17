import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import PageConfigManagement from '../pages/PageConfigManagement';
import DataPage from '../pages/DataPage';
import ProtectedRoute from '../components/ProtectedRoute';

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
  },
  {
    path: '/pages/:pageKey',
    element: <DataPage />,
    key: 'data-page',
    // No label - this is a dynamic route, not shown in menu
  },
];

// Wrap protected routes with ProtectedRoute component
export const routes = [
  ...publicRoutes,
  ...protectedRoutes.map((route) => ({
    ...route,
    element: <ProtectedRoute>{route.element}</ProtectedRoute>,
  })),
];

export const getRouteByPath = (path) => {
  return [...publicRoutes, ...protectedRoutes].find((route) => route.path === path);
};

export const getRouteByKey = (key) => {
  return [...publicRoutes, ...protectedRoutes].find((route) => route.key === key);
};


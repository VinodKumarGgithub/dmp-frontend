import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import LandingPage from '../pages/LandingPage';
import PageConfigManagement from '../pages/PageConfigManagement';
import UserManagement from '../pages/UserManagement';
import TenantManagement from '../pages/TenantManagement';
import OrganizationManagement from '../pages/OrganizationManagement';
import AuditLogPage from '../pages/AuditLogPage';
import ProfilePage from '../pages/ProfilePage';
import DataPage from '../pages/DataPage';
import RolesAccessPage from '../pages/RolesAccessPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import DeveloperRoute from '../components/DeveloperRoute';

export const publicRoutes = [
  {
    path: '/',
    element: <LandingPage />,
    key: 'landing',
  },
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
    developerOnly: true, // ADMIN or DEVELOPER can access
  },
  {
    path: '/users',
    element: <UserManagement />,
    label: 'User Management',
    key: 'users',
    adminOnly: true,
  },
  {
    path: '/tenants',
    element: <TenantManagement />,
    label: 'Tenant Management',
    key: 'tenants',
    adminOnly: true,
  },
  {
    path: '/organizations',
    element: <OrganizationManagement />,
    label: 'Organization Management',
    key: 'organizations',
    adminOnly: true,
  },
  {
    path: '/audit-logs',
    element: <AuditLogPage />,
    label: 'Audit Logs',
    key: 'audit-logs',
    adminOnly: true,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
    key: 'profile',
    // No label - accessible only from user dropdown, not side menu
  },
  {
    path: '/pages/:pageKey',
    element: <DataPage />,
    key: 'data-page',
    // No label - this is a dynamic route, not shown in menu
  },
  {
    path: '/roles-access',
    element: <RolesAccessPage />,
    key: 'roles-access',
    adminOnly: true, // Only ADMIN and SUPER_ADMIN can access
    // No label - not shown in sidebar, accessible via Help Center
  },
];

// Wrap protected routes with ProtectedRoute, AdminRoute, or DeveloperRoute component
export const routes = [
  ...publicRoutes,
  ...protectedRoutes.map((route) => ({
    ...route,
    element: route.adminOnly ? (
      <ProtectedRoute>
        <AdminRoute>{route.element}</AdminRoute>
      </ProtectedRoute>
    ) : route.developerOnly ? (
      <ProtectedRoute>
        <DeveloperRoute>{route.element}</DeveloperRoute>
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


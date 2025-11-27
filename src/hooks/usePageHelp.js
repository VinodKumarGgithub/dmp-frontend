import { useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { getSearchableHelpItems } from '../data/helpContent';

export function usePageHelp() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'USER';
  const helpItems = getSearchableHelpItems(userRole);

  // Map routes to help content
  const pageHelpMap = {
    '/': {
      title: 'Home Dashboard',
      description: 'Browse and access all available data pages',
      relatedItems: helpItems.filter(
        (item) =>
          item.id === 'gs-3' || // Understanding Pages
          item.id === 'gs-2' // Switch Tenants
      ),
    },
    '/users': {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      relatedItems: helpItems.filter((item) => item.categoryId === 'user-management'),
    },
    '/tenants': {
      title: 'Tenant Management',
      description: 'Manage tenant databases and connections',
      relatedItems: helpItems.filter((item) => item.categoryId === 'tenant-management'),
    },
    '/page-config': {
      title: 'Page Configuration',
      description: 'Configure data pages and views',
      relatedItems: helpItems.filter((item) => item.categoryId === 'page-configuration'),
    },
    '/organizations': {
      title: 'Organization Management',
      description: 'Manage organizations (SUPER_ADMIN only)',
      relatedItems: helpItems.filter((item) => item.categoryId === 'organization-management'),
    },
    '/audit-logs': {
      title: 'Audit Logs',
      description: 'View system activity and audit trails',
      relatedItems: helpItems.filter((item) => item.categoryId === 'audit-logs'),
    },
    '/profile': {
      title: 'Profile Settings',
      description: 'Manage your profile and preferences',
      relatedItems: helpItems.filter((item) => item.id === 'gs-4'),
    },
  };

  // Match current route
  const exactMatch = pageHelpMap[location.pathname];
  
  // Match dynamic routes (like /pages/:pageKey)
  const dynamicMatch = location.pathname.startsWith('/pages/')
    ? {
        title: 'Data Page',
        description: 'View and manage data from tenant databases',
        relatedItems: helpItems.filter(
          (item) =>
            item.categoryId === 'data-management' ||
            item.id === 'gs-3'
        ),
      }
    : null;

  return exactMatch || dynamicMatch || null;
}


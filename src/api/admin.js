import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * User Blocking API Hooks
 */

/**
 * Fetch all users (with blocking status)
 */
export function useAdminUsers(options = {}) {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/users');
      return res.data || res;
    },
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
    ...options,
  });
}

/**
 * Fetch blocked users
 */
export function useBlockedUsers(options = {}) {
  return useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/users/blocked');
      return res.data || res;
    },
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
    ...options,
  });
}

/**
 * Block a user
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }) => {
      try {
        const res = await axiosInstance.post(`/admin/users/${userId}/block`, { reason });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User blocked successfully');
    },
  });
}

/**
 * Unblock a user
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await axiosInstance.post(`/admin/users/${userId}/unblock`);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User unblocked successfully');
    },
  });
}

/**
 * Page Tenant Access API Hooks
 */

/**
 * Fetch tenant access for a page
 */
export function usePageTenantAccess(pageKey, options = {}) {
  return useQuery({
    queryKey: ['pageTenantAccess', pageKey],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/pages/${pageKey}/tenants`);
      return res.data || res;
    },
    enabled: !!pageKey,
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
    ...options,
  });
}

/**
 * Update tenant access for a page
 */
export function useUpdatePageTenantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageKey, tenantIds }) => {
      try {
        const res = await axiosInstance.put(`/admin/pages/${pageKey}/tenants`, {
          tenantIds: Array.isArray(tenantIds) ? tenantIds : [],
        });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pageTenantAccess', variables.pageKey] });
      queryClient.invalidateQueries({ queryKey: ['pages'] }); // Refresh page list
      showSuccess('Page tenant access updated successfully');
    },
  });
}

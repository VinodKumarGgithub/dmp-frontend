import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError } from '../utils/errorHandler';

/**
 * Fetch list of all tenants
 * @param {Object} options - Query options
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status (ACTIVE, INACTIVE, SUSPENDED)
 * @param {string} filters.search - Search in tenant ID or name
 */
export function useTenants(filters = {}, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['tenants', filters],
    queryFn: async () => {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const res = await axiosInstance.get('/tenants', { params });
      return res.data || res;
    },
    enabled,
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
  });
}

/**
 * Fetch tenant by ID
 */
export function useTenant(tenantId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['tenants', tenantId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/tenants/${tenantId}`);
      return res.data || res;
    },
    enabled: enabled && !!tenantId,
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
  });
}


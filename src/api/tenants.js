import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

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

/**
 * Create a new tenant
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantData) => {
      try {
        const res = await axiosInstance.post('/tenants', tenantData);
        showSuccess('Tenant created successfully!');
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Update tenant
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const res = await axiosInstance.put(`/tenants/${id}`, data);
        showSuccess('Tenant updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
        queryClient.invalidateQueries({ queryKey: ['tenants', id] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Delete tenant
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        const res = await axiosInstance.delete(`/tenants/${id}`);
        showSuccess('Tenant deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Test tenant database connection
 */
export function useTestTenantConnection() {
  return useMutation({
    mutationFn: async (id) => {
      try {
        const res = await axiosInstance.post(`/tenants/${id}/test-connection`);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}


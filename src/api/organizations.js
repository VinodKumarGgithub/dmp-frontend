import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Fetch list of all organizations
 */
export function useOrganizations(filters = {}, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['organizations', filters],
    queryFn: async () => {
      const params = {};
      if (filters.search) params.search = filters.search;

      const res = await axiosInstance.get('/organizations', { params });
      return res.data || res;
    },
    enabled,
  });
}

/**
 * Fetch organization by ID
 */
export function useOrganization(organizationId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/organizations/${organizationId}/branding`);
      return res.data || res;
    },
    enabled: enabled && !!organizationId,
  });
}

/**
 * Create new organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const res = await axiosInstance.post('/organizations', data);
        showSuccess('Organization created successfully!');
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Update organization branding
 */
export function useUpdateOrganizationBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const res = await axiosInstance.put(`/organizations/${id}/branding`, data);
        showSuccess('Organization branding updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        queryClient.invalidateQueries({ queryKey: ['organizations', id] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Check subdomain availability
 */
export function useCheckSubdomainAvailability(subdomain, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['subdomainAvailability', subdomain],
    queryFn: async () => {
      // axiosInstance interceptor already unwraps response.data
      const res = await axiosInstance.get('/organizations/subdomain/check', {
        params: { subdomain }
      });
      // Response format: { success: true, data: { available: boolean, suggestions: [] }, message: '...' }
      return res;
    },
    enabled: Boolean(enabled && !!subdomain && subdomain.length >= 2),
    staleTime: 10000, // Cache for 10 seconds
  });
}


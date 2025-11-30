import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Get license status for current organization
 * Returns valid license for SUPER_ADMIN (no organization_id)
 */
export async function getLicenseStatus() {
  try {
    const response = await axiosInstance.get('/license/status');
    // Ensure we always return a valid object
    if (response && typeof response === 'object') {
      return response;
    }
    // Fallback if response is not an object
    return {
      valid: true,
      reason: null,
      message: 'No license required',
      status: 'ACTIVE',
      expiresAt: null,
      license: null
    };
  } catch (error) {
    // If it's a 401/403 and user has no org_id, they're SUPER_ADMIN
    // Return valid license status
    if (error.status === 401 || error.status === 403) {
      return {
        valid: true,
        reason: null,
        message: 'No license required (SUPER_ADMIN)',
        status: 'ACTIVE',
        expiresAt: null,
        license: null
      };
    }
    throw error;
  }
}

/**
 * Check license limits
 * @param {string} checkType - 'users' or 'tenants'
 * @param {number} currentCount - Current count
 */
export async function checkLicenseLimits(checkType, currentCount) {
  const response = await axiosInstance.get('/license/limits', {
    params: { checkType, currentCount }
  });
  return response.data;
}

/**
 * Create license (SUPER_ADMIN only)
 */
export async function createLicense(data) {
  const response = await axiosInstance.post('/license', data);
  return response.data;
}

/**
 * Get license by organization ID (SUPER_ADMIN only)
 */
export async function getLicenseByOrganization(organizationId) {
  const response = await axiosInstance.get(`/license/organization/${organizationId}`);
  return response.data;
}

/**
 * Update license (SUPER_ADMIN only)
 */
export async function updateLicense(organizationId, updates) {
  const response = await axiosInstance.put(`/license/organization/${organizationId}`, updates);
  return response.data;
}

/**
 * Renew license (SUPER_ADMIN only)
 */
export async function renewLicense(organizationId, additionalDays) {
  const response = await axiosInstance.post(`/license/organization/${organizationId}/renew`, {
    additionalDays
  });
  return response.data;
}

/**
 * Get license features and status summary
 */
export async function getLicenseFeatures() {
  const response = await axiosInstance.get('/license/features');
  return response.data;
}

/**
 * Fetch all licenses (SUPER_ADMIN only)
 */
export function useLicenses(filters = {}, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['licenses', filters],
    queryFn: async () => {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const res = await axiosInstance.get('/license', { params });
      return res.data || res;
    },
    enabled,
  });
}

/**
 * Fetch license by organization ID
 */
export function useLicenseByOrganization(organizationId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ['licenses', organizationId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/license/organization/${organizationId}`);
      return res.data || res;
    },
    enabled: enabled && !!organizationId,
  });
}

/**
 * Create license mutation (SUPER_ADMIN only)
 */
export function useCreateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const res = await axiosInstance.post('/license', data);
        showSuccess('License created successfully!');
        queryClient.invalidateQueries({ queryKey: ['licenses'] });
        queryClient.invalidateQueries({ queryKey: ['license', 'status'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Update license mutation (SUPER_ADMIN only)
 */
export function useUpdateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, updates }) => {
      try {
        const res = await axiosInstance.put(`/license/organization/${organizationId}`, updates);
        showSuccess('License updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['licenses'] });
        queryClient.invalidateQueries({ queryKey: ['licenses', organizationId] });
        queryClient.invalidateQueries({ queryKey: ['license', 'status'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Renew license mutation
 */
export function useRenewLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, additionalDays }) => {
      try {
        const res = await axiosInstance.post(`/license/organization/${organizationId}/renew`, {
          additionalDays
        });
        showSuccess(`License renewed successfully for ${additionalDays} days!`);
        queryClient.invalidateQueries({ queryKey: ['licenses'] });
        queryClient.invalidateQueries({ queryKey: ['licenses', organizationId] });
        queryClient.invalidateQueries({ queryKey: ['license', 'status'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}


import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import useAuthStore from '../stores/authStore';

/**
 * Get usage metrics for organization
 * @param {Object} filters - Filter options
 * @param {string} filters.organizationId - Organization ID (SUPER_ADMIN only)
 * @param {string} filters.metricType - Metric type ('query', 'export', 'page_view', 'login')
 * @param {string} filters.startDate - Start date (YYYY-MM-DD)
 * @param {string} filters.endDate - End date (YYYY-MM-DD)
 * @param {string} filters.groupBy - Group by ('hour', 'day', 'week', 'month')
 */
export async function getUsageMetrics(filters = {}) {
  const params = {};
  if (filters.organizationId) params.organizationId = filters.organizationId;
  if (filters.metricType) params.metricType = filters.metricType;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.groupBy) params.groupBy = filters.groupBy;

  const response = await axiosInstance.get('/usage/metrics', { params });
  // Axios interceptor returns {success, message, data}
  // If response already has .data (array), return it; otherwise return response itself
  return Array.isArray(response) ? response : (response.data || response);
}

/**
 * Get license compliance metrics
 * @param {Object} filters - Filter options
 * @param {string} filters.organizationId - Organization ID (SUPER_ADMIN only)
 * @param {string} filters.startDate - Start date (YYYY-MM-DD)
 * @param {string} filters.endDate - End date (YYYY-MM-DD)
 */
export async function getLicenseComplianceMetrics(filters = {}) {
  const params = {};
  if (filters.organizationId) params.organizationId = filters.organizationId;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await axiosInstance.get('/usage/compliance', { params });
  // Axios interceptor returns {success, message, data}
  // If response already has .data (object), return it; otherwise return response itself
  return response && typeof response === 'object' && !Array.isArray(response) && response.data !== undefined
    ? response.data
    : response;
}

/**
 * Get top pages by usage
 * @param {Object} filters - Filter options
 * @param {string} filters.organizationId - Organization ID (SUPER_ADMIN only)
 * @param {number} filters.limit - Number of pages to return (default: 10)
 * @param {string} filters.startDate - Start date (YYYY-MM-DD)
 * @param {string} filters.endDate - End date (YYYY-MM-DD)
 */
export async function getTopPages(filters = {}) {
  const params = {};
  if (filters.organizationId) params.organizationId = filters.organizationId;
  if (filters.limit) params.limit = filters.limit;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await axiosInstance.get('/usage/top-pages', { params });
  // Axios interceptor returns {success, message, data}
  // If response already has .data (array), return it; otherwise return response itself
  return Array.isArray(response) ? response : (response.data || response);
}

/**
 * Get daily usage summary
 * @param {Object} filters - Filter options
 * @param {string} filters.organizationId - Organization ID (SUPER_ADMIN only)
 * @param {string} filters.startDate - Start date (YYYY-MM-DD)
 * @param {string} filters.endDate - End date (YYYY-MM-DD)
 */
export async function getDailyUsageSummary(filters = {}) {
  const params = {};
  if (filters.organizationId) params.organizationId = filters.organizationId;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await axiosInstance.get('/usage/summary', { params });
  // Axios interceptor returns {success, message, data}
  // If response already has .data (object), return it; otherwise return response itself
  return response && typeof response === 'object' && !Array.isArray(response) && response.data !== undefined
    ? response.data
    : response;
}

/**
 * React Query hook for usage metrics
 */
export function useUsageMetrics(filters = {}, options = {}) {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['usage', 'metrics', filters],
    queryFn: () => getUsageMetrics(filters),
    enabled: enabled && (isSuperAdmin || !!user?.organization_id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });
}

/**
 * React Query hook for license compliance metrics
 */
export function useLicenseCompliance(filters = {}, options = {}) {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['usage', 'compliance', filters],
    queryFn: () => getLicenseComplianceMetrics(filters),
    enabled: enabled && (isSuperAdmin || !!user?.organization_id),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * React Query hook for top pages
 */
export function useTopPages(filters = {}, options = {}) {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['usage', 'top-pages', filters],
    queryFn: () => getTopPages(filters),
    enabled: enabled && (isSuperAdmin || !!user?.organization_id),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * React Query hook for daily usage summary
 */
export function useDailyUsageSummary(filters = {}, options = {}) {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: ['usage', 'summary', filters],
    queryFn: () => getDailyUsageSummary(filters),
    enabled: enabled && (isSuperAdmin || !!user?.organization_id),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    ...queryOptions,
  });
}


import { useQuery } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError } from '../utils/errorHandler';

/**
 * Fetch list of all pages
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether the query should run (default: true)
 */
export function usePages(options = {}) {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/pages');
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    enabled,
  });
}

/**
 * Fetch page config by pageKey
 */
export function usePageConfig(pageKey) {
  return useQuery({
    queryKey: ['pages', pageKey, 'config'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/pages/${pageKey}/config`);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    enabled: !!pageKey,
  });
}

/**
 * Fetch page data by pageKey with query params
 */
export function usePageData(pageKey, queryParams = {}) {
  return useQuery({
    queryKey: ['pages', pageKey, 'data', queryParams],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/pages/${pageKey}/data`, {
          params: queryParams,
        });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    enabled: !!pageKey,
  });
}

/**
 * Fetch page config and data combined
 */
export function usePage(pageKey, queryParams = {}) {
  return useQuery({
    queryKey: ['pages', pageKey, queryParams],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(`/pages/${pageKey}`, {
          params: queryParams,
        });
        // Axios interceptor returns response.data which is { success: true, message: "...", data: { config, data, total } }
        // Extract the nested data object
        if (res && res.data && typeof res.data === 'object' && 'config' in res.data) {
          return res.data;
        }
        // Fallback: if structure is different, return as-is
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    enabled: !!pageKey,
  });
}

/**
 * Download page data as CSV
 */
export async function downloadPageData(pageKey, queryParams = {}) {
  try {
    const response = await axiosInstance.get(`/pages/${pageKey}/download`, {
      params: queryParams,
      responseType: 'blob',
    });

    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pageKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}


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
    // Keep previous data while fetching new data (prevents UI flicker)
    placeholderData: (previousData) => previousData,
    // Don't refetch on window focus to prevent unwanted reloads
    refetchOnWindowFocus: false,
  });
}

/**
 * Convert JSON data to CSV format
 */
function convertToCSV(data, selectedColumns = []) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get columns from first row
  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return '';
  }

  const cols = selectedColumns.length > 0 ? selectedColumns : Object.keys(firstRow);
  if (cols.length === 0) {
    return '';
  }

  // Generate CSV header
  const header = cols.map((col) => {
    const escaped = String(col).replace(/"/g, '""');
    return `"${escaped}"`;
  }).join(',');

  // Generate CSV rows
  const rows = data.map((row) => {
    if (!row || typeof row !== 'object') {
      return cols.map(() => '""').join(',');
    }
    return cols
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) {
          return '""';
        }
        const str = String(value).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Download page data as CSV (streaming approach)
 * Backend sends JSON, frontend converts to CSV and downloads
 */
export async function downloadPageData(pageKey, queryParams = {}, selectedColumns = []) {
  try {
    // Fetch JSON data from backend
    const response = await axiosInstance.get(`/pages/${pageKey}/download`, {
      params: queryParams,
      responseType: 'json',
    });

    // Extract data from response
    const responseData = response.data || response;
    const data = responseData.data?.data || responseData.data || [];

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data available to download');
    }

    // Convert JSON to CSV
    const csv = convertToCSV(data, selectedColumns);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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


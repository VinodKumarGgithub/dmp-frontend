import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Create a new page config
 */
export function useCreatePageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const res = await axiosInstance.post('/pages', data);
        showSuccess('Page config created successfully!');
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Update page config
 */
export function useUpdatePageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageKey, data }) => {
      try {
        const res = await axiosInstance.put(`/pages/${pageKey}`, data);
        showSuccess('Page config updated successfully!');
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        queryClient.invalidateQueries({ queryKey: ['pages', pageKey] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Delete page config
 */
export function useDeletePageConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageKey) => {
      try {
        const res = await axiosInstance.delete(`/pages/${pageKey}`);
        showSuccess('Page config deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['pages'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });
}

/**
 * Get list of tables from tenant database
 */
export function useTables(options = {}) {
  return useQuery({
    queryKey: ['db', 'tables'],
    queryFn: async () => {
      const res = await axiosInstance.get('/pages/db/tables');
      return res.data?.data || res.data || [];
    },
    enabled: options.enabled !== false,
    ...options,
  });
}

/**
 * Get columns from a specific table
 */
export function useTableColumns(tableName, options = {}) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'columns'],
    queryFn: async () => {
      if (!tableName) return [];
      const res = await axiosInstance.get(`/pages/db/tables/${tableName}/columns`);
      return res.data?.data || res.data || [];
    },
    enabled: !!tableName && (options.enabled !== false),
    ...options,
  });
}

/**
 * Get index information for a specific table
 */
export function useTableIndexes(tableName, options = {}) {
  return useQuery({
    queryKey: ['db', 'tables', tableName, 'indexes'],
    queryFn: async () => {
      if (!tableName) return {};
      const res = await axiosInstance.get(`/pages/db/tables/${tableName}/indexes`);
      return res.data?.data || res.data || {};
    },
    enabled: !!tableName && (options.enabled !== false),
    ...options,
  });
}


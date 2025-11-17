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


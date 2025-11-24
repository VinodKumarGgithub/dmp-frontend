import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

export function usePagePreferences(pageKey, options = {}) {
  return useQuery({
    queryKey: ['page-preferences', pageKey],
    queryFn: async () => {
      if (!pageKey) return { tableColumns: [], downloadColumns: [] };
      const res = await axiosInstance.get(`/page-preferences/${pageKey}`);
      return res.data?.data || res.data || { tableColumns: [], downloadColumns: [] };
    },
    enabled: !!pageKey && (options.enabled ?? true),
    // Error handling is done globally in QueryClient onError to prevent duplicate toasts on retries
  });
}

export function useSavePagePreferences(pageKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const res = await axiosInstance.put(`/page-preferences/${pageKey}`, payload);
        return res.data?.data || res.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-preferences', pageKey] });
      showSuccess('Column preferences saved');
    },
  });
}


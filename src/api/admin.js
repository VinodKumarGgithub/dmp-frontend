import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * User Blocking API Hooks
 */

/**
 * Fetch all users (with blocking status)
 */
export function useAdminUsers(options = {}) {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/admin/users');
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    ...options,
  });
}

/**
 * Fetch blocked users
 */
export function useBlockedUsers(options = {}) {
  return useQuery({
    queryKey: ['blockedUsers'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/admin/users/blocked');
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    ...options,
  });
}

/**
 * Block a user
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }) => {
      try {
        const res = await axiosInstance.post(`/admin/users/${userId}/block`, { reason });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User blocked successfully');
    },
  });
}

/**
 * Unblock a user
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await axiosInstance.post(`/admin/users/${userId}/unblock`);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User unblocked successfully');
    },
  });
}


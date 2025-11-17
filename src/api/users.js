import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Fetch list of all admin users
 */
export function useUsers(options = {}) {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/users');
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
 * Create new admin user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      try {
        const res = await axiosInstance.post('/users', userData);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User created successfully');
    },
  });
}

/**
 * Update admin user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const res = await axiosInstance.put(`/users/${id}`, data);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User updated successfully');
    },
  });
}

/**
 * Delete admin user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        const res = await axiosInstance.delete(`/users/${id}`);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User deleted successfully');
    },
  });
}


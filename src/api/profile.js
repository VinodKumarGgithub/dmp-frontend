import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Fetch current user's profile
 */
export function useProfile(options = {}) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axiosInstance.get('/profile');
      return res.data || res;
    },
    ...options,
  });
}

/**
 * Update current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      try {
        const res = await axiosInstance.put('/profile', profileData);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      showSuccess('Profile updated successfully');
      return data;
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ oldPassword, newPassword }) => {
      try {
        const res = await axiosInstance.put('/profile/password', {
          oldPassword,
          newPassword,
        });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      showSuccess('Password changed successfully');
    },
  });
}

/**
 * Fetch user preferences
 */
export function usePreferences(options = {}) {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: async () => {
      const res = await axiosInstance.get('/profile/preferences');
      return res.data || res;
    },
    ...options,
  });
}

/**
 * Update user preferences
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences) => {
      try {
        const res = await axiosInstance.put('/profile/preferences', preferences);
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      showSuccess('Preferences updated successfully');
    },
  });
}


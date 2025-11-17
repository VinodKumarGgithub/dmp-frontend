import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
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
  });

  const createUserMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const res = await axiosInstance.post('/users', data);
        showSuccess('User created successfully!');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        return res.data || res;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
  });

  return { usersQuery, createUserMutation };
}

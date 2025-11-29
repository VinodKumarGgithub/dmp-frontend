import { useQuery } from '@tanstack/react-query';
import { getLicenseStatus } from '../api/license';
import useAuthStore from '../stores/authStore';

/**
 * Hook to get license status for current organization
 * Automatically refetches every 5 minutes
 * Returns valid: true for SUPER_ADMIN (no organization_id)
 */
export function useLicenseStatus() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['license', 'status'],
    queryFn: async () => {
      try {
        const data = await getLicenseStatus();
        // Ensure we always return a valid object
        return data || {
          valid: true,
          reason: null,
          message: 'No license required',
          status: 'ACTIVE',
          expiresAt: null,
          license: null
        };
      } catch (error) {
        // If error and user is SUPER_ADMIN (no org_id), return valid license
        if (!user?.organization_id) {
          return {
            valid: true,
            reason: null,
            message: 'No license required (SUPER_ADMIN)',
            status: 'ACTIVE',
            expiresAt: null,
            license: null
          };
        }
        // For other errors, throw to let React Query handle it
        throw error;
      }
    },
    enabled: isAuthenticated, // Only run when authenticated
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 2,
    retryDelay: 1000,
    // Provide default data to prevent undefined
    initialData: {
      valid: true,
      reason: null,
      message: 'Loading license status...',
      status: 'ACTIVE',
      expiresAt: null,
      license: null
    }
  });
}


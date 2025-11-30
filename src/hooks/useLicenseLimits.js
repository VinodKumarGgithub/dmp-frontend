import { useQuery } from '@tanstack/react-query';
import { checkLicenseLimits } from '../api/license';
import useAuthStore from '../stores/authStore';
import { useLicenseStatus } from './useLicenseStatus';

/**
 * Hook to get license limit information
 * @param {string} checkType - 'users' or 'tenants'
 * @param {number} currentCount - Current count of users/tenants
 * @returns {Object} { limit: number|null, current: number, remaining: number, allowed: boolean, message: string, isLoading: boolean }
 */
export function useLicenseLimits(checkType, currentCount) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { data: licenseStatus } = useLicenseStatus();

  return useQuery({
    queryKey: ['license', 'limits', checkType, currentCount],
    queryFn: async () => {
      if (isSuperAdmin) {
        return {
          allowed: true,
          limit: null,
          current: currentCount,
          remaining: null,
          message: 'Unlimited (SUPER_ADMIN)'
        };
      }

      const result = await checkLicenseLimits(checkType, currentCount);
      return result;
    },
    enabled: isAuthenticated && !isSuperAdmin && currentCount !== undefined,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    retry: 1,
    initialData: {
      allowed: true,
      limit: null,
      current: currentCount || 0,
      remaining: null,
      message: 'Checking limits...'
    }
  });
}


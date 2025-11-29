import { useQuery } from '@tanstack/react-query';
import { getLicenseFeatures } from '../api/license';
import useAuthStore from '../stores/authStore';

/**
 * Hook to check if a feature is enabled
 * @param {string} feature - Feature name to check
 * @returns {Object} { enabled: boolean, isLoading: boolean, error: Error }
 */
export function useFeatureGate(feature) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data, isLoading, error } = useQuery({
    queryKey: ['license', 'features'],
    queryFn: getLicenseFeatures,
    enabled: isAuthenticated && !isSuperAdmin, // Skip for SUPER_ADMIN
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
    initialData: {
      valid: true,
      readOnly: false,
      features: [],
      message: 'Loading...'
    }
  });

  // SUPER_ADMIN always has all features
  if (isSuperAdmin) {
    return {
      enabled: true,
      isLoading: false,
      error: null,
      readOnly: false,
      licenseValid: true,
      features: ['export', 'custom_branding', 'api_access', 'advanced_filters', 'bulk_operations']
    };
  }

  const features = data?.features || [];
  const enabled = feature ? features.includes(feature) : true;

  return {
    enabled,
    isLoading,
    error,
    readOnly: data?.readOnly || false,
    features: features,
    licenseValid: data?.valid !== false
  };
}

/**
 * Hook to check if user can perform write actions
 * @returns {Object} { canWrite: boolean, readOnly: boolean, isLoading: boolean }
 */
export function useCanWrite() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const { readOnly, isLoading, licenseValid } = useFeatureGate();
  
  // SUPER_ADMIN always can write
  if (isSuperAdmin) {
    return {
      canWrite: true,
      readOnly: false,
      isLoading: false
    };
  }
  
  return {
    canWrite: !readOnly && (licenseValid !== false),
    readOnly: readOnly || (licenseValid === false),
    isLoading
  };
}


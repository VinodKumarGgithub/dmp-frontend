import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import useAuthStore from '../stores/authStore';
import useAppConfigStore from '../stores/appConfigStore';
import { getCachedBranding, setCachedBranding, BRANDING_CACHE_KEY } from './useLoginBranding';

// Get cache TTL from env (same as useLoginBranding)
const BRANDING_CACHE_TTL = parseInt(
  import.meta.env.VITE_BRANDING_CACHE_TTL || '600000', 
  10
);

/**
 * Hook to fetch and use organization branding for authenticated users
 */
export function useOrganizationBranding() {
  const user = useAuthStore((state) => state.user);
  const organizationId = user?.organization_id;
  const getAppName = useAppConfigStore((state) => state.getAppName);
  const getAppShortName = useAppConfigStore((state) => state.getAppShortName);
  
  // Check cache first - try to get any cached branding
  // We'll validate by masked_org_id after fetching if needed
  let cachedResult = null;
  let cachedBranding = null;
  let cachedMaskedOrgId = null;
  
  // Try to get cached branding (without subdomain, we'll match by masked_org_id after fetch)
  try {
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (cached) {
      const cacheData = JSON.parse(cached);
      const timestamp = cacheData.timestamp || 0;
      
      // Check if cache is still valid
      if (Date.now() - timestamp < BRANDING_CACHE_TTL) {
        cachedResult = { data: cacheData.data, masked_org_id: cacheData.masked_org_id };
        cachedBranding = cacheData.data;
        cachedMaskedOrgId = cacheData.masked_org_id;
      }
    }
  } catch (e) {
    // Ignore cache errors
  }
  
  // Fetch branding for authenticated user's organization (only if not cached)
  const { data: brandingData } = useQuery({
    queryKey: ['organization', 'branding', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      // Read cached masked_org_id inside queryFn to avoid closure issues
      let currentCachedMaskedOrgId = null;
      try {
        const cached = localStorage.getItem(BRANDING_CACHE_KEY);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const timestamp = cacheData.timestamp || 0;
          if (Date.now() - timestamp < BRANDING_CACHE_TTL) {
            currentCachedMaskedOrgId = cacheData.masked_org_id;
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
      
      try {
        const res = await axiosInstance.get('/api/organizations/branding');
        const branding = res.data?.data || null;
        
        if (branding) {
          // Validate organization switch by comparing masked_org_id
          if (currentCachedMaskedOrgId && branding.masked_org_id && currentCachedMaskedOrgId !== branding.masked_org_id) {
            // Organization switched - clear cache
            localStorage.removeItem(BRANDING_CACHE_KEY);
          }
          
          // Cache the branding data with masked_org_id
          if (branding.masked_org_id) {
            setCachedBranding(null, branding, branding.masked_org_id);
          }
        }
        
        return branding;
      } catch (error) {
        // Fail silently - use defaults
        return null;
      }
    },
    enabled: !!organizationId && !cachedBranding, // Only fetch if not cached
    staleTime: BRANDING_CACHE_TTL, // Use same TTL as localStorage
    retry: false,
  });
  
  // Use fetched branding or cached branding
  const branding = brandingData || cachedBranding || {};
  
  // Merge with defaults
  return {
    appName: branding.app_name || getAppName(),
    appShortName: branding.app_short_name || getAppShortName(),
    logoUrl: branding.logo_url,
    primaryColor: branding.primary_color || '#1890ff',
    // Include any other branding fields
    ...branding
  };
}


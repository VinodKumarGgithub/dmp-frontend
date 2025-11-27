import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { extractSubdomain } from '../utils/organizationDetector';
import useAppConfigStore from '../stores/appConfigStore';

// Export cache key constant for use in other hooks
export const BRANDING_CACHE_KEY = 'organization_branding';
// Get cache TTL from env or default to 10 minutes (600000 ms)
const BRANDING_CACHE_TTL = parseInt(
  import.meta.env.VITE_BRANDING_CACHE_TTL || '600000', 
  10
);

/**
 * Get cached branding (supports both subdomain and masked_org_id)
 */
function getCachedBranding(subdomain, maskedOrgId = null) {
  try {
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    const { 
      data, 
      subdomain: cachedSubdomain, 
      masked_org_id: cachedMaskedOrgId, 
      timestamp 
    } = cacheData;
    
    // Check if cache is still valid
    if (Date.now() - timestamp >= BRANDING_CACHE_TTL) {
      localStorage.removeItem(BRANDING_CACHE_KEY);
      return null;
    }
    
    // If we have subdomain, match by subdomain
    if (subdomain && cachedSubdomain === subdomain) {
      return { data, masked_org_id: cachedMaskedOrgId };
    }
    
    // If no subdomain but we have masked_org_id, match by masked_org_id
    if (!subdomain && maskedOrgId && cachedMaskedOrgId === maskedOrgId) {
      return { data, masked_org_id: cachedMaskedOrgId };
    }
    
    // No match - organization might have switched
    return null;
  } catch (e) {
    localStorage.removeItem(BRANDING_CACHE_KEY);
    return null;
  }
}

/**
 * Check if branding exists in localStorage and validate masked_org_id
 */
export function hasBrandingInCache(maskedOrgId = null) {
  try {
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (!cached) return false;
    
    const cacheData = JSON.parse(cached);
    const { timestamp, masked_org_id: cachedMaskedOrgId } = cacheData;
    
    // Check if cache is still valid
    if (Date.now() - timestamp >= BRANDING_CACHE_TTL) {
      return false;
    }
    
    // If we have masked_org_id, check if it matches
    if (maskedOrgId && cachedMaskedOrgId === maskedOrgId) {
      return true;
    }
    
    // If no masked_org_id yet, check if we have any valid branding
    if (!maskedOrgId && cacheData.data) {
      return true;
    }
    
    // Organization might have switched - invalidate cache
    if (maskedOrgId && cachedMaskedOrgId && maskedOrgId !== cachedMaskedOrgId) {
      localStorage.removeItem(BRANDING_CACHE_KEY);
      return false;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Validate if organization switched by checking masked_org_id
 * @param {string} newMaskedOrgId - New masked organization ID from response
 * @returns {boolean} - True if organization switched, false otherwise
 */
export function validateOrganizationSwitch(newMaskedOrgId) {
  try {
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (!cached) return false; // No cache, can't validate
    
    const cacheData = JSON.parse(cached);
    const { masked_org_id: cachedMaskedOrgId } = cacheData;
    
    // If masked_org_id doesn't match, organization switched
    if (cachedMaskedOrgId && newMaskedOrgId && cachedMaskedOrgId !== newMaskedOrgId) {
      // Clear cache - organization switched
      localStorage.removeItem(BRANDING_CACHE_KEY);
      return true; // Organization switched
    }
    
    return false; // Same organization
  } catch (e) {
    return false;
  }
}

/**
 * Cache branding data (supports both subdomain and masked_org_id)
 * Handles null masked_org_id gracefully
 */
function setCachedBranding(subdomain, brandingData, maskedOrgId = null) {
  try {
    // Use provided maskedOrgId, or extract from brandingData, or null
    const finalMaskedOrgId = maskedOrgId || brandingData?.masked_org_id || null;
    
    const cache = {
      subdomain: subdomain || null,
      masked_org_id: finalMaskedOrgId, // Can be null if not available
      data: brandingData,
      timestamp: Date.now()
    };
    localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Ignore localStorage errors (quota exceeded, etc.)
    console.warn('Failed to cache branding:', e);
  }
}

/**
 * Hook to fetch and use organization branding for login page
 */
export function useLoginBranding() {
  const [subdomain, setSubdomain] = useState(null);
  const getAppName = useAppConfigStore((state) => state.getAppName);
  const getAppShortName = useAppConfigStore((state) => state.getAppShortName);
  
  // Extract subdomain on mount
  useEffect(() => {
    const detected = extractSubdomain();
    setSubdomain(detected);
  }, []);
  
  // Check cache first
  const cachedResult = subdomain ? getCachedBranding(subdomain) : null;
  const cachedBranding = cachedResult?.data || null;
  
  // Fetch branding by subdomain (only if not cached)
  const { data: fetchedBranding, error } = useQuery({
    queryKey: ['organization', 'branding', 'public', subdomain],
    queryFn: async () => {
      if (!subdomain) return null;
      
      try {
        const res = await axiosInstance.get(`/api/organizations/${subdomain}/branding`);
        const brandingData = res.data?.data || null;
        
        // Cache the branding data with masked_org_id
        if (brandingData) {
          setCachedBranding(subdomain, brandingData, brandingData.masked_org_id);
        }
        
        return brandingData;
      } catch (error) {
        // Fail silently - use defaults
        return null;
      }
    },
    enabled: !!subdomain && !cachedBranding, // Only fetch if not cached
    staleTime: BRANDING_CACHE_TTL, // Use same TTL as localStorage
    retry: false,
    onError: (error) => {
      // Clear invalid cache on error
      if (subdomain) {
        const cached = getCachedBranding(subdomain);
        if (cached) {
          localStorage.removeItem(BRANDING_CACHE_KEY);
        }
      }
    }
  });
  
  // Use fetched branding or cached branding
  const branding = fetchedBranding || cachedBranding || {};
  
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

// Export helper functions for login flow
export { getCachedBranding, setCachedBranding };


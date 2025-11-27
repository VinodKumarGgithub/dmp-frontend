import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { hasBrandingInCache, setCachedBranding, validateOrganizationSwitch } from '../hooks/useLoginBranding';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      selectedTenant: null,
      pagesConfig: [],
      pagesLoading: false,

      // Actions
      setUser: (user) => set({ user }),
      
      // Update user profile (merges with existing user data)
      updateUserProfile: (profileData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...profileData } });
        }
      },
      
      setSelectedTenant: (tenantId) => {
        set({ selectedTenant: tenantId });
      },

      setPagesConfig: (pagesConfig) => set({ pagesConfig }),
      
      setPagesLoading: (loading) => set({ pagesLoading: loading }),

      login: async (username, password, loginApi, queryClient) => {
        try {
          // Check if we have branding in cache before login
          // We don't have masked_org_id yet, so check for any valid branding
          const hasCaching = hasBrandingInCache(null);
          
          // Call login API with header indicating if we have branding
          const result = await loginApi(username, password, hasCaching);
          
          // Decode token to get user info
          const payload = JSON.parse(atob(result.token.split('.')[1]));
          const userData = {
            username: payload.username,
            role: payload.role,
            organization_id: payload.organization_id || null,
            name: payload.name,
            email: payload.email,
            phone_number: payload.phone_number,
            profile_picture: payload.profile_picture,
          };
          
          // If branding was provided in login response
          if (result.branding) {
            const maskedOrgId = result.branding.masked_org_id;
            
            // Only validate organization switch if we have a masked_org_id
            if (maskedOrgId) {
              const orgSwitched = validateOrganizationSwitch(maskedOrgId);
              // If organization switched, cache was already cleared by validateOrganizationSwitch
            }
            
            // Cache the branding data with masked_org_id (handles null gracefully)
            setCachedBranding(null, result.branding, maskedOrgId);
          }
          
          set({ user: userData, pagesLoading: true });
          
          // Invalidate and refetch pages config immediately after login
          if (queryClient) {
            await queryClient.invalidateQueries({ queryKey: ['pages'] });
            await queryClient.refetchQueries({ queryKey: ['pages'] });
          }
          
          return result;
        } catch (error) {
          set({ pagesLoading: false });
          throw error;
        }
      },

      logout: (logoutApi, queryClient) => {
        if (logoutApi) {
          logoutApi();
        }
        
        // Clear branding cache on logout to prevent showing wrong organization's branding
        try {
          localStorage.removeItem('organization_branding');
        } catch (e) {
          // Ignore localStorage errors (quota exceeded, etc.)
        }
        
        set({ 
          user: null, 
          selectedTenant: null,
          pagesConfig: [],
        });
        if (queryClient) {
          queryClient.clear(); // Clear all cached queries
        }
      },

      // Computed
      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        selectedTenant: state.selectedTenant,
      }),
    }
  )
);

export default useAuthStore;


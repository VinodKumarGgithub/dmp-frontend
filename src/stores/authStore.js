import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
          const result = await loginApi(username, password);
          
          // Decode token to get user info
          const payload = JSON.parse(atob(result.token.split('.')[1]));
          const userData = {
            username: payload.username,
            role: payload.role,
            name: payload.name,
            email: payload.email,
            phone_number: payload.phone_number,
            profile_picture: payload.profile_picture,
          };
          
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


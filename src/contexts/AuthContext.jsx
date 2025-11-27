import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login as loginApi, logout as logoutApi } from '../api/auth';
import { usePages } from '../api/pages';
import useAuthStore from '../stores/authStore';

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { 
    user, 
    selectedTenant, 
    setUser, 
    setSelectedTenant, 
    setPagesConfig, 
    setPagesLoading,
    login: storeLogin,
    logout: storeLogout,
  } = useAuthStore();

  // Check if user is authenticated on mount and load tenant
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Try to decode token to get user info (basic - you might want to verify with backend)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.username,
          role: payload.role,
          organization_id: payload.organization_id || null,
          name: payload.name,
          email: payload.email,
          phone_number: payload.phone_number,
          profile_picture: payload.profile_picture,
        });
      } catch (e) {
        // Invalid token, clear it
        localStorage.removeItem('token');
      }
    }

    // Load selected tenant from localStorage (Zustand persist will handle this, but sync it)
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId && !selectedTenant) {
      setSelectedTenant(tenantId);
    }
  }, [setUser, setSelectedTenant, selectedTenant]);

  // Fetch pages config immediately when user is authenticated
  const { data: pagesData, isLoading: pagesLoading } = usePages({
    enabled: !!user, // Only fetch when user is logged in
  });

  // Sync pages config to store
  useEffect(() => {
    // Always update loading state to ensure it's in sync
    setPagesLoading(pagesLoading);
    
    if (pagesData) {
      const pagesConfig = pagesData?.data || (Array.isArray(pagesData) ? pagesData : []);
      setPagesConfig(pagesConfig);
      // Ensure loading is set to false when data is received
      if (pagesLoading === false) {
        setPagesLoading(false);
      }
    } else if (pagesLoading === false && user) {
      // If query is done but no data, ensure loading is false
      setPagesLoading(false);
    }
  }, [pagesData, pagesLoading, setPagesConfig, setPagesLoading, user]);

  // Wrapper functions that use the store
  const login = async (username, password) => {
    return storeLogin(username, password, loginApi, queryClient);
  };

  const logout = () => {
    storeLogout(logoutApi, queryClient);
  };

  // Return children directly - components will use the store directly
  return children;
}

// Hook for backward compatibility - now uses Zustand store
export function useAuth() {
  const queryClient = useQueryClient();
  const store = useAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated(),
    loading: false, // Zustand persist handles loading synchronously, no initial loading needed
    login: async (username, password) => {
      return store.login(username, password, loginApi, queryClient);
    },
    logout: () => {
      store.logout(logoutApi, queryClient);
    },
    pagesConfig: store.pagesConfig,
    pagesLoading: store.pagesLoading,
    selectedTenant: store.selectedTenant,
    setSelectedTenant: store.setSelectedTenant,
  };
}


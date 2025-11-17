import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, logout as logoutApi } from '../api/auth';
import { usePages } from '../api/pages';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const queryClient = useQueryClient();

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
        });
      } catch (e) {
        // Invalid token, clear it
        localStorage.removeItem('token');
      }
    }

    // Load selected tenant from localStorage
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      setSelectedTenant(tenantId);
    }

    setLoading(false);
  }, []);

  // Fetch pages config immediately when user is authenticated
  const { data: pagesData, isLoading: pagesLoading } = usePages({
    enabled: !!user, // Only fetch when user is logged in
  });

  const login = async (username, password) => {
    try {
      const result = await loginApi(username, password);
      
      // Decode token to get user info
      const payload = JSON.parse(atob(result.token.split('.')[1]));
      const userData = {
        username: payload.username,
        role: payload.role,
      };
      
      setUser(userData);
      
      // Invalidate and refetch pages config immediately after login
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
      await queryClient.refetchQueries({ queryKey: ['pages'] });
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    logoutApi();
    setUser(null);
    setSelectedTenant(null);
    localStorage.removeItem('tenantId');
    queryClient.clear(); // Clear all cached queries
  };

  // Extract pages from response (handle both { data: [...] } and direct array)
  const pagesConfig = pagesData?.data || (Array.isArray(pagesData) ? pagesData : []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    pagesConfig,
    pagesLoading,
    selectedTenant,
    setSelectedTenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}


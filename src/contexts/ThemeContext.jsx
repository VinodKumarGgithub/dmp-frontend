import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { theme } from 'antd';
import { usePreferences, useUpdatePreferences } from '../api/profile';
import useAuthStore from '../stores/authStore';
import { applyFontFamily, DEFAULT_FONT } from '../utils/fontLoader';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;
  
  const { data: preferencesData } = usePreferences({ enabled: isAuthenticated });
  const preferences = preferencesData?.data || preferencesData || {};
  const updatePreferencesMutation = useUpdatePreferences();
  
  // Debounced preference update
  const debounceTimerRef = useRef(null);
  const debouncedUpdatePreferences = useCallback((prefs) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updatePreferencesMutation.mutate(prefs);
    }, 5000); // 5s debounce delay
  }, [updatePreferencesMutation]);

  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load theme from API preferences when available (only if authenticated)
  useEffect(() => {
    if (isAuthenticated && preferences?.theme) {
      const themeFromApi = preferences.theme === 'dark';
      const currentIsDark = isDark;
      if (themeFromApi !== currentIsDark) {
        setIsDark(themeFromApi);
        localStorage.setItem('theme', preferences.theme);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.theme, isAuthenticated]); // Only depend on theme from API

  // Apply font family from preferences on initial load and when it changes
  useEffect(() => {
    const fontFamily = preferences?.fontFamily || DEFAULT_FONT;
    applyFontFamily(fontFamily);
  }, [preferences?.fontFamily]);

  // Apply default font on initial mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      applyFontFamily(DEFAULT_FONT);
    }
  }, [isAuthenticated]);

  // Save theme preference to localStorage only (not to API - API updates happen on explicit user action)
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    // Save to API only when user explicitly toggles theme (no debounce needed for explicit action)
    if (isAuthenticated) {
      updatePreferencesMutation.mutate({
        theme: newIsDark ? 'dark' : 'light',
        language: preferences?.language || 'en',
        fontFamily: preferences?.fontFamily || DEFAULT_FONT,
      });
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
  const fontFamily = preferences?.fontFamily || DEFAULT_FONT;

  const value = {
    isDark,
    toggleTheme,
    algorithm,
    fontFamily,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}


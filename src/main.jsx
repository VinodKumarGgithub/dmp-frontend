import React, { useState, useEffect, useRef } from 'react';
import App from './App.jsx';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider, message } from 'antd';
import enUS from 'antd/locale/en_US';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { handleApiError } from './utils/errorHandler';
import LoadingScreen from './components/LoadingScreen';
import { DEFAULT_FONT } from './utils/fontLoader';
import { useOrganizationBranding } from './hooks/useOrganizationBranding';
import 'antd/dist/reset.css';

// Configure Ant Design message to show only one toast at a time
message.config({
  maxCount: 1,
  duration: 4,
  top: 24,
});

// Configure React Query with enhanced caching and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for network/server errors
        return failureCount < 2;
      },
      // Global error handler for queries - only show toast on final failure (not retries)
      // This prevents duplicate toasts when React Query retries failed requests
      onError: (error, query) => {
        // Check if this is a 4xx error (client error - no retry) or final retry failure
        // 4xx errors: retry returns false immediately, so failureCount = 0 but it's final
        // 5xx errors: retry up to 2 times, so failureCount 0,1 are retries, 2 is final
        const is4xxError = error?.response?.status >= 400 && error?.response?.status < 500;
        const isFinalRetry = query.state.failureCount >= 2;
        
        // Only show toast on final failure (4xx errors or after all retries exhausted)
        if (is4xxError || isFinalRetry) {
          handleApiError(error);
        }
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
      // Use structural sharing to prevent unnecessary re-renders
      structuralSharing: true,
    },
    mutations: {
      retry: 0,
      // Mutations don't retry, so handleApiError in hooks is fine (no duplicates)
      // Optimistic updates can be added per mutation
    },
  },
});

function ThemeConfigWrapper({ children }) {
  const { algorithm, fontFamily } = useTheme();
  const currentFont = fontFamily || DEFAULT_FONT;
  
  // Use the hook for consistent branding and caching
  const branding = useOrganizationBranding();
  const primaryColor = branding.primaryColor || '#1890ff';
  
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        algorithm,
        token: {
          colorPrimary: primaryColor,
          borderRadius: 6,
          fontFamily: `"${currentFont}", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

function AppWithProviders() {
  const [initialLoading, setInitialLoading] = useState(true);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    // Track mount time
    mountTimeRef.current = Date.now();

    // Minimum display time: 2 seconds - ensure loading screen shows for at least 2 seconds
    const minDisplayTimer = setTimeout(() => {
      const elapsed = Date.now() - mountTimeRef.current;
      // Only hide if at least 2 seconds have passed
      if (elapsed >= 2000) {
        setInitialLoading(false);
      } else {
        // If somehow less than 2 seconds, wait for the remainder
        const remaining = 2000 - elapsed;
        setTimeout(() => {
          setInitialLoading(false);
        }, remaining);
      }
    }, 2000);

    return () => {
      clearTimeout(minDisplayTimer);
    };
  }, []);

  // Show initial loading screen for at least 2 seconds
  if (initialLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemeConfigWrapper>
            <AntdApp>
              <LoadingScreen isLoading={true} />
            </AntdApp>
          </ThemeConfigWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeConfigWrapper>
          <AntdApp>
            <AuthProvider>
      <App />
            </AuthProvider>
          </AntdApp>
        </ThemeConfigWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
);

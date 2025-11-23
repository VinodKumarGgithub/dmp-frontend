import React from 'react';
import App from './App.jsx';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import 'antd/dist/reset.css';

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
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache persists for 10 minutes (formerly cacheTime)
      // Use structural sharing to prevent unnecessary re-renders
      structuralSharing: true,
    },
    mutations: {
      retry: 0,
      // Optimistic updates can be added per mutation
    },
  },
});

function ThemeConfigWrapper({ children }) {
  const { algorithm } = useTheme();
  
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        algorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
  </React.StrictMode>
);

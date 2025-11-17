import React from 'react';
import App from './App.jsx';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import 'antd/dist/reset.css';

// Configure React Query with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
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

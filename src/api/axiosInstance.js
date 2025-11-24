import axios from 'axios';
import { message } from 'antd';
import useAuthStore from '../stores/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 900000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant ID from Zustand store (fallback to localStorage for compatibility)
    const store = useAuthStore.getState();
    const tenantId = store.selectedTenant || localStorage.getItem('tenantId');
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle success response format from your backend
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    // Handle error response
    const errorResponse = error.response?.data || {};
    const errorCode = errorResponse.error?.code || errorResponse.code || 'INTERNAL_ERROR';
    const errorDetails = errorResponse.error?.details || errorResponse.details;
    
    // Get raw message (prefer message, fallback to details, then default)
    const rawMessage = errorResponse.message || 
                      errorResponse.error?.message || 
                      error.message || 
                      null;
    
    // Format error message: Show message with details in brackets if both exist
    let formattedMessage;
    let detailsText = null;
    if (errorDetails) {
      if (Array.isArray(errorDetails) && errorDetails.length > 0) {
        detailsText = errorDetails.join('; ');
      } else if (typeof errorDetails === 'string') {
        detailsText = errorDetails;
      }
    }
    
    if (rawMessage && detailsText) {
      // Both message and details: concatenate with brackets
      formattedMessage = `${rawMessage} (${detailsText})`;
    } else if (rawMessage) {
      formattedMessage = rawMessage;
    } else if (detailsText) {
      formattedMessage = detailsText;
    } else {
      formattedMessage = 'An error occurred';
    }

    // Skip toast by default - let hooks/components handle error display via handleApiError
    // Only show toast if explicitly requested via config.skipToast = false
    // This prevents duplicate toasts (interceptor + handleApiError)
    const showToast = error.config?.showToast === true; // Explicitly opt-in
    const skipToast = error.config?.skipToast === true; // Explicitly opt-out
    
    // Skip toast for auth errors as they're handled by handleApiError
    const isAuthError = error.config?.url?.includes('/auth/');
    
    // Only show toast if explicitly requested and not skipped
    // By default, skip toast - let hooks/components handle it via handleApiError
    if (showToast && !skipToast && !isAuthError) {
      const duration = (errorCode === 'USER_BLOCKED' || errorCode === 'DANGEROUS_SQL_DETECTED') ? 6 : 4;
      message.error(formattedMessage, duration);
    }

    // Log error for debugging
    console.error('API Error:', {
      code: errorCode,
      message: rawMessage,
      formattedMessage: formattedMessage,
      details: errorDetails,
      status: error.response?.status,
      url: error.config?.url,
    });

    // Return a consistent error format
    return Promise.reject({
      code: errorCode,
      message: rawMessage || formattedMessage, // Return raw message if available, otherwise formatted
      formattedMessage: formattedMessage,
      details: errorDetails,
      status: error.response?.status || 500,
    });
  }
);

export default axiosInstance;


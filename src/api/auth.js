import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Login user with username and password
 * @param {string} username
 * @param {string} password
 * @param {boolean} hasBranding - Whether client already has branding cached
 * @returns {Promise<{token: string, branding?: object}>}
 */
export async function login(username, password, hasBranding = false) {
  try {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    }, {
      headers: {
        'x-has-branding': hasBranding ? 'true' : 'false'
      }
    });

    // Backend returns { success: true, data: { token, branding? } }
    const data = response.data?.data || response.data || response;
    const token = data.token || response.token;
    
    if (token) {
      localStorage.setItem('token', token);
      showSuccess('Login successful!');
      
      // Return both token and branding (if provided)
      return {
        token,
        branding: data.branding || null
      };
    }

    throw new Error('No token received from server');
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

/**
 * Logout user - clears token from localStorage
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('tenantId');
  showSuccess('Logged out successfully');
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Get stored token
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem('token');
}


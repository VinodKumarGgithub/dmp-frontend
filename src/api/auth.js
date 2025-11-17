import axiosInstance from './axiosInstance';
import { handleApiError, showSuccess } from '../utils/errorHandler';

/**
 * Login user with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token: string}>}
 */
export async function login(username, password) {
  try {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });

    // Backend returns { success: true, data: { token } }
    const token = response.data?.token || response.token;
    
    if (token) {
      localStorage.setItem('token', token);
      showSuccess('Login successful!');
      return { token };
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


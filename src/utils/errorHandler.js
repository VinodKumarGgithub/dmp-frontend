import { message as antdMessage } from 'antd';

/**
 * Handle API errors and show appropriate toast notifications
 * @param {Error|Object} error - Error object from API call
 * @param {Object} options - Options for error handling
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {string} options.defaultMessage - Default error message if none provided
 */
export function handleApiError(error, options = {}) {
  const { showToast = true, defaultMessage = 'An error occurred' } = options;

  const errorMessage =
    error?.message ||
    error?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    defaultMessage;

  const errorCode = error?.code || error?.error?.code || error?.response?.data?.error?.code;
  const errorDetails = error?.details || error?.error?.details || error?.response?.data?.error?.details;

  if (showToast) {
    antdMessage.error(errorMessage, 4);
  }

  return {
    message: errorMessage,
    code: errorCode,
    details: errorDetails,
    originalError: error,
  };
}

/**
 * Show success toast notification
 * @param {string} msg - Success message
 * @param {number} duration - Duration in seconds (default: 3)
 */
export function showSuccess(msg, duration = 3) {
  antdMessage.success(msg, duration);
}

/**
 * Show error toast notification
 * @param {string} msg - Error message
 * @param {number} duration - Duration in seconds (default: 4)
 */
export function showError(msg, duration = 4) {
  antdMessage.error(msg, duration);
}

/**
 * Show warning toast notification
 * @param {string} msg - Warning message
 * @param {number} duration - Duration in seconds (default: 3)
 */
export function showWarning(msg, duration = 3) {
  antdMessage.warning(msg, duration);
}

/**
 * Show info toast notification
 * @param {string} msg - Info message
 * @param {number} duration - Duration in seconds (default: 3)
 */
export function showInfo(msg, duration = 3) {
  antdMessage.info(msg, duration);
}


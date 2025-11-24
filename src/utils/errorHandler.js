import { message as antdMessage } from 'antd';

/**
 * Handle API errors and show appropriate toast notifications
 * @param {Error|Object} error - Error object from API call
 * @param {Object} options - Options for error handling
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {string} options.defaultMessage - Default error message if none provided
 */
/**
 * Format error message (without code prefix)
 * Shows: Message if message exists, otherwise uses details
 */
function formatErrorMessage(message, details) {
  // Use message if available, otherwise use details
  let displayMessage = message;
  
  if (!displayMessage && details) {
    if (Array.isArray(details) && details.length > 0) {
      displayMessage = details[0];
    } else if (typeof details === 'string') {
      displayMessage = details;
    }
  }
  
  // If still no message, use default
  if (!displayMessage) {
    displayMessage = 'An error occurred';
  }
  
  return displayMessage;
}

export function handleApiError(error, options = {}) {
  const { showToast = true, defaultMessage = 'An error occurred' } = options;

  const errorCode = error?.code || error?.error?.code || error?.response?.data?.error?.code;
  const errorDetails = error?.details || error?.error?.details || error?.response?.data?.error?.details;
  
  // Get raw message (without code prefix)
  const rawMessage =
    error?.message ||
    error?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    null;

  // Format error message (without code), using details as fallback
  const formattedMessage = formatErrorMessage(rawMessage, errorDetails);

  // For USER_BLOCKED, show longer duration
  const duration = errorCode === 'USER_BLOCKED' ? 6 : 4;

  if (showToast) {
    if (errorCode === 'USER_BLOCKED') {
      antdMessage.error({
        content: formattedMessage,
        duration: duration,
        style: { marginTop: '20vh' },
      });
    } else {
      antdMessage.error(formattedMessage, duration);
    }
  }

  return {
    message: formattedMessage,
    rawMessage: rawMessage,
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


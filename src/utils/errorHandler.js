import React from 'react';
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
 * If both message and details exist, shows: "Message (details)"
 */
function formatErrorMessage(message, details) {
  let displayMessage = message;
  
  // Format details for display
  let detailsText = null;
  if (details) {
    if (Array.isArray(details) && details.length > 0) {
      // Join multiple details with semicolon
      detailsText = details.join('; ');
    } else if (typeof details === 'string') {
      detailsText = details;
    }
  }
  
  // If no message but we have details, use details
  if (!displayMessage && detailsText) {
    displayMessage = detailsText;
  } else if (displayMessage && detailsText) {
    // If both message and details exist, concatenate with brackets
    displayMessage = `${displayMessage} (${detailsText})`;
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

  // Extract details text separately for helper text
  let detailsText = null;
  if (errorDetails) {
    if (Array.isArray(errorDetails) && errorDetails.length > 0) {
      detailsText = errorDetails.join('; ');
    } else if (typeof errorDetails === 'string') {
      detailsText = errorDetails;
    }
  }

  // For USER_BLOCKED and DANGEROUS_SQL_DETECTED, show longer duration
  const duration = (errorCode === 'USER_BLOCKED' || errorCode === 'DANGEROUS_SQL_DETECTED') ? 6 : 4;

  if (showToast) {
    // Build toast content with helper text if details exist
    // Use Ant Design's built-in toast size and positioning (no hardcoded styles)
    let toastContent;
    
    if (rawMessage && detailsText && rawMessage !== detailsText) {
      // Show message with details as helper text
      toastContent = React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { fontWeight: 500, marginBottom: 4 } },
          rawMessage
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: '12px',
              opacity: 0.85,
              marginTop: 4,
              lineHeight: '1.4',
              wordBreak: 'break-word'
            }
          },
          detailsText
        )
      );
    } else {
      // Just show formatted message
      toastContent = formattedMessage;
    }

    // Show toast using Ant Design's default positioning and sizing
    antdMessage.error({
      content: toastContent,
      duration: duration,
    });
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


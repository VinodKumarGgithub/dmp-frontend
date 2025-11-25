import CryptoJS from 'crypto-js';

/**
 * Generate Gravatar URL from email
 * @param {string} email - User email address
 * @param {number} size - Avatar size in pixels (default: 200)
 * @returns {string} Gravatar URL
 */
export function getGravatarUrl(email, size = 200) {
  if (!email) return null;
  
  // Trim and lowercase email (Gravatar requirement)
  const trimmedEmail = email.trim().toLowerCase();
  
  // Create MD5 hash using crypto-js
  const hash = CryptoJS.MD5(trimmedEmail).toString();
  
  // Return Gravatar URL with identicon fallback
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=pg`;
}

/**
 * Get user avatar URL (Gravatar based on email)
 * @param {Object} user - User object with email
 * @param {number} size - Avatar size in pixels (default: 200)
 * @returns {string|null} Avatar URL or null
 */
export function getUserAvatarUrl(user, size = 200) {
  if (!user) return null;
  
  // Use Gravatar if email is available
  if (user.email) {
    return getGravatarUrl(user.email, size);
  }
  
  return null;
}


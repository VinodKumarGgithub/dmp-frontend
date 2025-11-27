/**
 * Extract subdomain from hostname
 * Examples:
 * - acme.app.com -> acme
 * - acme.localhost -> null (development, can't detect)
 * - app.com -> null
 */

/**
 * Validate subdomain format
 */
function isValidSubdomain(subdomain) {
  if (!subdomain || typeof subdomain !== 'string') {
    return false;
  }
  
  const sanitized = subdomain.toLowerCase().trim();
  
  // Validate format: 1-63 chars, alphanumeric, hyphens, underscores
  // Must start with letter or number
  if (!/^[a-z0-9][a-z0-9_-]{0,62}$/.test(sanitized)) {
    return false;
  }
  
  // Check reserved subdomains
  const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp'];
  if (reserved.includes(sanitized)) {
    return false;
  }
  
  return true;
}

/**
 * Extract subdomain from hostname
 */
export function extractSubdomain() {
  const hostname = window.location.hostname;
  
  // Handle localhost/127.0.0.1 (development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  const parts = hostname.split('.');
  
  // For production: app.com, acme.app.com, www.app.com
  // If we have 3+ parts, first is subdomain (unless it's 'www')
  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();
    
    // Validate format
    if (!isValidSubdomain(subdomain)) {
      return null; // Invalid format
    }
    
    return subdomain;
  }
  
  // 2 parts = no subdomain (e.g., app.com)
  return null;
}


import CryptoJS from 'crypto-js';

/**
 * Decrypt SQL query from audit log
 * Matches backend encryption: AES-256-CBC with format "iv_base64:encrypted_base64"
 * @param {string} encryptedSql - Encrypted SQL in format "iv_base64:encrypted_base64"
 * @returns {string|null} - Decrypted SQL or null if decryption fails
 */
export function decryptSql(encryptedSql) {
  if (!encryptedSql) return null;

  const LOG_ENCRYPTION_KEY = import.meta.env.VITE_LOG_ENCRYPTION_KEY || '';
  
  if (!LOG_ENCRYPTION_KEY) {
    if (import.meta.env.DEV) {
      console.warn('Encryption key not configured');
    }
    return null;
  }

  try {
    // Parse the encrypted format: "iv_base64:encrypted_base64"
    const [ivBase64, encryptedBase64] = encryptedSql.split(':');
    if (!ivBase64 || !encryptedBase64) {
      if (import.meta.env.DEV) {
        console.error('Invalid encrypted SQL format. Expected "iv_base64:encrypted_base64"');
      }
      return null;
    }

    // Convert base64 strings to WordArray (crypto-js format)
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedBase64);
    
    // Derive key: SHA256 hash of the encryption key (same as backend)
    // Backend uses: crypto.createHash('sha256').update(LOG_ENCRYPTION_KEY).digest()
    const key = CryptoJS.SHA256(LOG_ENCRYPTION_KEY);

    // Create CipherParams object with the ciphertext
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext
    });

    // Decrypt using AES-256-CBC
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    // Convert to string
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      if (import.meta.env.DEV) {
        console.error('Decryption returned empty string. Check encryption key or data format.');
      }
      return null; // Decryption failed
    }

    return decryptedText;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to decrypt SQL:', error);
      console.error('Encrypted SQL (first 50 chars):', encryptedSql?.substring(0, 50));
    }
    return null;
  }
}


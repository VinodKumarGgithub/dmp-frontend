import { Alert } from 'antd';
import { useLicenseStatus } from '../hooks/useLicenseStatus';

/**
 * License Status Banner Component
 * Displays license status warnings/errors at the top of the app
 */
export function LicenseStatusBanner() {
  const { data: license, isLoading, error } = useLicenseStatus();

  // Don't show anything while loading
  if (isLoading) {
    return null;
  }

  // Don't show if there's an error (let other error handlers deal with it)
  if (error) {
    return null;
  }

  // Don't show if license is valid or if data is not available
  if (!license || license?.valid) {
    return null;
  }

  // Show warning for expired license
  if (license?.reason === 'EXPIRED') {
    return (
      <div style={{ marginBottom: 16 }}>
        <Alert
          message="License Expired"
          description={
            <div>
              <p>
                Your license expired on {license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'the expiration date'}.
              </p>
              <p style={{ marginBottom: 0 }}>
                You are in <strong>read-only mode</strong>. Please renew your license to continue creating and editing pages.
              </p>
            </div>
          }
          type="warning"
          showIcon
          closable={false}
          banner
        />
      </div>
    );
  }

  // Show error for other invalid license reasons
  return (
    <div style={{ marginBottom: 16 }}>
      <Alert
        message="License Invalid"
        description={
          <div>
            <p>{license?.message || 'Your license is invalid. Please contact support.'}</p>
            {license?.reason === 'NO_LICENSE' && (
              <p style={{ marginBottom: 0 }}>
                No license found for this organization. Please contact support to obtain a license.
              </p>
            )}
            {license?.reason === 'INSTANCE_MISMATCH' && (
              <p style={{ marginBottom: 0 }}>
                This license is bound to a different instance. Please contact support.
              </p>
            )}
          </div>
        }
        type="error"
        showIcon
        closable={false}
        banner
      />
    </div>
  );
}


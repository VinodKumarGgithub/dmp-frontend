import { memo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../stores/authStore';

/**
 * TenantDependentContent - Wraps only the content that needs to re-render when tenant changes.
 * This prevents full page re-renders by isolating tenant-dependent components.
 * 
 * Components that need tenant data should be wrapped in this component.
 * Components that don't need tenant data (like AppLayout structure) should remain outside.
 */
function TenantDependentContent({ children }) {
  const selectedTenant = useAuthStore((state) => state.selectedTenant);
  const queryClient = useQueryClient();

  // This component will re-render when selectedTenant changes
  // But it's isolated from the rest of the app structure
  return <>{children}</>;
}

// Memoize to prevent re-renders when parent re-renders but tenant hasn't changed
export default memo(TenantDependentContent);


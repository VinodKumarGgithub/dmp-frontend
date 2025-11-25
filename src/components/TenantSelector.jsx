import { Dropdown, Button, Spin, Typography, Space, theme as antdTheme } from 'antd';
import { DatabaseOutlined, CheckOutlined } from '@ant-design/icons';
import { useTenants } from '../api/tenants';
import useAuthStore from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '../utils/errorHandler';

const { Text } = Typography;

export default function TenantSelector() {
  const selectedTenant = useAuthStore((state) => state.selectedTenant);
  const setSelectedTenant = useAuthStore((state) => state.setSelectedTenant);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const queryClient = useQueryClient();
  const { token } = antdTheme.useToken();

  // Fetch only ACTIVE tenants for selection - only when authenticated
  const { data: tenantsData, isLoading } = useTenants(
    { status: 'ACTIVE' },
    { enabled: isAuthenticated }
  );
  const tenants = tenantsData?.data || (Array.isArray(tenantsData) ? tenantsData : []);

  const handleTenantChange = (tenantId) => {
    setSelectedTenant(tenantId);
    
    // Only invalidate tenant-specific queries, not all queries
    // This prevents unnecessary re-renders of components that don't depend on tenant
    // Invalidate queries that are tenant-dependent:
    // - ['pages'] - pages list
    // - ['pages', pageKey, ...] - page config and data
    // - ['pagePreferences', pageKey] - page preferences
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey) && queryKey.length > 0) {
          const firstKey = queryKey[0];
          // Invalidate tenant-dependent queries only
          return ['pages', 'pagePreferences'].includes(firstKey);
        }
        return false;
      }
    });
    
    if (tenantId) {
      // Show success message
      const tenant = tenants.find((t) => t.id === tenantId);
      showSuccess(`Switched to tenant: ${tenant?.name || tenantId}`);
    }
  };

  // Get current tenant name
  const currentTenant = tenants.find((t) => t.id === selectedTenant);
  const displayText = currentTenant ? currentTenant.name || currentTenant.id : 'Select Tenant';

  // Build menu items
  const menuItems = [
    ...(tenants.map((tenant) => ({
      key: tenant.id,
      label: (
        <Space>
          {selectedTenant === tenant.id && <CheckOutlined style={{ color: token.colorPrimary }} />}
          <div>
            <div>{tenant.name || tenant.id}</div>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {tenant.id}
            </Text>
          </div>
        </Space>
      ),
      onClick: () => handleTenantChange(tenant.id),
    }))),
    ...(selectedTenant
      ? [
          {
            type: 'divider',
          },
          {
            key: 'clear',
            label: 'Clear Selection',
            danger: true,
            onClick: () => handleTenantChange(null),
          },
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <Button
        icon={<DatabaseOutlined />}
        disabled
        style={{ color: token.colorText }}
      >
        <Spin size="small" style={{ marginRight: token.marginXS }} />
        Loading tenants...
      </Button>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <Button
        icon={<DatabaseOutlined />}
        disabled
        style={{ color: token.colorText }}
      >
        No tenants available
      </Button>
    );
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        icon={<DatabaseOutlined />}
        style={{ color: token.colorText }}
      >
        {displayText}
      </Button>
    </Dropdown>
  );
}

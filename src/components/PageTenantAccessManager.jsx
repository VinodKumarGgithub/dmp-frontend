import React from 'react';
import { Form, Select, Typography, Space, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTenants } from '../api/tenants';
import { usePageTenantAccess, useUpdatePageTenantAccess } from '../api/admin';

const { Text } = Typography;

export default function PageTenantAccessManager({ pageKey, form }) {
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants();
  const { data: accessData, isLoading: accessLoading } = usePageTenantAccess(pageKey, {
    enabled: !!pageKey,
  });
  const updateMutation = useUpdatePageTenantAccess();

  const tenants = tenantsData?.data || (Array.isArray(tenantsData) ? tenantsData : []);
  const currentTenantIds = accessData?.data?.tenantIds || [];

  const handleTenantChange = (tenantIds) => {
    if (!pageKey) return;
    
    updateMutation.mutate({
      pageKey,
      tenantIds: tenantIds || [],
    });
  };

  // Set initial value in form when access data loads
  React.useEffect(() => {
    if (accessData?.data && form) {
      form.setFieldsValue({
        tenantIds: currentTenantIds,
      });
    }
  }, [accessData, form, currentTenantIds]);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        message="Tenant Access Control"
        description={
          <div>
            <Text>
              Select which tenants can access this page. Leave empty to make the page available to all tenants (generic).
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              If specific tenants are selected, only those tenants will be able to access this page.
            </Text>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form.Item
        label="Accessible Tenants"
        name="tenantIds"
        tooltip="Leave empty for all tenants, or select specific tenants"
      >
        <Select
          mode="multiple"
          placeholder="Select tenants (leave empty for all tenants)"
          loading={tenantsLoading || accessLoading}
          onChange={handleTenantChange}
          disabled={updateMutation.isPending}
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={tenants.map((tenant) => ({
            label: tenant.name || tenant.id,
            value: tenant.id,
          }))}
        />
      </Form.Item>

      {currentTenantIds.length === 0 && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <InfoCircleOutlined /> This page is currently available to all tenants (generic).
        </Text>
      )}

      {currentTenantIds.length > 0 && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          <InfoCircleOutlined /> This page is restricted to {currentTenantIds.length} tenant(s).
        </Text>
      )}
    </Space>
  );
}


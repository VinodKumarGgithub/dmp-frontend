import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  message,
  theme as antdTheme,
  Tag,
  Select,
  Breadcrumb,
  Tooltip,
  Drawer,
  Descriptions,
  DatePicker,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  HomeOutlined,
  KeyOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { 
  useLicenses, 
  useLicenseByOrganization,
  useCreateLicense, 
  useUpdateLicense,
  useRenewLicense 
} from '../api/license';
import { useOrganizations } from '../api/organizations';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function LicenseManagement() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const { data: licensesData, isLoading } = useLicenses();
  const { data: organizationsData } = useOrganizations();
  const createMutation = useCreateLicense();
  const updateMutation = useUpdateLicense();
  const renewMutation = useRenewLicense();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [editingLicense, setEditingLicense] = useState(null);
  const [form] = Form.useForm();
  const [renewForm] = Form.useForm();

  const licenses = licensesData?.data || (Array.isArray(licensesData) ? licensesData : []);
  const organizations = organizationsData?.data || (Array.isArray(organizationsData) ? organizationsData : []);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Get organization name by ID
  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || orgId;
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'green',
      EXPIRED: 'red',
      SUSPENDED: 'orange',
      REVOKED: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      ACTIVE: <CheckCircleOutlined />,
      EXPIRED: <CloseCircleOutlined />,
      SUSPENDED: <StopOutlined />,
      REVOKED: <CloseCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const handleAdd = () => {
    setEditingLicense(null);
    form.resetFields();
    form.setFieldsValue({
      expiresInDays: 365,
      status: 'ACTIVE',
      features: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (license) => {
    setEditingLicense(license);
    form.setFieldsValue({
      organizationId: license.organizationId,
      maxUsers: license.maxUsers || null,
      maxTenants: license.maxTenants || null,
      features: license.features || [],
      instanceId: license.instanceId || null,
      status: license.status,
      expiresAt: license.expiresAt ? dayjs(license.expiresAt) : null,
    });
    setIsModalOpen(true);
  };

  const handleRenew = (license) => {
    setSelectedLicense(license);
    renewForm.resetFields();
    renewForm.setFieldsValue({
      additionalDays: 30,
    });
    setIsRenewModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingLicense) {
        // Update existing license
        await updateMutation.mutateAsync({
          organizationId: editingLicense.organizationId,
          updates: {
            maxUsers: values.maxUsers || null,
            maxTenants: values.maxTenants || null,
            features: values.features || [],
            instanceId: values.instanceId || null,
            status: values.status,
            expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null,
          },
        });
      } else {
        // Create new license
        await createMutation.mutateAsync({
          organizationId: values.organizationId,
          expiresInDays: values.expiresInDays || 365,
          maxUsers: values.maxUsers || null,
          maxTenants: values.maxTenants || null,
          features: values.features || [],
          instanceId: values.instanceId || null,
        });
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingLicense(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleRenewSubmit = async (values) => {
    try {
      await renewMutation.mutateAsync({
        organizationId: selectedLicense.organizationId,
        additionalDays: values.additionalDays,
      });
      
      setIsRenewModalOpen(false);
      renewForm.resetFields();
      setSelectedLicense(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleViewDetails = (license) => {
    setSelectedLicense(license);
    setIsDrawerOpen(true);
  };

  const columns = [
    {
      title: 'Organization',
      dataIndex: 'organizationId',
      key: 'organizationId',
      width: 200,
      render: (orgId) => (
        <Text strong>{getOrganizationName(orgId)}</Text>
      ),
    },
    {
      title: 'License Key',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      width: 250,
      render: (key) => (
        <Space>
          <KeyOutlined />
          <Text code style={{ fontSize: 12 }}>{key?.substring(0, 20)}...</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Expires At',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (expiresAt) => {
        if (!expiresAt) return <Text type="secondary">Never</Text>;
        const date = dayjs(expiresAt);
        const isExpired = date.isBefore(dayjs());
        const daysLeft = date.diff(dayjs(), 'day');
        return (
          <Space direction="vertical" size={0}>
            <Text type={isExpired ? 'danger' : daysLeft < 30 ? 'warning' : 'secondary'}>
              {date.format('YYYY-MM-DD')}
            </Text>
            {!isExpired && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {daysLeft} days left
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Limits',
      key: 'limits',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
          {record.maxUsers !== null && (
            <Text type="secondary">Users: {record.maxUsers === -1 ? '∞' : record.maxUsers}</Text>
          )}
          {record.maxTenants !== null && (
            <Text type="secondary">Tenants: {record.maxTenants === -1 ? '∞' : record.maxTenants}</Text>
          )}
          {record.maxUsers === null && record.maxTenants === null && (
            <Text type="secondary">Unlimited</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Features',
      dataIndex: 'features',
      key: 'features',
      width: 200,
      render: (features) => {
        if (!features || features.length === 0) {
          return <Text type="secondary">None</Text>;
        }
        return (
          <Space wrap>
            {features.map((feature) => (
              <Tag key={feature} color="blue" style={{ margin: 0 }}>
                {feature}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit License">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Renew License">
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={() => handleRenew(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Only SUPER_ADMIN can access
  if (!isSuperAdmin) {
    return (
      <div style={{ padding: token.paddingLG }}>
        <Alert
          message="Access Denied"
          description="Only SUPER_ADMIN users can access license management."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: token.paddingLG }}>
      <Breadcrumb
        style={{ marginBottom: token.marginMD }}
        items={[
          {
            title: (
              <Link to="/">
                <HomeOutlined /> Home
              </Link>
            ),
          },
          {
            title: (
              <Space>
                <KeyOutlined />
                <span>License Management</span>
              </Space>
            ),
          },
        ]}
      />
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: token.marginLG }}>
          <Title level={2} style={{ margin: 0 }}>
            <KeyOutlined /> License Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Create License
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={licenses}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit License Modal */}
      <Modal
        title={editingLicense ? 'Edit License' : 'Create New License'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingLicense(null);
        }}
        onOk={() => form.submit()}
        width={700}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {!editingLicense && (
            <Form.Item
              label="Organization"
              name="organizationId"
              rules={[{ required: true, message: 'Please select an organization' }]}
            >
              <Select
                placeholder="Select organization"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {organizations.map((org) => (
                  <Option key={org.id} value={org.id} label={org.name}>
                    {org.name} ({org.subdomain})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {!editingLicense && (
            <Form.Item
              label="Expires In (Days)"
              name="expiresInDays"
              rules={[{ required: true, message: 'Please enter expiration days' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          )}

          {editingLicense && (
            <Form.Item
              label="Expires At"
              name="expiresAt"
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item
            label="Max Users"
            name="maxUsers"
            tooltip="Leave empty for unlimited"
          >
            <InputNumber min={-1} style={{ width: '100%' }} placeholder="Unlimited" />
          </Form.Item>

          <Form.Item
            label="Max Tenants"
            name="maxTenants"
            tooltip="Leave empty for unlimited"
          >
            <InputNumber min={-1} style={{ width: '100%' }} placeholder="Unlimited" />
          </Form.Item>

          <Form.Item
            label="Features"
            name="features"
            tooltip="Select features enabled for this license"
          >
            <Select
              mode="multiple"
              placeholder="Select features"
              options={[
                { label: 'Export', value: 'export' },
                { label: 'Custom Branding', value: 'custom_branding' },
                { label: 'API Access', value: 'api_access' },
                { label: 'Advanced Filters', value: 'advanced_filters' },
                { label: 'Bulk Operations', value: 'bulk_operations' },
                { label: 'Delete Pages', value: 'delete_pages' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Instance ID (Optional)"
            name="instanceId"
            tooltip="Bind license to specific domain/IP"
          >
            <Input placeholder="e.g., example.com or 192.168.1.1" />
          </Form.Item>

          {editingLicense && (
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="ACTIVE">Active</Option>
                <Option value="EXPIRED">Expired</Option>
                <Option value="SUSPENDED">Suspended</Option>
                <Option value="REVOKED">Revoked</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Renew License Modal */}
      <Modal
        title="Renew License"
        open={isRenewModalOpen}
        onCancel={() => {
          setIsRenewModalOpen(false);
          renewForm.resetFields();
          setSelectedLicense(null);
        }}
        onOk={() => renewForm.submit()}
        confirmLoading={renewMutation.isPending}
        okText="Renew"
        cancelText="Cancel"
      >
        <Form
          form={renewForm}
          layout="vertical"
          onFinish={handleRenewSubmit}
        >
          <Alert
            message={`Renewing license for: ${selectedLicense ? getOrganizationName(selectedLicense.organizationId) : ''}`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            label="Additional Days"
            name="additionalDays"
            rules={[
              { required: true, message: 'Please enter number of days' },
              { type: 'number', min: 1, message: 'Must be at least 1 day' }
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* License Details Drawer */}
      <Drawer
        title="License Details"
        placement="right"
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLicense(null);
        }}
        open={isDrawerOpen}
        width={600}
      >
        {selectedLicense && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Organization">
              {getOrganizationName(selectedLicense.organizationId)}
            </Descriptions.Item>
            <Descriptions.Item label="License Key">
              <Text code>{selectedLicense.licenseKey}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedLicense.status)} icon={getStatusIcon(selectedLicense.status)}>
                {selectedLicense.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Expires At">
              {selectedLicense.expiresAt 
                ? dayjs(selectedLicense.expiresAt).format('YYYY-MM-DD HH:mm:ss')
                : 'Never'}
            </Descriptions.Item>
            <Descriptions.Item label="Max Users">
              {selectedLicense.maxUsers === null || selectedLicense.maxUsers === -1 
                ? 'Unlimited' 
                : selectedLicense.maxUsers}
            </Descriptions.Item>
            <Descriptions.Item label="Max Tenants">
              {selectedLicense.maxTenants === null || selectedLicense.maxTenants === -1 
                ? 'Unlimited' 
                : selectedLicense.maxTenants}
            </Descriptions.Item>
            <Descriptions.Item label="Features">
              {selectedLicense.features && selectedLicense.features.length > 0 ? (
                <Space wrap>
                  {selectedLicense.features.map((feature) => (
                    <Tag key={feature} color="blue">{feature}</Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">None</Text>
              )}
            </Descriptions.Item>
            {selectedLicense.instanceId && (
              <Descriptions.Item label="Instance ID">
                <Text code>{selectedLicense.instanceId}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created At">
              {selectedLicense.createdAt 
                ? dayjs(selectedLicense.createdAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {selectedLicense.updatedAt 
                ? dayjs(selectedLicense.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


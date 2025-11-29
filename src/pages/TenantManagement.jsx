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
  Popconfirm,
  message,
  theme as antdTheme,
  Tag,
  Select,
  Breadcrumb,
  Tooltip,
  Alert,
  Drawer,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant, useTestTenantConnection } from '../api/tenants';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useCanWrite } from '../hooks/useFeatureGate';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function TenantManagement() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const { data: tenantsData, isLoading } = useTenants();
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();
  const testConnectionMutation = useTestTenantConnection();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();

  const tenants = tenantsData?.data || (Array.isArray(tenantsData) ? tenantsData : []);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const { canWrite, readOnly } = useCanWrite();

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'green',
      INACTIVE: 'default',
      SUSPENDED: 'red',
    };
    return colors[status] || 'default';
  };

  const handleAdd = () => {
    setEditingTenant(null);
    form.resetFields();
    // Auto-set organization_id for non-SUPER_ADMIN users
    const initialValues = {
      dialect: 'mysql',
      db_port: 3306,
      status: 'ACTIVE',
    };
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.organization_id) {
      initialValues.organization_id = currentUser.organization_id;
    }
    form.setFieldsValue(initialValues);
    setIsModalOpen(true);
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    form.setFieldsValue({
      id: tenant.id,
      organization_id: tenant.organization_id || null,
      name: tenant.name,
      dialect: tenant.dialect || 'mysql',
      db_host: tenant.db_host,
      db_port: tenant.db_port || 3306,
      db_user: tenant.db_user,
      db_password: '', // Don't pre-fill password for security
      db_name: tenant.db_name,
      status: tenant.status || 'ACTIVE',
      description: tenant.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingTenant) {
        // For update, only send fields that changed (don't send empty password)
        const updateData = {
          name: values.name,
          dialect: values.dialect,
          db_host: values.db_host,
          db_port: values.db_port,
          db_user: values.db_user,
          db_name: values.db_name,
          status: values.status,
          description: values.description || null,
        };
        
        // Only include password if it was provided
        if (values.db_password && values.db_password.trim()) {
          updateData.db_password = values.db_password;
        }

        // For non-SUPER_ADMIN users, preserve the existing organization_id (can't change it)
        // For SUPER_ADMIN, allow changing organization_id
        if (currentUser?.role === 'SUPER_ADMIN' && values.organization_id !== undefined) {
          updateData.organization_id = values.organization_id || null;
        }

        await updateMutation.mutateAsync({
          id: editingTenant.id,
          data: updateData,
        });
      } else {
        // Auto-use current user's organization_id for non-SUPER_ADMIN creators
        const organizationId = currentUser?.role === 'SUPER_ADMIN' 
          ? (values.organization_id || null)  // SUPER_ADMIN can choose
          : (currentUser?.organization_id || null);  // Regular users use their own org
        
        if (!organizationId) {
          message.warning('Organization ID is required');
          return;
        }

        await createMutation.mutateAsync({
          id: values.id,
          organization_id: organizationId,
          name: values.name,
          dialect: values.dialect || 'mysql',
          db_host: values.db_host,
          db_port: values.db_port || 3306,
          db_user: values.db_user,
          db_password: values.db_password,
          db_name: values.db_name,
          status: values.status || 'ACTIVE',
          description: values.description || null,
        });
      }
      setIsModalOpen(false);
      form.resetFields();
      setShowPassword(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleTestConnection = async (id) => {
    try {
      const result = await testConnectionMutation.mutateAsync(id);
      // Check nested data.success (from service) or top-level success (from responseHandler)
      const isSuccess = result?.data?.success ?? result?.success;
      const messageText = result?.data?.message || result?.message || 'Connection test';
      
      if (isSuccess) {
        message.success(messageText || 'Connection test successful!');
      } else {
        message.error(messageText || 'Connection test failed');
      }
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleViewMore = (tenant) => {
    setSelectedTenant(tenant);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTenant(null);
  };

  const columns = [
    // Only show Tenant ID for SUPER_ADMIN
    ...(isSuperAdmin ? [{
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      fixed: 'left',
    }] : []),
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Database',
      key: 'database',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tag color={record.dialect === 'mysql' ? 'blue' : 'purple'}>
            {record.dialect?.toUpperCase() || 'MySQL'}
          </Tag>
          {isSuperAdmin ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.db_host}:{record.db_port}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Connected
            </Text>
          )}
        </Space>
      ),
    },
    // Only show database name for SUPER_ADMIN
    ...(isSuperAdmin ? [{
      title: 'Database Name',
      dataIndex: 'db_name',
      key: 'db_name',
      width: 150,
    }] : []),
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
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
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewMore(record)}
            />
          </Tooltip>
          <Tooltip title="Test Connection">
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handleTestConnection(record.id)}
              loading={testConnectionMutation.isPending}
            />
          </Tooltip>
          <Tooltip title={readOnly ? 'License expired. Read-only mode.' : 'Edit'}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={!canWrite || readOnly}
            />
          </Tooltip>
          <Popconfirm
            title="Delete tenant"
            description={`Are you sure you want to delete tenant "${record.name}"? This action cannot be undone.`}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
            disabled={!canWrite || readOnly}
          >
            <Tooltip title={readOnly ? 'License expired. Read-only mode.' : 'Delete'}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={!canWrite || readOnly}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
                <DatabaseOutlined />
                <span>Tenant Management</span>
              </Space>
            ),
          },
        ]}
      />
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: token.marginLG }}>
          <Title level={2} style={{ margin: 0 }}>
            <DatabaseOutlined /> Tenant Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={!canWrite || readOnly}
            title={readOnly ? 'License expired. You are in read-only mode.' : !canWrite ? 'You do not have permission to create tenants.' : ''}
          >
            Add New Tenant
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tenants}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingTenant ? 'Edit Tenant' : 'Create New Tenant'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setShowPassword(false);
        }}
        onOk={() => form.submit()}
        width={700}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{
          disabled: !canWrite || readOnly,
          title: readOnly ? 'License expired. You are in read-only mode.' : ''
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="id"
            label="Tenant ID"
            rules={[
              { required: !editingTenant, message: 'Please enter tenant ID' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, underscore and hyphen allowed' },
            ]}
          >
            <Input 
              placeholder="e.g., tenant_001" 
              disabled={!!editingTenant}
            />
          </Form.Item>

          {currentUser?.role === 'SUPER_ADMIN' && (
            <Form.Item
              name="organization_id"
              label={
                <Space>
                  <span>Organization ID</span>
                  <Tooltip title="Super Admin can specify organization ID or leave empty">
                    <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                  </Tooltip>
                </Space>
              }
              rules={[
                {
                  required: false,
                  message: 'Organization ID is optional for Super Admin',
                },
              ]}
            >
              <Input
                placeholder="Enter organization ID"
                disabled={!!editingTenant && currentUser?.role !== 'SUPER_ADMIN'}
              />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Tenant Name"
            rules={[
              { required: true, message: 'Please enter tenant name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must be less than 100 characters' },
            ]}
          >
            <Input placeholder="e.g., Production Database" />
          </Form.Item>

          <Form.Item
            name="dialect"
            label="Database Type"
            rules={[{ required: true, message: 'Please select database type' }]}
            initialValue="mysql"
          >
            <Select>
              <Option value="mysql">MySQL</Option>
              <Option value="mssql">Microsoft SQL Server</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="db_host"
            label="Database Host"
            rules={[
              { required: true, message: 'Please enter database host' },
            ]}
          >
            <Input placeholder="e.g., localhost or 192.168.1.100" />
          </Form.Item>

          <Form.Item
            name="db_port"
            label="Database Port"
            rules={[
              { required: true, message: 'Please enter database port' },
              { type: 'number', min: 1, max: 65535, message: 'Port must be between 1 and 65535' },
            ]}
            initialValue={3306}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="e.g., 3306 for MySQL, 1433 for MSSQL"
            />
          </Form.Item>

          <Form.Item
            name="db_name"
            label="Database Name"
            rules={[
              { required: true, message: 'Please enter database name' },
            ]}
          >
            <Input placeholder="e.g., my_database" />
          </Form.Item>

          <Form.Item
            name="db_user"
            label="Database Username"
            rules={[
              { required: true, message: 'Please enter database username' },
            ]}
          >
            <Input placeholder="e.g., db_user" />
          </Form.Item>

          <Form.Item
            name="db_password"
            label="Database Password"
            rules={[
              { required: !editingTenant, message: 'Please enter database password' },
            ]}
            extra={editingTenant ? 'Leave blank to keep current password' : ''}
          >
            <Input.Password
              placeholder={editingTenant ? 'Enter new password (leave blank to keep current)' : 'Enter database password'}
              iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
            initialValue="ACTIVE"
          >
            <Select>
              <Option value="ACTIVE">Active</Option>
              <Option value="INACTIVE">Inactive</Option>
              <Option value="SUSPENDED">Suspended</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 500, message: 'Description must be less than 500 characters' }]}
          >
            <TextArea
              rows={3}
              placeholder="Optional description for this tenant"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Tenant Details"
        placement="right"
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        width={600}
      >
        {selectedTenant && (
          <Descriptions column={1} bordered>
            {/* Only show Tenant ID for SUPER_ADMIN */}
            {isSuperAdmin && (
              <Descriptions.Item label="Tenant ID">
                <Text strong>{selectedTenant.id}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Name">
              {selectedTenant.name}
            </Descriptions.Item>
            <Descriptions.Item label="Database Type">
              <Tag color={selectedTenant.dialect === 'mysql' ? 'blue' : 'purple'}>
                {selectedTenant.dialect?.toUpperCase() || 'MySQL'}
              </Tag>
            </Descriptions.Item>
            {/* Only show database credentials for SUPER_ADMIN */}
            {isSuperAdmin && (
              <>
                <Descriptions.Item label="Database Host">
                  {selectedTenant.db_host}
                </Descriptions.Item>
                <Descriptions.Item label="Database Port">
                  {selectedTenant.db_port || 3306}
                </Descriptions.Item>
                <Descriptions.Item label="Database Name">
                  {selectedTenant.db_name}
                </Descriptions.Item>
                <Descriptions.Item label="Database Username">
                  {selectedTenant.db_user}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedTenant.status)}>
                {selectedTenant.status}
              </Tag>
            </Descriptions.Item>
            {selectedTenant.description && (
              <Descriptions.Item label="Description">
                {selectedTenant.description}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created At">
              {selectedTenant.created_at
                ? new Date(selectedTenant.created_at).toLocaleString()
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {selectedTenant.updated_at
                ? new Date(selectedTenant.updated_at).toLocaleString()
                : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


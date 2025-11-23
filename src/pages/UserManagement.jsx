import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  Popconfirm,
  message,
  theme as antdTheme,
  Tag,
  Select,
  Breadcrumb,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../api/users';
import { useTenants } from '../api/tenants';
import { usePages } from '../api/pages';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export default function UserManagement() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const roleWatch = Form.useWatch('role', form);

  const users = usersData?.data || (Array.isArray(usersData) ? usersData : []);
  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({}, { enabled: isModalOpen });
  const tenantList = tenantsData?.data || (Array.isArray(tenantsData) ? tenantsData : []);
  const tenantOptions = tenantList.map((tenant) => ({
    label: tenant.name ? `${tenant.name} (${tenant.id})` : tenant.id,
    value: tenant.id,
  }));

  const { data: pagesData, isLoading: pagesLoading } = usePages({ enabled: isModalOpen });
  const pageList = pagesData?.data || (Array.isArray(pagesData) ? pagesData : []);
  const pageOptions = pageList.map((page) => ({
    label: page.title ? `${page.title} (${page.page_key})` : page.page_key,
    value: page.page_key,
  }));

  const effectiveRole = roleWatch || editingUser?.role || 'USER';
  const isTenantRequired = effectiveRole !== 'ADMIN' && effectiveRole !== 'MANAGER';

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: 'USER',
      tenantIds: [],
      pageKeys: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
      tenantIds: user.tenant_permissions || [],
      pageKeys: user.page_permissions || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    try {
      await deleteMutation.mutateAsync(userId);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        const hasPasswordChange = Boolean(values.password);
        const hasRoleChange = values.role && values.role !== editingUser.role;
        const hasTenantChange =
          JSON.stringify(values.tenantIds || []) !== JSON.stringify(editingUser.tenant_permissions || []);
        const hasPageChange =
          JSON.stringify(values.pageKeys || []) !== JSON.stringify(editingUser.page_permissions || []);

        if (!hasPasswordChange && !hasRoleChange && !hasTenantChange && !hasPageChange) {
          message.warning('Please update password, role, or permissions before saving');
          return;
        }

        const updateData = {
          role: values.role || editingUser.role,
          tenantIds: values.tenantIds || [],
          pageKeys: values.pageKeys || [],
        };

        if (values.password) {
          updateData.password = values.password;
        }

        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: updateData,
        });
      } else {
        if (values.role !== 'ADMIN' && values.role !== 'MANAGER' && (!values.tenantIds || values.tenantIds.length === 0)) {
          message.warning('Please assign at least one tenant');
          return;
        }
        await createMutation.mutateAsync({
          username: values.username,
          password: values.password,
          role: values.role || 'USER',
          tenantIds: values.tenantIds || [],
          pageKeys: values.pageKeys || [],
        });
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colorMap = {
          ADMIN: 'red',
          MANAGER: 'orange',
          USER: 'blue',
        };
        return <Tag color={colorMap[role] || 'default'}>{role}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Tenants',
      dataIndex: 'tenant_permissions',
      key: 'tenant_permissions',
      render: (tenantPermissions = [], record) => {
        if ((record.role === 'ADMIN' || record.role === 'MANAGER') && tenantPermissions.length === 0) {
          return <Tag color="green">All Tenants</Tag>;
        }
        if (!tenantPermissions || tenantPermissions.length === 0) {
          return <Tag color="default">None</Tag>;
        }
        const display = tenantPermissions.slice(0, 3);
        return (
          <Space size={[4, 4]} wrap>
            {display.map((tenantId) => (
              <Tag key={`${record.id}-${tenantId}`} color="geekblue">
                {tenantId}
              </Tag>
            ))}
            {tenantPermissions.length > display.length && <Tag>+{tenantPermissions.length - display.length}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Pages',
      dataIndex: 'page_permissions',
      key: 'page_permissions',
      render: (pagePermissions = []) => {
        if (!pagePermissions || pagePermissions.length === 0) {
          return <Tag color="green">All Pages</Tag>;
        }
        const display = pagePermissions.slice(0, 3);
        return (
          <Space size={[4, 4]} wrap>
            {display.map((pageKey) => (
              <Tag key={pageKey} color="purple">
                {pageKey}
              </Tag>
            ))}
            {pagePermissions.length > display.length && <Tag>+{pagePermissions.length - display.length}</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Change Password
          </Button>
          {record.username !== currentUser?.username && (
            <Popconfirm
              title="Delete user"
              description={`Are you sure you want to delete user "${record.username}"?`}
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          )}
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
                <UserOutlined />
                <span>User Management</span>
              </Space>
            ),
          },
        ]}
      />
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: token.marginLG,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> User Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add New User
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Create New User'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={500}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingUser ? 'Update' : 'Create User'}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: !editingUser, message: 'Please enter username' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscore allowed' },
              { min: 3, message: 'Username must be at least 3 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter username"
              disabled={!!editingUser}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue="USER"
          >
            <Select placeholder="Select role">
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="MANAGER">Manager</Select.Option>
              <Select.Option value="USER">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? 'New Password (optional)' : 'Password'}
            rules={[
              { required: !editingUser, message: editingUser ? undefined : 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={editingUser ? 'Enter new password (leave blank to keep current)' : 'Enter password'}
            />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>
          )}

          <Form.Item
            name="tenantIds"
            label="Tenant Access"
            rules={[
              {
                validator: (_, value) => {
                  if (!isTenantRequired) {
                    return Promise.resolve();
                  }
                  if (Array.isArray(value) && value.length > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Select at least one tenant'));
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={isTenantRequired ? 'Select allowed tenants' : 'Select tenants (optional)'}
              options={tenantOptions}
              loading={tenantsLoading}
              optionFilterProp="label"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="pageKeys"
            label="Page Access (optional)"
            tooltip="Leave empty to allow user to access all pages within assigned tenants"
          >
            <Select
              mode="multiple"
              placeholder="Select specific pages or leave empty for all"
              options={pageOptions}
              loading={pagesLoading}
              optionFilterProp="label"
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


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
  Tooltip,
  Alert,
  Drawer,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  MoreOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../api/users';
import { useBlockUser, useUnblockUser } from '../api/admin';
import { useTenants } from '../api/tenants';
import { usePages } from '../api/pages';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function UserManagement() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockingUser, setBlockingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [blockForm] = Form.useForm();
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
  const isTenantRequired = effectiveRole !== 'ADMIN' && effectiveRole !== 'SUPER_ADMIN' && effectiveRole !== 'MANAGER';

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    // Auto-set organization_id for non-SUPER_ADMIN users
    const initialValues = {
      role: 'USER',
      tenantIds: [],
      pageKeys: [],
    };
    if (currentUser?.role !== 'SUPER_ADMIN' && currentUser?.organization_id) {
      initialValues.organization_id = currentUser.organization_id;
    } else {
      initialValues.organization_id = null;
    }
    form.setFieldsValue(initialValues);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      organization_id: user.organization_id || null,
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

  const handleBlock = (user) => {
    setBlockingUser(user);
    blockForm.resetFields();
    setIsBlockModalOpen(true);
  };

  const handleUnblock = async (userId) => {
    try {
      await unblockMutation.mutateAsync(userId);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleBlockSubmit = async (values) => {
    try {
      await blockMutation.mutateAsync({
        userId: blockingUser.id,
        reason: values.reason,
      });
      setIsBlockModalOpen(false);
      blockForm.resetFields();
      setBlockingUser(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        const hasPasswordChange = Boolean(values.password);
        const hasRoleChange = values.role && values.role !== editingUser.role;
        const hasNameChange = values.name !== editingUser.name;
        const hasEmailChange = values.email !== editingUser.email;
        const hasPhoneChange = values.phone_number !== editingUser.phone_number;
        const hasTenantChange =
          JSON.stringify(values.tenantIds || []) !== JSON.stringify(editingUser.tenant_permissions || []);
        const hasPageChange =
          JSON.stringify(values.pageKeys || []) !== JSON.stringify(editingUser.page_permissions || []);

        if (!hasPasswordChange && !hasRoleChange && !hasNameChange && !hasEmailChange && !hasPhoneChange && !hasTenantChange && !hasPageChange) {
          message.warning('Please update at least one field before saving');
          return;
        }

        // For non-SUPER_ADMIN users, preserve the existing organization_id (can't change it)
        // For SUPER_ADMIN, allow changing organization_id
        const organizationId = currentUser?.role === 'SUPER_ADMIN' 
          ? (values.organization_id !== undefined ? (values.organization_id || null) : editingUser.organization_id)
          : editingUser.organization_id;  // Non-SUPER_ADMIN can't change organization_id

        const updateData = {
          role: values.role || editingUser.role,
          organization_id: organizationId,
          tenantIds: values.tenantIds || [],
          pageKeys: values.pageKeys || [],
        };

        if (values.password) {
          updateData.password = values.password;
        }
        if (hasNameChange) {
          updateData.name = values.name || null;
        }
        if (hasEmailChange) {
          updateData.email = values.email || null;
        }
        if (hasPhoneChange) {
          updateData.phone_number = values.phone_number || null;
        }

        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: updateData,
        });
      } else {
        if (values.role !== 'ADMIN' && values.role !== 'SUPER_ADMIN' && values.role !== 'MANAGER' && (!values.tenantIds || values.tenantIds.length === 0)) {
          message.warning('Please assign at least one tenant');
          return;
        }
        
        // Auto-use current user's organization_id for non-SUPER_ADMIN creators
        const organizationId = currentUser?.role === 'SUPER_ADMIN' 
          ? (values.organization_id || null)  // SUPER_ADMIN can choose
          : (currentUser?.organization_id || null);  // Regular users use their own org
        
        if (values.role !== 'SUPER_ADMIN' && !organizationId) {
          message.warning('Organization ID is required for non-SUPER_ADMIN users');
          return;
        }
        
        await createMutation.mutateAsync({
          username: values.username,
          password: values.password,
          name: values.name || null,
          email: values.email || null,
          phone_number: values.phone_number || null,
          role: values.role || 'USER',
          organization_id: organizationId,  // Use auto-determined value
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

  const handleViewMore = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const columns = [
    // Only show User ID for SUPER_ADMIN
    ...(isSuperAdmin ? [{
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      fixed: 'left',
    }] : []),
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => {
        if (record.is_blocked) {
          return (
            <Tooltip title={record.blocked_reason || 'User is blocked'}>
              <Tag color="red" icon={<LockOutlined />}>
                Blocked
              </Tag>
            </Tooltip>
          );
        }
        return <Tag color="green">Active</Tag>;
      },
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const colorMap = {
          SUPER_ADMIN: 'purple',
          ADMIN: 'red',
          MANAGER: 'orange',
          DEVELOPER: 'geekblue',
          USER: 'blue',
        };
        return <Tag color={colorMap[role] || 'default'}>{role}</Tag>;
      },
    },
    {
      title: 'Tenant Access',
      dataIndex: 'tenant_permissions',
      key: 'tenant_permissions',
      width: 150,
      render: (tenantPermissions = [], record) => {
        if ((record.role === 'SUPER_ADMIN' || record.role === 'ADMIN' || record.role === 'MANAGER' || record.role === 'DEVELOPER') && tenantPermissions.length === 0) {
          return <Tag color="green">All</Tag>;
        }
        if (!tenantPermissions || tenantPermissions.length === 0) {
          return <Tag color="default">None</Tag>;
        }
        return (
          <Tooltip title={tenantPermissions.join(', ')}>
            <Tag color="geekblue">
              {tenantPermissions.length} tenant{tenantPermissions.length > 1 ? 's' : ''}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Page Access',
      dataIndex: 'page_permissions',
      key: 'page_permissions',
      width: 150,
      render: (pagePermissions = []) => {
        if (!pagePermissions || pagePermissions.length === 0) {
          return <Tag color="green">All</Tag>;
        }
        return (
          <Tooltip title={pagePermissions.join(', ')}>
            <Tag color="purple">
              {pagePermissions.length} page{pagePermissions.length > 1 ? 's' : ''}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'More',
      key: 'more',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="link"
            icon={<MoreOutlined />}
            onClick={() => handleViewMore(record)}
            style={{ color: token.colorPrimary }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit User">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          {record.username !== currentUser?.username && record.role !== 'ADMIN' && record.role !== 'SUPER_ADMIN' && (
            <>
              {record.is_blocked ? (
                <Popconfirm
                  title="Unblock user"
                  description={`Are you sure you want to unblock user "${record.username}"?`}
                  onConfirm={() => handleUnblock(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Unblock User">
                    <Button
                      type="link"
                      icon={<UnlockOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              ) : (
                <Tooltip title="Block User">
                  <Button
                    type="link"
                    danger
                    icon={<LockOutlined />}
                    onClick={() => handleBlock(record)}
                  />
                </Tooltip>
              )}
              <Popconfirm
                title="Delete user"
                description={`Are you sure you want to delete user "${record.username}"?`}
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete User">
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
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
          scroll={{ x: 1000 }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} users`,
          }}
          onRow={(record) => {
            if (record.is_blocked) {
              // Use theme tokens for blocked user row styling
              // colorFillTertiary provides a subtle background that adapts to theme
              // For error state, we use a slightly more prominent fill
              return {
                style: {
                  backgroundColor: token.colorFillTertiary || token.colorBgContainer,
                  opacity: 0.85,
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.backgroundColor = token.colorFillSecondary || token.colorFillTertiary;
                  e.currentTarget.style.opacity = '1';
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.backgroundColor = token.colorFillTertiary || token.colorBgContainer;
                  e.currentTarget.style.opacity = '0.85';
                },
              };
            }
            return {};
          }}
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
            name="name"
            label="Full Name"
            rules={[
              { max: 100, message: 'Name must be less than 100 characters' },
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please enter a valid email address' },
              { max: 255, message: 'Email must be less than 255 characters' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="phone_number"
            label="Phone Number"
            rules={[
              { max: 20, message: 'Phone number must be less than 20 characters' },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
            initialValue="USER"
          >
            <Select placeholder="Select role">
              {/* Show SUPER_ADMIN option only if current user is SUPER_ADMIN (can create/update) or if editing a SUPER_ADMIN user (to see current role) */}
              {(currentUser?.role === 'SUPER_ADMIN' || editingUser?.role === 'SUPER_ADMIN') && (
                <Select.Option value="SUPER_ADMIN">Super Admin (All Organizations)</Select.Option>
              )}
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="MANAGER">Manager</Select.Option>
              <Select.Option value="DEVELOPER">Developer</Select.Option>
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

          {currentUser?.role === 'SUPER_ADMIN' && (
            <Form.Item
              name="organization_id"
              label={
                <Space>
                  <span>Organization ID</span>
                  <Tooltip title="Super Admin can specify organization ID or leave empty for all organizations">
                    <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                  </Tooltip>
                </Space>
              }
              rules={[
                {
                  required: false,  // Optional for SUPER_ADMIN
                  message: 'Organization ID is optional for Super Admin',
                },
              ]}
            >
              <Input
                placeholder="Leave empty for Super Admin (all organizations) or specify organization ID"
              />
            </Form.Item>
          )}

          {effectiveRole === 'ADMIN' || effectiveRole === 'SUPER_ADMIN' || effectiveRole === 'MANAGER' ? (
            <Alert
              message="Full Access"
              description={effectiveRole === 'SUPER_ADMIN' 
                ? "Super Admin has access to all organizations, tenants, and pages."
                : "Admin and Manager roles have access to all tenants and pages within their organization. No restrictions needed."}
              type="info"
              showIcon
              style={{ marginBottom: token.marginMD }}
            />
          ) : (
            <>
              <Form.Item
                name="tenantIds"
                label={
                  <Space>
                    <span>Tenant Access</span>
                    <Tooltip title="Select which tenants this user can access. Users can only view data from assigned tenants. At least one tenant is required for non-admin users.">
                      <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                    </Tooltip>
                  </Space>
                }
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
                label={
                  <Space>
                    <span>Page Access</span>
                    <Tooltip title="Optionally restrict user to specific pages. Leave empty to allow access to all pages within assigned tenants.">
                      <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                    </Tooltip>
                  </Space>
                }
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
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title={`Block User: ${blockingUser?.username}`}
        open={isBlockModalOpen}
        onCancel={() => {
          setIsBlockModalOpen(false);
          blockForm.resetFields();
          setBlockingUser(null);
        }}
        onOk={() => blockForm.submit()}
        confirmLoading={blockMutation.isPending}
        okText="Block User"
        cancelText="Cancel"
      >
        <Form
          form={blockForm}
          layout="vertical"
          onFinish={handleBlockSubmit}
        >
          <Alert
            message="Warning"
            description="Blocking a user will prevent them from accessing the system. They will not be able to log in until unblocked."
            type="warning"
            showIcon
            style={{ marginBottom: token.marginMD }}
          />
          <Form.Item
            name="reason"
            label="Block Reason"
            rules={[
              { required: true, message: 'Please provide a reason for blocking this user' },
              { min: 10, message: 'Reason must be at least 10 characters' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter the reason for blocking this user (e.g., Security violation, Policy violation, etc.)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer for showing user details */}
      <Drawer
        title="User Details"
        placement="right"
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        width={600}
      >
        {selectedUser && (
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{
              fontWeight: token.fontWeightStrong,
              width: '40%',
              background: token.colorFillAlter,
            }}
            contentStyle={{
              background: token.colorBgContainer,
            }}
          >
            {/* Only show User ID for SUPER_ADMIN */}
            {isSuperAdmin && (
              <Descriptions.Item label="ID">
                {selectedUser.id}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Username">
              {selectedUser.username}
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              {selectedUser.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email ? (
                <Space>
                  <MailOutlined />
                  <span>{selectedUser.email}</span>
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              {selectedUser.phone_number ? (
                <Space>
                  <PhoneOutlined />
                  <span>{selectedUser.phone_number}</span>
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color={
                selectedUser.role === 'SUPER_ADMIN' ? 'purple' :
                selectedUser.role === 'ADMIN' ? 'red' :
                selectedUser.role === 'MANAGER' ? 'orange' :
                selectedUser.role === 'DEVELOPER' ? 'geekblue' :
                'blue'
              }>
                {selectedUser.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {selectedUser.is_blocked ? (
                <Space direction="vertical" size={4}>
                  <Tag color="red" icon={<LockOutlined />}>
                    Blocked
                  </Tag>
                  {selectedUser.blocked_reason && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Reason: {selectedUser.blocked_reason}
                    </Text>
                  )}
                  {selectedUser.blocked_at && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Blocked on: {new Date(selectedUser.blocked_at).toLocaleString()}
                    </Text>
                  )}
                </Space>
              ) : (
                <Tag color="green">Active</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tenant Access">
              {(() => {
                const tenantPermissions = selectedUser.tenant_permissions || [];
                if ((selectedUser.role === 'SUPER_ADMIN' || selectedUser.role === 'ADMIN' || selectedUser.role === 'MANAGER' || selectedUser.role === 'DEVELOPER') && tenantPermissions.length === 0) {
                  return <Tag color="green">All Tenants</Tag>;
                }
                if (tenantPermissions.length === 0) {
                  return <Tag color="default">None</Tag>;
                }
                return (
                  <Space size={[4, 4]} wrap>
                    {tenantPermissions.map((tenantId) => (
                      <Tag key={tenantId} color="geekblue">
                        {tenantId}
                      </Tag>
                    ))}
                  </Space>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Page Access">
              {(() => {
                const pagePermissions = selectedUser.page_permissions || [];
                if (pagePermissions.length === 0) {
                  return <Tag color="green">All Pages</Tag>;
                }
                return (
                  <Space size={[4, 4]} wrap>
                    {pagePermissions.map((pageKey) => (
                      <Tag key={pageKey} color="purple">
                        {pageKey}
                      </Tag>
                    ))}
                  </Space>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Created On">
              {selectedUser.createdon ? new Date(selectedUser.createdon).toLocaleString() : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {selectedUser.updatedon ? new Date(selectedUser.updatedon).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


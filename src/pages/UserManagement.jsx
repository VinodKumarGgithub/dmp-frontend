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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../api/users';
import { useAuth } from '../contexts/AuthContext';

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

  const users = usersData?.data || (Array.isArray(usersData) ? usersData : []);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      role: user.role,
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
        // Update user (password and/or role)
        const updateData = {};
        if (values.password) {
          updateData.password = values.password;
        }
        if (values.role) {
          updateData.role = values.role;
        }
        
        if (Object.keys(updateData).length === 0) {
          message.warning('Please enter a new password or change role to update');
          return;
        }
        
        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: updateData,
        });
      } else {
        // Create new user
        await createMutation.mutateAsync({
          username: values.username,
          password: values.password,
          role: values.role || 'USER',
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
        </Form>
      </Modal>
    </div>
  );
}


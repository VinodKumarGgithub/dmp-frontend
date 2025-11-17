import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  theme as antdTheme,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { usePages } from '../api/pages';
import { useCreatePageConfig, useUpdatePageConfig, useDeletePageConfig } from '../api/pageConfig';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';

const { Title } = Typography;
const { TextArea } = Input;

export default function PageConfigManagement() {
  const { token } = antdTheme.useToken();
  const { user } = useAuth();
  const { data: pagesData, isLoading } = usePages();
  const createMutation = useCreatePageConfig();
  const updateMutation = useUpdatePageConfig();
  const deleteMutation = useDeletePageConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [form] = Form.useForm();

  const pages = pagesData?.data || (Array.isArray(pagesData) ? pagesData : []);

  // Check if user is admin (you may need to adjust this based on your auth setup)
  const isAdmin = user?.role === 'ADMIN';

  const handleAdd = () => {
    setEditingPage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = async (page) => {
    setEditingPage(page);
    try {
      // Fetch full config for editing
      const response = await axiosInstance.get(`/pages/${page.page_key}/config`);
      const config = response.data || response;
      
      form.setFieldsValue({
        page_key: config.page_key,
        title: config.title,
        data_source: config.data_source,
        columns_json: JSON.stringify(config.columns || [], null, 2),
        searchable_fields_json: JSON.stringify(config.searchable_fields || [], null, 2),
        filterable_fields_json: JSON.stringify(config.filterable_fields || [], null, 2),
        default_sort_json: config.default_sort ? JSON.stringify(config.default_sort, null, 2) : '',
        is_download_allowed: config.is_download_allowed,
        page_size_default: config.page_size_default,
      });
      setIsModalOpen(true);
    } catch (error) {
      message.error('Failed to load page config');
    }
  };

  const handleDelete = async (pageKey) => {
    try {
      await deleteMutation.mutateAsync(pageKey);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Parse JSON fields
      const submitData = {
        ...values,
        columns: JSON.parse(values.columns_json),
        searchable_fields: JSON.parse(values.searchable_fields_json),
        filterable_fields: JSON.parse(values.filterable_fields_json),
        default_sort: values.default_sort_json ? JSON.parse(values.default_sort_json) : null,
      };
      
      // Remove JSON string fields
      delete submitData.columns_json;
      delete submitData.searchable_fields_json;
      delete submitData.filterable_fields_json;
      delete submitData.default_sort_json;

      if (editingPage) {
        await updateMutation.mutateAsync({
          pageKey: editingPage.page_key,
          data: submitData,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      if (error.message?.includes('JSON')) {
        message.error('Invalid JSON format. Please check your JSON fields.');
      }
      // Other errors already handled by mutation
    }
  };

  const columns = [
    {
      title: 'Page Key',
      dataIndex: 'page_key',
      key: 'page_key',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Download',
      dataIndex: 'is_download_allowed',
      key: 'is_download_allowed',
      render: (allowed) => (
        <Tag color={allowed ? 'green' : 'default'}>
          {allowed ? 'Enabled' : 'Disabled'}
        </Tag>
      ),
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
            disabled={!isAdmin}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete page config"
            description="Are you sure you want to delete this page config?"
            onConfirm={() => handleDelete(record.page_key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={!isAdmin}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Card>
        <Title level={4}>Access Denied</Title>
        <p>You need admin privileges to manage page configurations.</p>
      </Card>
    );
  }

  return (
    <div style={{ padding: token.paddingLG }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: token.marginLG }}>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined /> Page Configuration Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add New Page
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={pages}
          rowKey="page_key"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingPage ? 'Edit Page Config' : 'Create New Page Config'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            page_size_default: 20,
            is_download_allowed: false,
          }}
        >
          <Form.Item
            name="page_key"
            label="Page Key"
            rules={[
              { required: true, message: 'Please enter page key' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, underscore and hyphen allowed' },
            ]}
          >
            <Input placeholder="e.g., age_edit" disabled={!!editingPage} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Age Edit Data" />
          </Form.Item>

          <Form.Item
            name="data_source"
            label="Data Source (Table/View Name)"
            rules={[
              { required: true, message: 'Please enter data source' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Invalid table/view name format' },
            ]}
          >
            <Input placeholder="e.g., age_edits" />
          </Form.Item>

          <Form.Item
            name="columns_json"
            label="Columns (JSON)"
            tooltip="Array of column objects: [{name, label, type, width?}]"
            rules={[{ required: true, message: 'Please enter columns JSON' }]}
          >
            <TextArea
              rows={6}
              placeholder='[{"name": "id", "label": "ID", "type": "number"}, {"name": "name", "label": "Name", "type": "string"}]'
            />
          </Form.Item>

          <Form.Item
            name="searchable_fields_json"
            label="Searchable Fields (JSON)"
            tooltip="Array of field names: [&quot;field1&quot;, &quot;field2&quot;]"
            rules={[{ required: true, message: 'Please enter searchable fields' }]}
          >
            <TextArea
              rows={3}
              placeholder='["name", "email"]'
            />
          </Form.Item>

          <Form.Item
            name="filterable_fields_json"
            label="Filterable Fields (JSON)"
            tooltip="Array of filter objects: [{name, label, type, options?}]"
            rules={[{ required: true, message: 'Please enter filterable fields' }]}
          >
            <TextArea
              rows={6}
              placeholder='[{"name": "status", "label": "Status", "type": "select", "options": ["ACTIVE", "INACTIVE"]}]'
            />
          </Form.Item>

          <Form.Item
            name="default_sort_json"
            label="Default Sort (JSON)"
            tooltip='Object: {"field": "id", "order": "ASC" or "DESC"}'
          >
            <TextArea
              rows={2}
              placeholder='{"field": "id", "order": "DESC"}'
            />
          </Form.Item>

          <Space>
            <Form.Item
              name="is_download_allowed"
              valuePropName="checked"
            >
              <Switch /> Allow Download
            </Form.Item>

            <Form.Item
              name="page_size_default"
              label="Default Page Size"
            >
              <InputNumber min={1} max={100} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}


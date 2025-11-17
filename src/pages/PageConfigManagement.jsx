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
  Select,
  Checkbox,
  Divider,
  Row,
  Col,
  Tabs,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  DeleteFilled,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { usePages } from '../api/pages';
import { useCreatePageConfig, useUpdatePageConfig, useDeletePageConfig } from '../api/pageConfig';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;
const { Option } = Select;

export default function PageConfigManagement() {
  const { token } = antdTheme.useToken();
  const { data: pagesData, isLoading } = usePages();
  const createMutation = useCreatePageConfig();
  const updateMutation = useUpdatePageConfig();
  const deleteMutation = useDeletePageConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  const pages = pagesData?.data || (Array.isArray(pagesData) ? pagesData : []);

  const handleAdd = () => {
    setEditingPage(null);
    setActiveTab('basic');
    form.resetFields();
    form.setFieldsValue({
      page_size_default: 20,
      is_download_allowed: false,
      columns: [{ name: '', label: '', type: 'string' }],
      searchable_fields: [],
      filterable_fields: [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = async (page) => {
    setEditingPage(page);
    setActiveTab('basic');
    try {
      // Fetch full config for editing
      const response = await axiosInstance.get(`/pages/${page.page_key}/config`);
      const config = response.data || response;
      
      form.setFieldsValue({
        page_key: config.page_key,
        title: config.title,
        data_source: config.data_source,
        columns: config.columns || [],
        searchable_fields: config.searchable_fields || [],
        filterable_fields: config.filterable_fields || [],
        default_sort: config.default_sort?.field || null,
        default_sort_order: config.default_sort?.order || 'ASC',
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
      // Get columns from form list
      const columns = form.getFieldValue('columns') || [];
      
      // Filter out empty columns
      const validColumns = columns.filter(col => col.name && col.label);
      
      if (validColumns.length === 0) {
        message.error('Please add at least one column');
        return;
      }

      // Get searchable fields (array of column names)
      const searchable_fields = form.getFieldValue('searchable_fields') || [];
      
      // Get filterable fields from form list
      const filterable_fields = form.getFieldValue('filterable_fields') || [];
      const validFilters = filterable_fields.filter(f => f.name && f.label);
      
      // Build default sort
      const default_sort = values.default_sort ? {
        field: values.default_sort,
        order: values.default_sort_order || 'ASC',
      } : null;

      const submitData = {
        page_key: values.page_key,
        title: values.title,
        data_source: values.data_source,
        columns: validColumns,
        searchable_fields: searchable_fields,
        filterable_fields: validFilters,
        default_sort: default_sort,
        is_download_allowed: values.is_download_allowed || false,
        page_size_default: values.page_size_default || 20,
      };

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
      // Errors already handled by mutation
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
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'basic',
      label: 'Basic Info',
      children: (
        <>
          <Form.Item
            name="page_key"
            label={
              <Space>
                <span>Page Key</span>
                <Tooltip title="Unique identifier for this page (letters, numbers, underscore, hyphen only)">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Please enter page key' },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: 'Only letters, numbers, underscore and hyphen allowed' },
            ]}
          >
            <Input placeholder="e.g., age_edit" disabled={!!editingPage} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Page Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Age Edit Data" />
          </Form.Item>

          <Form.Item
            name="data_source"
            label={
              <Space>
                <span>Database Table/View Name</span>
                <Tooltip title="The name of the table or view in your database that contains the data">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Please enter data source' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: 'Invalid table/view name format' },
            ]}
          >
            <Input placeholder="e.g., age_edits" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="page_size_default"
                label="Default Page Size"
                rules={[{ required: true, message: 'Please enter page size' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_download_allowed"
                label="Allow CSV Download"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'columns',
      label: 'Columns',
      children: (
        <Form.List name="columns">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  style={{ marginBottom: token.marginMD, background: token.colorFillAlter }}
                  extra={
                    fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteFilled />}
                        onClick={() => remove(name)}
                      />
                    )
                  }
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Column Name"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="e.g., id" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        label="Display Label"
                        rules={[{ required: true, message: 'Required' }]}
                      >
                        <Input placeholder="e.g., ID" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        label="Data Type"
                        initialValue="string"
                      >
                        <Select>
                          <Option value="string">String</Option>
                          <Option value="number">Number</Option>
                          <Option value="date">Date</Option>
                          <Option value="boolean">Boolean</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    {...restField}
                    name={[name, 'width']}
                    label="Column Width (optional)"
                  >
                    <InputNumber min={50} max={500} style={{ width: '100%' }} placeholder="Auto" />
                  </Form.Item>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ name: '', label: '', type: 'string' })}
                block
                icon={<PlusOutlined />}
              >
                Add Column
              </Button>
            </>
          )}
        </Form.List>
      ),
    },
    {
      key: 'search',
      label: 'Search & Filters',
      children: (
        <>
          <Form.Item
            name="searchable_fields"
            label={
              <Space>
                <span>Searchable Fields</span>
                <Tooltip title="Select which columns users can search through">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item name="searchable_fields" noStyle>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  JSON.stringify(prevValues.columns) !== JSON.stringify(currentValues.columns)
                }
              >
                {({ getFieldValue }) => {
                  const columns = getFieldValue('columns') || [];
                  const validColumns = columns.filter(col => col && col.name);
                  
                  if (validColumns.length === 0) {
                    return (
                      <Text type="secondary">
                        Add columns first, then select which ones should be searchable
                      </Text>
                    );
                  }

                  return (
                    <Checkbox.Group style={{ width: '100%' }}>
                      <Row>
                        {validColumns.map((col, index) => (
                          <Col span={8} key={`${col.name}-${index}`}>
                            <Checkbox value={col.name}>{col.label || col.name}</Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  );
                }}
              </Form.Item>
            </Form.Item>
            <Text type="secondary" style={{ fontSize: token.fontSizeSM, display: 'block', marginTop: token.marginXS }}>
              Select columns that users can search through
            </Text>
          </Form.Item>

          <Divider />

          <Form.Item
            label={
              <Space>
                <span>Filterable Fields</span>
                <Tooltip title="Add filters that users can apply to narrow down results">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
          >
            <Form.List name="filterable_fields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: token.marginMD, background: token.colorFillAlter }}
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<DeleteFilled />}
                          onClick={() => remove(name)}
                        />
                      }
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'name']}
                            label="Field Name"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="e.g., status" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'label']}
                            label="Filter Label"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input placeholder="e.g., Status" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'type']}
                            label="Filter Type"
                            rules={[{ required: true, message: 'Required' }]}
                            initialValue="text"
                          >
                            <Select>
                              <Option value="text">Text Input</Option>
                              <Option value="select">Dropdown</Option>
                              <Option value="number">Number</Option>
                              <Option value="date">Date Range</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.filterable_fields?.[name]?.type !== currentValues.filterable_fields?.[name]?.type
                        }
                      >
                        {({ getFieldValue }) => {
                          const filterType = getFieldValue(['filterable_fields', name, 'type']);
                          if (filterType === 'select') {
                            return (
                              <Form.Item
                                {...restField}
                                name={[name, 'options']}
                                label="Dropdown Options"
                                rules={[{ required: true, message: 'Required for dropdown' }]}
                              >
                                <Select
                                  mode="tags"
                                  placeholder="Type and press Enter to add options"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            );
                          }
                          return null;
                        }}
                      </Form.Item>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ name: '', label: '', type: 'text' })}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Filter
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </>
      ),
    },
    {
      key: 'sort',
      label: 'Default Sort',
      children: (
        <>
          <Form.Item
            name="default_sort"
            label={
              <Space>
                <span>Default Sort Field</span>
                <Tooltip title="Which column should be used for default sorting">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                JSON.stringify(prevValues.columns) !== JSON.stringify(currentValues.columns)
              }
            >
              {({ getFieldValue }) => {
                const columns = getFieldValue('columns') || [];
                const validColumns = columns.filter(col => col && col.name);
                
                return (
                  <Select placeholder="Select a column" allowClear>
                    {validColumns.map((col, index) => (
                      <Option key={`${col.name}-${index}`} value={col.name}>
                        {col.label || col.name}
                      </Option>
                    ))}
                  </Select>
                );
              }}
            </Form.Item>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.default_sort !== currentValues.default_sort
            }
          >
            {({ getFieldValue }) => {
              const sortField = getFieldValue('default_sort');
              if (!sortField) return null;
              return (
                <Form.Item
                  name="default_sort_order"
                  label="Sort Order"
                  initialValue="ASC"
                >
                  <Select>
                    <Option value="ASC">Ascending (A-Z, 1-9)</Option>
                    <Option value="DESC">Descending (Z-A, 9-1)</Option>
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>
        </>
      ),
    },
  ];

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
        width={900}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            page_size_default: 20,
            is_download_allowed: false,
            columns: [{ name: '', label: '', type: 'string' }],
            searchable_fields: [],
            filterable_fields: [],
            default_sort_order: 'ASC',
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Form>
      </Modal>
    </div>
  );
}

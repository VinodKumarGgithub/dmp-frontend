import { useState, useEffect } from 'react';
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
  Alert,
  Spin,
  Breadcrumb,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  DeleteFilled,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { usePages } from '../api/pages';
import { useCreatePageConfig, useUpdatePageConfig, useDeletePageConfig, useTables, useTableColumns, useTableIndexes, useProcedureParameters } from '../api/pageConfig';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const normalizeSourceParams = (params = []) => {
  if (!Array.isArray(params)) {
    return [];
  }
  return params
    .filter(Boolean)
    .map((param) => {
      const hasValue = param && Object.prototype.hasOwnProperty.call(param, 'value');
      const resolvedValue = hasValue
        ? param.value
        : Object.prototype.hasOwnProperty.call(param || {}, 'default_value')
          ? param.default_value
          : '';

      return {
        name: param?.name || '',
        type: param?.type || 'string',
        value: resolvedValue ?? '',
      };
    });
};

const { Title, Text } = Typography;
const { Option } = Select;

export default function PageConfigManagement() {
  const { token } = antdTheme.useToken();
  const { selectedTenant } = useAuth();
  const { data: pagesData, isLoading } = usePages();
  const createMutation = useCreatePageConfig();
  const updateMutation = useUpdatePageConfig();
  const deleteMutation = useDeletePageConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [form] = Form.useForm();
  const isDownloadAllowed = Form.useWatch('is_download_allowed', form);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedTable, setSelectedTable] = useState(null);

  const pages = pagesData?.data || (Array.isArray(pagesData) ? pagesData : []);

  // Fetch tables when modal is open and tenant is selected
  const { data: tables = [], isLoading: tablesLoading } = useTables({
    enabled: isModalOpen && !!selectedTenant,
  });

  // Track source type in state
  const [currentSourceType, setCurrentSourceType] = useState('TABLE');

  // Fetch columns when table/view is selected
  const { data: tableColumns = [], isLoading: columnsLoading } = useTableColumns(
    (currentSourceType === 'TABLE' || currentSourceType === 'VIEW') ? selectedTable : null, 
    {
      enabled: (currentSourceType === 'TABLE' || currentSourceType === 'VIEW') && !!selectedTable && isModalOpen,
    }
  );

  // Fetch indexes when table is selected
  const { data: tableIndexes = {}, isLoading: indexesLoading } = useTableIndexes(
    currentSourceType === 'TABLE' ? selectedTable : null,
    {
      enabled: currentSourceType === 'TABLE' && !!selectedTable && isModalOpen,
    }
  );

  // Fetch procedure parameters when procedure is selected
  const { data: procedureParameters = [], isLoading: procedureParamsLoading } = useProcedureParameters(
    currentSourceType === 'PROCEDURE' ? selectedTable : null,
    {
      enabled: currentSourceType === 'PROCEDURE' && !!selectedTable && isModalOpen,
    }
  );

  const handleAdd = () => {
    setEditingPage(null);
    setActiveTab('basic');
    setSelectedTable(null);
    setCurrentSourceType('TABLE');
    form.resetFields();
      form.setFieldsValue({
        page_size_default: 20,
        is_download_allowed: false,
        download_row_limit: null,
        source_type: 'TABLE',
        source_params: [],
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
      
      const sourceType = config.source_type || 'TABLE';
      setCurrentSourceType(sourceType);
      setSelectedTable(config.data_source);
      
      form.setFieldsValue({
        page_key: config.page_key,
        title: config.title,
        data_source: config.data_source,
        source_type: sourceType,
        source_params: normalizeSourceParams(config.source_params),
        columns: config.columns || [],
        searchable_fields: config.searchable_fields || [],
        filterable_fields: config.filterable_fields || [],
        default_sort: config.default_sort?.field || null,
        default_sort_order: config.default_sort?.order || 'ASC',
        is_download_allowed: config.is_download_allowed,
        page_size_default: config.page_size_default,
        download_row_limit: config.download_row_limit ?? null,
      });
      setIsModalOpen(true);
    } catch (error) {
      message.error('Failed to load page config');
    }
  };

  // Handle table selection - auto-populate columns or parameters
  const handleTableChange = (tableName) => {
    setSelectedTable(tableName);
    const currentSourceType = form.getFieldValue('source_type') || 'TABLE';
    form.setFieldsValue({ 
      data_source: tableName,
      // Clear columns/params when data source changes so they can be repopulated
      columns: [],
      source_params: []
    });
    // Columns/parameters will be auto-populated via useEffect when data is loaded
  };

  // Handle source type change - clear data source selection
  const handleSourceTypeChange = (sourceType) => {
    setCurrentSourceType(sourceType);
    form.setFieldsValue({ 
      source_type: sourceType,
      data_source: undefined,
      source_params: []
    });
    setSelectedTable(null);
  };

  // Auto-populate columns when table/view columns are loaded
  useEffect(() => {
    if (tableColumns.length > 0 && selectedTable && (currentSourceType === 'TABLE' || currentSourceType === 'VIEW')) {
      const currentColumns = form.getFieldValue('columns') || [];
      const currentDataSource = form.getFieldValue('data_source');
      
      // Only auto-populate if:
      // 1. Columns are empty or have only one empty entry
      // 2. AND (not editing OR data source has changed)
      const shouldPopulate = (currentColumns.length === 0 || (currentColumns.length === 1 && !currentColumns[0].name)) &&
                             (!editingPage || currentDataSource === selectedTable);
      
      if (shouldPopulate) {
        const mappedColumns = tableColumns.map(col => ({
          name: col.name,
          label: col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' '),
          type: col.type,
        }));
        form.setFieldsValue({ columns: mappedColumns });
      }
    }
  }, [tableColumns, selectedTable, editingPage, form, currentSourceType]);

  // Auto-populate procedure parameters when procedure parameters are loaded
  useEffect(() => {
    if (procedureParameters.length > 0 && selectedTable && currentSourceType === 'PROCEDURE') {
      const currentParams = form.getFieldValue('source_params') || [];
      const currentDataSource = form.getFieldValue('data_source');
      
      // Only auto-populate if:
      // 1. Parameters are empty
      // 2. AND (not editing OR data source has changed)
      const shouldPopulate = currentParams.length === 0 &&
                             (!editingPage || currentDataSource === selectedTable);
      
      if (shouldPopulate) {
        const mappedParams = normalizeSourceParams(procedureParameters);
        form.setFieldsValue({ source_params: mappedParams });
      }
    }
  }, [procedureParameters, selectedTable, editingPage, form, currentSourceType]);

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
      
      // Filter out empty columns (allow empty array - will use SELECT *)
      const validColumns = columns.filter(col => col.name && col.label);

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

      // Get source parameters
      const source_params = form.getFieldValue('source_params') || [];
      const validSourceParams = (source_params || [])
        .filter(param => param && param.name)
        .map(param => {
          const hasValue = Object.prototype.hasOwnProperty.call(param, 'value');
          return {
            name: param.name,
            type: param.type || 'string',
            value: hasValue ? param.value : '',
          };
        });

      const isDownloadEnabled = values.is_download_allowed || false;
      const resolvedDownloadLimit =
        typeof values.download_row_limit === 'number' && Number.isFinite(values.download_row_limit)
          ? values.download_row_limit
          : null;

      const submitData = {
        page_key: values.page_key,
        title: values.title,
        data_source: values.data_source,
        source_type: values.source_type || 'TABLE',
        source_params: validSourceParams,
        columns: validColumns,
        searchable_fields: searchable_fields,
        filterable_fields: validFilters,
        default_sort: default_sort,
        is_download_allowed: isDownloadEnabled,
        download_row_limit: isDownloadEnabled ? resolvedDownloadLimit : null,
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

          {!selectedTenant && (
            <Alert
              message="Please select a tenant first"
              description="You need to select a tenant from the header to view available tables and views."
              type="warning"
              showIcon
              style={{ marginBottom: token.marginMD }}
            />
          )}
          <Form.Item
            name="source_type"
            label={
              <Space>
                <span>Source Type</span>
                <Tooltip title="Select the type of data source">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Please select source type' },
            ]}
            initialValue="TABLE"
          >
            <Select onChange={handleSourceTypeChange}>
              <Option value="TABLE">Table</Option>
              <Option value="VIEW">View</Option>
              <Option value="PROCEDURE">Stored Procedure</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="data_source"
            label={
              <Space>
                <span>Data Source</span>
                <Tooltip title="Select a table, view, or procedure from your tenant database">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Please select a data source' },
            ]}
          >
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.source_type !== currentValues.source_type}
            >
              {({ getFieldValue }) => {
                const sourceType = getFieldValue('source_type') || 'TABLE';
                // Filter tables based on source_type
                const filteredDataSources = Array.isArray(tables) 
                  ? tables.filter(ds => {
                      // Handle both old format (string) and new format (object with name and type)
                      if (typeof ds === 'string') {
                        // Legacy format - show all if source_type is TABLE
                        return sourceType === 'TABLE';
                      }
                      // New format - filter by type
                      return ds.type === sourceType;
                    })
                  : [];
                
                return (
                  <Select
                    placeholder={`Select a ${sourceType.toLowerCase()}`}
                    showSearch
                    allowClear
                    loading={tablesLoading}
                    disabled={!selectedTenant || tablesLoading}
                    onChange={handleTableChange}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    notFoundContent={
                      filteredDataSources.length === 0 && !tablesLoading
                        ? `No ${sourceType.toLowerCase()}s found`
                        : null
                    }
                  >
                    {filteredDataSources.map(ds => {
                      const name = typeof ds === 'string' ? ds : ds.name;
                      const type = typeof ds === 'string' ? 'TABLE' : ds.type;
                      return (
                        <Option key={name} value={name} label={name}>
                          <Space>
                            <span>{name}</span>
                            <Tag color={type === 'TABLE' ? 'blue' : type === 'VIEW' ? 'green' : 'purple'} size="small">
                              {type}
                            </Tag>
                          </Space>
                        </Option>
                      );
                    })}
                  </Select>
                );
              }}
            </Form.Item>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.source_type !== currentValues.source_type}
          >
            {({ getFieldValue }) => {
              const sourceType = getFieldValue('source_type');
              if (sourceType === 'PROCEDURE' || sourceType === 'VIEW') {
                return (
                  <Form.List name="source_params">
                    {(fields, { add, remove }) => (
                      <>
                        <Divider orientation="left" style={{ marginTop: token.marginMD }}>
                          <Space>
                            <span>Parameters</span>
                            <Tooltip title="Configure parameters for the procedure or view">
                              <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                            </Tooltip>
                          </Space>
                        </Divider>
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
                                  label="Parameter Name"
                                  rules={[{ required: true, message: 'Required' }]}
                                >
                                  <Input placeholder="e.g., start_date" />
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'type']}
                                  label="Type"
                                  initialValue="string"
                                >
                                  <Select>
                                    <Option value="string">String</Option>
                                    <Option value="number">Number</Option>
                                    <Option value="boolean">Boolean</Option>
                                    <Option value="date">Date</Option>
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={10}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  label="Default Value"
                                >
                                  <Input placeholder="Optional default value" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add({ name: '', type: 'string', value: '' })}
                          block
                          icon={<PlusOutlined />}
                          style={{ marginBottom: token.marginMD }}
                        >
                          Add Parameter
                        </Button>
                      </>
                    )}
                  </Form.List>
                );
              }
              return null;
            }}
          </Form.Item>
          {selectedTable && columnsLoading && (currentSourceType === 'TABLE' || currentSourceType === 'VIEW') && (
            <Spin size="small" style={{ marginTop: token.marginXS }}>
              <Text type="secondary" style={{ marginLeft: token.marginSM }}>
                Loading columns...
              </Text>
            </Spin>
          )}
          {selectedTable && procedureParamsLoading && currentSourceType === 'PROCEDURE' && (
            <Spin size="small" style={{ marginTop: token.marginXS }}>
              <Text type="secondary" style={{ marginLeft: token.marginSM }}>
                Loading procedure parameters...
              </Text>
            </Spin>
          )}

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="page_size_default"
                label="Default Page Size"
                rules={[{ required: true, message: 'Please enter page size' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="is_download_allowed"
                label="Allow CSV Download"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="download_row_limit"
                label="Max Download Rows"
                tooltip="Leave blank for unlimited downloads"
              >
                <InputNumber
                  min={1}
                  max={1000000}
                  style={{ width: '100%' }}
                  placeholder="Unlimited"
                  disabled={!isDownloadAllowed}
                />
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
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                JSON.stringify(prevValues.columns) !== JSON.stringify(currentValues.columns) ||
                JSON.stringify(prevValues.searchable_fields) !== JSON.stringify(currentValues.searchable_fields)
              }
            >
              {({ getFieldValue }) => {
                const columns = getFieldValue('columns') || [];
                const validColumns = columns.filter(col => col && col.name);
                const searchableFields = getFieldValue('searchable_fields') || [];
                
                if (validColumns.length === 0) {
                  return (
                    <Text type="secondary">
                      Add columns first, then select which ones should be searchable
                    </Text>
                  );
                }
                
                return (
                  <>
                    <Checkbox.Group 
                      style={{ width: '100%' }}
                      value={searchableFields}
                      onChange={(checkedValues) => {
                        form.setFieldsValue({ searchable_fields: checkedValues });
                      }}
                    >
                      <Row>
                        {validColumns.map((col, index) => {
                          const hasIndex = tableIndexes[col.name]?.hasIndex;
                          const isSelected = searchableFields.includes(col.name);
                          return (
                            <Col span={8} key={`${col.name}-${index}`}>
                              <Space>
                                <Checkbox value={col.name}>
                                  {col.name}
                                  {col.label && col.label !== col.name && (
                                    <Text type="secondary" style={{ marginLeft: token.marginXS }}>
                                      ({col.label})
                                    </Text>
                                  )}
                                </Checkbox>
                                {isSelected && selectedTable && (
                                  hasIndex ? (
                                    <Tooltip title="Indexed - Good for performance">
                                      <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Not indexed - May impact search performance">
                                      <WarningOutlined style={{ color: token.colorWarning }} />
                                    </Tooltip>
                                  )
                                )}
                              </Space>
                            </Col>
                          );
                        })}
                      </Row>
                    </Checkbox.Group>
                    {selectedTable && searchableFields.length > 0 && (
                      <Alert
                        message="Index Status"
                        description={
                          <div>
                            {searchableFields.some(field => !tableIndexes[field]?.hasIndex) ? (
                              <Text type="warning">
                                Some searchable fields are not indexed. Consider adding indexes for better performance.
                              </Text>
                            ) : (
                              <Text type="success">
                                All searchable fields are indexed. Good for performance!
                              </Text>
                            )}
                          </div>
                        }
                        type={searchableFields.some(field => !tableIndexes[field]?.hasIndex) ? 'warning' : 'success'}
                        showIcon
                        style={{ marginTop: token.marginMD }}
                      />
                    )}
                  </>
                );
              }}
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
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.filterable_fields?.[name]?.name !== currentValues.filterable_fields?.[name]?.name
                        }
                      >
                        {({ getFieldValue }) => {
                          const fieldName = getFieldValue(['filterable_fields', name, 'name']);
                          const hasIndex = fieldName && tableIndexes[fieldName]?.hasIndex;
                          return (
                            <Row gutter={16}>
                              <Col span={8}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'name']}
                                  label={
                                    <Space>
                                      <span>Field Name</span>
                                      {fieldName && selectedTable && (
                                        <Tooltip 
                                          title={hasIndex ? "Indexed - Good for performance" : "Not indexed - May impact filter performance"}
                                        >
                                          {hasIndex ? (
                                            <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                                          ) : (
                                            <WarningOutlined style={{ color: token.colorWarning }} />
                                          )}
                                        </Tooltip>
                                      )}
                                    </Space>
                                  }
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
                        );
                        }}
                      </Form.Item>
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
                JSON.stringify(prevValues.columns) !== JSON.stringify(currentValues.columns) ||
                prevValues.default_sort !== currentValues.default_sort
              }
            >
              {({ getFieldValue }) => {
                const columns = getFieldValue('columns') || [];
                const validColumns = columns.filter(col => col && col.name);
                const sortField = getFieldValue('default_sort');
                const hasIndex = sortField && tableIndexes[sortField]?.hasIndex;
                
                return (
                  <>
                    <Select placeholder="Select a column" allowClear>
                      {validColumns.map((col, index) => (
                        <Option key={`${col.name}-${index}`} value={col.name}>
                          {col.label || col.name}
                        </Option>
                      ))}
                    </Select>
                    {sortField && selectedTable && (
                      <div style={{ marginTop: token.marginXS }}>
                        {hasIndex ? (
                          <Alert
                            message="Indexed"
                            description="This field is indexed. Good for sort performance!"
                            type="success"
                            icon={<CheckCircleOutlined />}
                            showIcon
                            style={{ marginTop: token.marginXS }}
                          />
                        ) : (
                          <Alert
                            message="Not Indexed"
                            description="This field is not indexed. Consider adding an index for better sort performance."
                            type="warning"
                            icon={<WarningOutlined />}
                            showIcon
                            style={{ marginTop: token.marginXS }}
                          />
                        )}
                      </div>
                    )}
                  </>
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
                <SettingOutlined />
                <span>Page Configuration</span>
              </Space>
            ),
          },
        ]}
      />
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
            download_row_limit: null,
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

import { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Input,
  Button,
  Space,
  Typography,
  Form,
  Select,
  DatePicker,
  Spin,
  theme as antdTheme,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { usePage, downloadPageData } from '../api/pages';
import { showSuccess, showError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function DataPage() {
  const { pageKey } = useParams();
  const { token } = antdTheme.useToken();
  const { selectedTenant } = useAuth();
  const [form] = Form.useForm();

  // State for search, filters, pagination, and sorting
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState({});

  // Build query params for API
  const queryParams = useMemo(() => {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
    };

    if (searchText) {
      params.search = searchText;
    }

    if (sorting.field) {
      params.sortBy = sorting.field;
      params.sortOrder = sorting.order || 'ASC';
    }

    // Add filter values
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params[key] = filters[key];
      }
    });

    return params;
  }, [searchText, filters, pagination, sorting]);

  // Fetch page config and data
  const { data: pageData, isLoading, isError, error, refetch } = usePage(pageKey, queryParams);

  // Handle response format from axios interceptor:
  // Backend returns: { success: true, message: "...", data: { config, data, total } }
  // Axios interceptor returns: { success: true, message: "...", data: { config, data, total } }
  // usePage returns: res.data || res, which would be { config, data, total }
  // So pageData should be { config, data, total }
  const config = pageData?.config;
  const tableData = Array.isArray(pageData?.data) ? pageData.data : [];
  const total = pageData?.total || 0;

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 }); // Reset to first page on search
  };

  const handleFilterChange = (fieldName, value) => {
    setFilters((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setPagination({ ...pagination, current: 1 }); // Reset to first page on filter
  };

  const handleTableChange = (newPagination, newFilters, newSorter) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    if (newSorter.field) {
      setSorting({
        field: newSorter.field,
        order: newSorter.order === 'ascend' ? 'ASC' : 'DESC',
      });
    } else {
      setSorting({});
    }
  };

  const handleDownload = async () => {
    if (!config?.is_download_allowed) {
      showError('Download is not allowed for this page');
      return;
    }

    if (!selectedTenant) {
      showError('Please select a tenant first');
      return;
    }

    // Check if there's data to download
    if (!Array.isArray(tableData) || tableData.length === 0) {
      showError('No data available to download');
      return;
    }

    // Check if there's an error state
    if (isError) {
      showError('Cannot download data due to an error. Please resolve the error and try again.');
      return;
    }

    try {
      await downloadPageData(pageKey, queryParams);
      showSuccess('Download started successfully');
    } catch (error) {
      // Error already handled by downloadPageData
    }
  };

  const handleReset = () => {
    setSearchText('');
    setFilters({});
    setPagination({ current: 1, pageSize: config?.page_size_default || 20 });
    setSorting({});
    form.resetFields();
  };

  // Build table columns from config
  const tableColumns = useMemo(() => {
    if (!config?.columns) return [];

    return config.columns.map((col) => ({
      title: col.label || col.name,
      dataIndex: col.name,
      key: col.name,
      width: col.width,
      sorter: true,
      render: (value) => {
        if (value === null || value === undefined) return '-';
        if (col.type === 'date' && value) {
          return new Date(value).toLocaleDateString();
        }
        return String(value);
      },
    }));
  }, [config]);

  if (isLoading && !config) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spin size="large" tip="Loading page configuration..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <Title level={4}>Error Loading Page</Title>
        <p>{error?.message || error?.code || 'Failed to load page configuration'}</p>
        {error?.details && <p style={{ color: token.colorTextSecondary }}>{JSON.stringify(error.details)}</p>}
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ marginTop: token.marginMD }}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <Title level={4}>Page Configuration Not Found</Title>
        <p>The page configuration for "{pageKey}" could not be loaded.</p>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ marginTop: token.marginMD }}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!selectedTenant) {
    return (
      <Card>
        <Title level={4}>Tenant Required</Title>
        <p>Please select a tenant from the dropdown in the header to view this page.</p>
      </Card>
    );
  }

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
            <FileTextOutlined /> {config.title || pageKey}
          </Title>
          <Space>
            {config.is_download_allowed && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={isError || !Array.isArray(tableData) || tableData.length === 0}
                loading={false}
              >
                Download CSV
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Refresh
            </Button>
          </Space>
        </div>

        {/* Search Bar */}
        {config.searchable_fields && config.searchable_fields.length > 0 && (
          <div style={{ marginBottom: token.marginMD }}>
            <Input.Search
              placeholder="Search..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ maxWidth: 400 }}
            />
          </div>
        )}

        {/* Filters */}
        {config.filterable_fields && config.filterable_fields.length > 0 && (
          <Card
            size="small"
            style={{ marginBottom: token.marginMD, background: token.colorFillAlter }}
          >
            <Form form={form} layout="inline">
              <Row gutter={[16, 16]} style={{ width: '100%' }}>
                {config.filterable_fields.map((field) => (
                  <Col key={field.name} xs={24} sm={12} md={8} lg={6}>
                    <Form.Item label={field.label} style={{ marginBottom: 0 }}>
                      {field.type === 'select' ? (
                        <Select
                          placeholder={`Select ${field.label}`}
                          allowClear
                          style={{ width: '100%' }}
                          onChange={(value) => handleFilterChange(field.name, value)}
                          options={
                            field.options
                              ? field.options.map((opt) => ({ label: opt, value: opt }))
                              : []
                          }
                        />
                      ) : field.type === 'date' ? (
                        <RangePicker
                          style={{ width: '100%' }}
                          onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                              handleFilterChange(`${field.name}_from`, dates[0].format('YYYY-MM-DD'));
                              handleFilterChange(`${field.name}_to`, dates[1].format('YYYY-MM-DD'));
                            } else {
                              handleFilterChange(`${field.name}_from`, null);
                              handleFilterChange(`${field.name}_to`, null);
                            }
                          }}
                        />
                      ) : (
                        <Input
                          placeholder={`Filter by ${field.label}`}
                          allowClear
                          onChange={(e) => handleFilterChange(field.name, e.target.value)}
                        />
                      )}
                    </Form.Item>
                  </Col>
                ))}
                <Col>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button onClick={handleReset}>Reset Filters</Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {/* Data Table */}
        {tableData.length === 0 && !isLoading ? (
          <Card style={{ textAlign: 'center', padding: token.paddingXXL }}>
            <FileTextOutlined style={{ fontSize: 48, color: token.colorTextSecondary, marginBottom: token.marginMD }} />
            <Title level={4} type="secondary">No Data Available</Title>
            <p style={{ color: token.colorTextSecondary }}>
              There are no records to display for this page. Try adjusting your filters or search criteria.
            </p>
          </Card>
        ) : (
          <Table
            columns={tableColumns}
            dataSource={tableData}
            rowKey={(record, index) => record.id || record[config.columns[0]?.name] || index}
            loading={isLoading}
            pagination={{
              current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </div>
  );
}


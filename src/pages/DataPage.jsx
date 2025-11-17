import { useState, useMemo } from 'react';
import {
  Card,
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
  Drawer,
  Descriptions,
  Breadcrumb,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { usePage, downloadPageData } from '../api/pages';
import { showSuccess, showError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';

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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloading, setDownloading] = useState(false);

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
  // Use isFetching for table loading (shows loading on refetch)
  // Use isLoading only for initial config load check
  const { data: pageData, isLoading, isFetching, isError, error, refetch } = usePage(pageKey, queryParams);

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

    // Check if there's an error state
    if (isError) {
      showError('Cannot download data due to an error. Please resolve the error and try again.');
      return;
    }

    setDownloading(true);
    try {
      await downloadPageData(pageKey, queryParams);
      showSuccess('Download completed successfully');
    } catch (error) {
      // Error already handled by downloadPageData
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setSearchText('');
    setFilters({});
    setPagination({ current: 1, pageSize: config?.page_size_default || 20 });
    setSorting({});
    form.resetFields();
  };

  const handleMoreClick = (record) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  // Only show full page loading on initial config load
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
                  <FileTextOutlined />
                  <span>{pageKey}</span>
                </Space>
              ),
            },
          ]}
        />
        <Card>
          <Title level={4}>Error Loading Page</Title>
          <p>{error?.message || error?.code || 'Failed to load page configuration'}</p>
          {error?.details && <p style={{ color: token.colorTextSecondary }}>{JSON.stringify(error.details)}</p>}
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ marginTop: token.marginMD }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!config) {
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
                  <FileTextOutlined />
                  <span>{pageKey}</span>
                </Space>
              ),
            },
          ]}
        />
        <Card>
          <Title level={4}>Page Configuration Not Found</Title>
          <p>The page configuration for "{pageKey}" could not be loaded.</p>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ marginTop: token.marginMD }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!selectedTenant) {
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
                  <FileTextOutlined />
                  <span>{config?.title || pageKey}</span>
                </Space>
              ),
            },
          ]}
        />
        <Card>
          <Title level={4}>Tenant Required</Title>
          <p>Please select a tenant from the dropdown in the header to view this page.</p>
        </Card>
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
                <FileTextOutlined />
                <span>{config.title || pageKey}</span>
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
            <FileTextOutlined /> {config.title || pageKey}
          </Title>
          <Space>
            {config.is_download_allowed && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={isError || downloading}
                loading={downloading}
              >
                {downloading ? 'Downloading...' : 'Download CSV'}
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
              <Row gutter={[16, 16]} align="bottom" style={{ width: '100%' }}>
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

        {/* Data Table Component */}
        <DataTable
          config={config}
          data={tableData}
          total={total}
          loading={isFetching && !!config}
          pagination={pagination}
          sorting={sorting}
          onTableChange={handleTableChange}
          onMoreClick={handleMoreClick}
          token={token}
        />
      </Card>

      {/* Drawer for showing additional columns */}
      <Drawer
        title="Additional Details"
        placement="right"
        onClose={() => {
          setDrawerVisible(false);
          setSelectedRecord(null);
        }}
        open={drawerVisible}
        width={600}
      >
        {selectedRecord && config && (
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
            {config.columns.slice(5).map((col) => {
              const value = selectedRecord[col.name];
              let displayValue = '-';
              if (value !== null && value !== undefined) {
                if (col.type === 'date' && value) {
                  displayValue = new Date(value).toLocaleDateString();
                } else {
                  displayValue = String(value);
                }
              }
              return (
                <Descriptions.Item key={col.name} label={col.label || col.name}>
                  <div
                    style={{
                      wordBreak: 'break-word',
                      color: token.colorText,
                    }}
                  >
                    {displayValue}
                  </div>
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


import { useMemo, useEffect, useCallback, useState } from 'react';
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
import useAuthStore from '../stores/authStore';
import useDataPageStore from '../stores/dataPageStore';
import DataTable from '../components/DataTable';
import { useDebounce } from '../hooks/useDebounce';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function DataPage() {
  const { pageKey } = useParams();
  const { token } = antdTheme.useToken();
  const selectedTenant = useAuthStore((state) => state.selectedTenant);
  const [form] = Form.useForm();

  // Stable default objects to avoid creating new ones on each render
  const defaultFilters = useMemo(() => ({}), []);
  const defaultSorting = useMemo(() => ({}), []);

  // Ensure page state exists in store
  const ensurePageState = useDataPageStore((state) => state.ensurePageState);
  useEffect(() => {
    if (pageKey) {
      ensurePageState(pageKey);
    }
  }, [pageKey, ensurePageState]);

  // Get page state from Zustand store - selector returns the state object
  const pageState = useDataPageStore((state) => state.pageStates[pageKey]);
  
  // Get store actions
  const setSearchText = useDataPageStore((state) => state.setSearchText);
  const setFilterValue = useDataPageStore((state) => state.setFilterValue);
  const setPagination = useDataPageStore((state) => state.setPagination);
  const setSorting = useDataPageStore((state) => state.setSorting);
  const setDrawerVisible = useDataPageStore((state) => state.setDrawerVisible);
  const setSelectedRecord = useDataPageStore((state) => state.setSelectedRecord);
  const setDownloading = useDataPageStore((state) => state.setDownloading);
  const resetPageState = useDataPageStore((state) => state.resetFilters);

  // Use stable defaults when state doesn't exist yet
  const searchText = pageState?.searchText ?? '';
  const filters = pageState?.filters ?? defaultFilters;
  const sorting = pageState?.sorting ?? defaultSorting;
  const drawerVisible = pageState?.drawerVisible ?? false;
  const selectedRecord = pageState?.selectedRecord ?? null;
  const downloading = pageState?.downloading ?? false;

  // Debounced values for API calls (500ms delay)
  const debouncedSearchText = useDebounce(searchText, 500);
  
  // Track immediate filter updates (for Select and DatePicker)
  const [immediateFilters, setImmediateFilters] = useState({});
  
  // Debounce text filter values (for Input fields)
  // Select and DatePicker updates are immediate via immediateFilters
  const debouncedFiltersValue = useDebounce(filters, 500);
  
  // Merge debounced filters with immediate filters (Select/DatePicker)
  const mergedFilters = useMemo(() => {
    return { ...debouncedFiltersValue, ...immediateFilters };
  }, [debouncedFiltersValue, immediateFilters]);

  // Reset immediate filters when page changes
  useEffect(() => {
    setImmediateFilters({});
  }, [pageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optionally reset state when leaving the page
      // resetPageState(pageKey);
    };
  }, [pageKey]);

  // Build query params for API using debounced values
  const queryParams = useMemo(() => {
    const params = {
      page: (pageState?.pagination?.current || 1),
      pageSize: (pageState?.pagination?.pageSize || 20),
    };

    if (debouncedSearchText) {
      params.search = debouncedSearchText;
    }

    if (sorting.field) {
      params.sortBy = sorting.field;
      params.sortOrder = sorting.order || 'ASC';
    }

    // Add filter values (merged: debounced for text inputs, immediate for selects/dates)
    Object.keys(mergedFilters).forEach((key) => {
      if (mergedFilters[key] !== undefined && mergedFilters[key] !== null && mergedFilters[key] !== '') {
        params[key] = mergedFilters[key];
      }
    });

    return params;
  }, [debouncedSearchText, mergedFilters, pageState?.pagination, sorting]);

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
  const backendTotal = pageData?.total ?? 0;
  const hasMore = config?.source_type === 'PROCEDURE' ? Boolean(pageData?.hasMore) : false;
  
  // Initialize pagination with config's page_size_default when config loads
  useEffect(() => {
    if (config?.page_size_default && pageState) {
      const currentPageSize = pageState.pagination?.pageSize;
      // Only update if pagination hasn't been set or is still using default 20
      if (!currentPageSize || (currentPageSize === 20 && config.page_size_default !== 20)) {
        setPagination(pageKey, {
          current: pageState.pagination?.current || 1,
          pageSize: config.page_size_default,
        });
      }
    }
  }, [config?.page_size_default, pageKey, pageState, setPagination]);
  
  // Use config's page_size_default for default pagination, fallback to store value or 20
  const defaultPageSize = config?.page_size_default || pageState?.pagination?.pageSize || 20;
  const defaultPagination = useMemo(() => ({ current: 1, pageSize: defaultPageSize }), [defaultPageSize]);
  const pagination = pageState?.pagination ?? defaultPagination;
  const effectiveTotal = useMemo(() => {
    if (config?.source_type === 'PROCEDURE') {
      const current = pagination.current || 1;
      const pageSize = pagination.pageSize || defaultPageSize;
      const base = (current - 1) * pageSize + tableData.length;
      return hasMore ? base + 1 : base;
    }
    return backendTotal;
  }, [config?.source_type, pagination.current, pagination.pageSize, defaultPageSize, tableData.length, hasMore, backendTotal]);

  const handleSearch = (value) => {
    setSearchText(pageKey, value);
  };

  const handleFilterChange = (fieldName, value, isImmediate = false) => {
    setFilterValue(pageKey, fieldName, value);
    // For Select and DatePicker, update immediate filters for instant API call
    if (isImmediate) {
      setImmediateFilters((prev) => {
        const newFilters = { ...prev };
        // Remove filter if value is null/undefined/empty
        if (value === null || value === undefined || value === '') {
          delete newFilters[fieldName];
        } else {
          newFilters[fieldName] = value;
        }
        return newFilters;
      });
    } else {
      // For text inputs, remove from immediate filters (will use debounced value)
      setImmediateFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters[fieldName];
        return newFilters;
      });
    }
  };

  const handleTableChange = (newPagination, newFilters, newSorter) => {
    setPagination(pageKey, {
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    if (newSorter.field) {
      setSorting(pageKey, {
        field: newSorter.field,
        order: newSorter.order === 'ascend' ? 'ASC' : 'DESC',
      });
    } else {
      setSorting(pageKey, {});
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

    setDownloading(pageKey, true);
    try {
      await downloadPageData(pageKey, queryParams);
      showSuccess('Download completed successfully');
    } catch (error) {
      // Error already handled by downloadPageData
    } finally {
      setDownloading(pageKey, false);
    }
  };

  const handleReset = () => {
    resetPageState(pageKey, config?.page_size_default || 20);
    form.resetFields();
    // Reset immediate filters
    setImmediateFilters({});
  };

  const handleMoreClick = (record) => {
    setSelectedRecord(pageKey, record);
    setDrawerVisible(pageKey, true);
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
                          onChange={(value) => handleFilterChange(field.name, value, true)}
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
                              handleFilterChange(`${field.name}_from`, dates[0].format('YYYY-MM-DD'), true);
                              handleFilterChange(`${field.name}_to`, dates[1].format('YYYY-MM-DD'), true);
                            } else {
                              handleFilterChange(`${field.name}_from`, null, true);
                              handleFilterChange(`${field.name}_to`, null, true);
                            }
                          }}
                        />
                      ) : (
                        <Input
                          placeholder={`Filter by ${field.label}`}
                          allowClear
                          onChange={(e) => handleFilterChange(field.name, e.target.value, false)}
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
          total={effectiveTotal}
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
          setDrawerVisible(pageKey, false);
          setSelectedRecord(pageKey, null);
        }}
        open={drawerVisible}
        width={600}
      >
        {selectedRecord && (
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
            {(() => {
              // If columns are specified in config, use them (beyond first 5)
              if (config?.columns && Array.isArray(config.columns) && config.columns.length > 5) {
                return config.columns.slice(5).map((col) => {
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
                });
              }
              
              // If columns are not specified, show all fields beyond first 5
              const allKeys = Object.keys(selectedRecord);
              const hiddenKeys = allKeys.slice(5);
              return hiddenKeys.map((key) => {
                const value = selectedRecord[key];
                let displayValue = '-';
                if (value !== null && value !== undefined) {
                  // Try to detect date format
                  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
                    try {
                      displayValue = new Date(value).toLocaleDateString();
                    } catch {
                      displayValue = String(value);
                    }
                  } else {
                    displayValue = String(value);
                  }
                }
                return (
                  <Descriptions.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}>
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
              });
            })()}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


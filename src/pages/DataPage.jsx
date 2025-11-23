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
  Tag,
  Alert,
  Tooltip,
  Modal,
  Checkbox,
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
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { usePage, downloadPageData } from '../api/pages';
import { usePagePreferences, useSavePagePreferences } from '../api/pagePreferences';
import { showSuccess, showError } from '../utils/errorHandler';
import useAuthStore from '../stores/authStore';
import useDataPageStore from '../stores/dataPageStore';
import DataTable from '../components/DataTable';
import ErrorDisplay from '../components/ErrorDisplay';
import { useDebounce } from '../hooks/useDebounce';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const toTitle = (text = '') => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const buildColumnSettings = (baseColumns = [], preferences = []) => {
  if (!Array.isArray(baseColumns) || baseColumns.length === 0) {
    return [];
  }

  const baseMap = new Map(
    baseColumns.map((col) => [col.name, { name: col.name, label: col.label || toTitle(col.name) }])
  );

  const normalizedPrefs = (Array.isArray(preferences) ? preferences : [])
    .map((pref) => {
      if (!pref) return null;
      const name = pref.name || pref.column || pref;
      if (!name || !baseMap.has(name)) return null;
      return {
        name,
        visible: pref.visible !== false,
        label: baseMap.get(name)?.label || toTitle(name),
      };
    })
    .filter(Boolean);

  const remaining = [];
  baseMap.forEach((value, key) => {
    if (!normalizedPrefs.some((pref) => pref.name === key)) {
      remaining.push({ name: key, visible: true, label: value.label });
    }
  });

  return [...normalizedPrefs, ...remaining];
};

function DataPage() {
  const { pageKey } = useParams();
  const { token } = antdTheme.useToken();
  const selectedTenant = useAuthStore((state) => state.selectedTenant);
  const [form] = Form.useForm();
  const [columnSettings, setColumnSettings] = useState([]);
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const { data: pagePreferences } = usePagePreferences(pageKey, { enabled: Boolean(pageKey) });
  const savePreferencesMutation = useSavePagePreferences(pageKey);

  // Handle response format from axios interceptor:
  // Backend returns: { success: true, message: "...", data: { config, data, total } }
  // Axios interceptor returns: { success: true, message: "...", data: { config, data, total } }
  // usePage returns: res.data || res, which would be { config, data, total }
  // So pageData should be { config, data, total }
  const config = pageData?.config;
  const tableData = Array.isArray(pageData?.data) ? pageData.data : [];
  const backendTotal = pageData?.total ?? 0;
  const hasMore = config?.source_type === 'PROCEDURE' ? Boolean(pageData?.hasMore) : false;

  const baseColumns = useMemo(() => {
    if (!Array.isArray(config?.columns)) return [];
    return config.columns.map((col) => ({
      ...col,
      label: col.label || toTitle(col.name),
    }));
  }, [config?.columns]);

  const fallbackPreferences = useMemo(() => {
    if (!baseColumns.length) return [];
    return baseColumns.map((col) => ({ name: col.name, visible: true }));
  }, [baseColumns]);

  const applySavedPreferences = useCallback(() => {
    if (!baseColumns.length) {
      setColumnSettings([]);
      return;
    }
    const prefs =
      Array.isArray(pagePreferences?.tableColumns) && pagePreferences.tableColumns.length > 0
        ? pagePreferences.tableColumns
        : fallbackPreferences;
    setColumnSettings(buildColumnSettings(baseColumns, prefs));
  }, [baseColumns, fallbackPreferences, pagePreferences?.tableColumns]);

  useEffect(() => {
    applySavedPreferences();
  }, [applySavedPreferences]);

  const visibleColumnNames = useMemo(
    () => columnSettings.filter((col) => col.visible !== false).map((col) => col.name),
    [columnSettings]
  );

  const displayColumns = useMemo(() => {
    if (!config?.columns) return [];
    if (columnSettings.length === 0) return config.columns;

    const columnMap = new Map(config.columns.map((col) => [col.name, col]));
    const ordered = [];
    columnSettings.forEach((setting) => {
      const column = columnMap.get(setting.name);
      if (column && setting.visible !== false) {
        ordered.push(column);
      }
    });
    // Include any columns not present in settings (new columns)
    config.columns.forEach((column) => {
      if (!columnSettings.some((setting) => setting.name === column.name)) {
        ordered.push(column);
      }
    });
    return ordered;
  }, [config?.columns, columnSettings]);

  const displayConfig = useMemo(() => {
    if (!config) return config;
    return {
      ...config,
      columns: displayColumns,
    };
  }, [config, displayColumns]);

  const tableConfig = displayConfig || config;

  // Compute hidden columns (columns not visible in the table) for the "View More" drawer
  const hiddenColumns = useMemo(() => {
    if (!config?.columns || !Array.isArray(config.columns)) return [];
    if (columnSettings.length === 0) return []; // If no preferences, all columns are visible
    
    const visibleSet = new Set(visibleColumnNames);
    return config.columns.filter((col) => !visibleSet.has(col.name));
  }, [config?.columns, visibleColumnNames, columnSettings]);

  const handleColumnModalClose = useCallback(() => {
    setColumnModalOpen(false);
  }, []);

  const handleRevertToSaved = useCallback(() => {
    applySavedPreferences();
  }, [applySavedPreferences]);

  const handleColumnVisibilityChange = (name, checked) => {
    setColumnSettings((prev) =>
      prev.map((col) => (col.name === name ? { ...col, visible: checked } : col))
    );
  };

  const handleColumnMove = (name, direction) => {
    setColumnSettings((prev) => {
      const index = prev.findIndex((col) => col.name === name);
      if (index === -1) return prev;
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      return updated;
    });
  };

  const handleResetColumnSettings = () => {
    if (!baseColumns.length) {
      setColumnSettings([]);
      return;
    }
    setColumnSettings(buildColumnSettings(baseColumns, fallbackPreferences));
  };

  const handleSaveColumnSettings = () => {
    if (!baseColumns.length) {
      setColumnModalOpen(false);
      return;
    }
    const payload = {
      tableColumns: columnSettings.map((col) => ({ name: col.name, visible: col.visible !== false })),
      downloadColumns: columnSettings.map((col) => ({ name: col.name, visible: col.visible !== false })),
    };
    savePreferencesMutation.mutate(payload, {
      onSuccess: () => {
        setColumnModalOpen(false);
      },
    });
  };

  const savingPreferences =
    (savePreferencesMutation.isPending ?? savePreferencesMutation.isLoading) ?? false;
  
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
      await downloadPageData(pageKey, queryParams, visibleColumnNames);
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
        <ErrorDisplay error={error} config={config} />
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} style={{ marginTop: token.marginMD }}>
          Retry
        </Button>
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
    <div 
      style={{ 
        padding: token.paddingLG,
        maxWidth: '100%',
        overflowX: 'auto'
      }}
    >
      <Breadcrumb
        style={{ marginBottom: token.marginMD }}
        items={[
          {
            title: (
              <Link to="/" aria-label="Navigate to home page">
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
        aria-label="Breadcrumb navigation"
      />
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: token.marginLG,
            gap: token.marginMD,
          }}
        >
          <Title 
            level={2} 
            style={{ margin: 0 }}
            id="page-title"
            aria-label={`Page: ${config.title || pageKey}`}
          >
            <FileTextOutlined /> {config.title || pageKey}
          </Title>
          <Space 
            wrap
            style={{ 
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'flex-start' : 'flex-end'
            }}
          >
            <Button
              icon={<SettingOutlined />}
              onClick={() => setColumnModalOpen(true)}
              disabled={!Array.isArray(config?.columns) || config.columns.length === 0}
              aria-label="Configure column preferences"
              aria-haspopup="dialog"
            >
              Columns
            </Button>
            {config.is_download_allowed && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={isError || downloading}
                loading={downloading}
                aria-label={downloading ? 'Downloading data' : 'Download data as CSV'}
              >
                {downloading ? 'Downloading...' : 'Download CSV'}
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
              aria-label="Refresh page data"
            >
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
              style={{ maxWidth: isMobile ? '100%' : 400 }}
              aria-label="Search data"
              aria-describedby="search-help"
            />
            <div id="search-help" style={{ fontSize: '12px', color: token.colorTextSecondary, marginTop: 4 }}>
              <Space size="small" wrap>
                <span>Search in:</span>
                {config.searchable_fields.map((field, idx) => {
                  const fieldName = typeof field === 'string' ? field : (field.name || field);
                  const fieldLabel = typeof field === 'object' && field.label ? field.label : fieldName;
                  // Try to get label from config.columns if available
                  const columnConfig = config.columns?.find(col => col.name === fieldName);
                  const displayLabel = columnConfig?.label || fieldLabel || fieldName;
                  
                  return (
                    <Tag key={idx} color="blue" style={{ margin: 0 }}>
                      {displayLabel}
                    </Tag>
                  );
                })}
              </Space>
            </div>
          </div>
        )}

        {/* Filters */}
        {config.filterable_fields && config.filterable_fields.length > 0 && (
          <Card
            size="small"
            style={{ marginBottom: token.marginMD, background: token.colorFillAlter }}
            aria-label="Filter options"
          >
            <Form form={form} layout="inline">
              <Row gutter={[16, 16]} align="bottom" style={{ width: '100%' }}>
                {config.filterable_fields.map((field) => (
                  <Col key={field.name} xs={24} sm={12} md={8} lg={6}>
                    <Form.Item 
                      label={field.label} 
                      style={{ marginBottom: 0 }}
                      htmlFor={`filter-${field.name}`}
                    >
                      {field.type === 'select' ? (
                        <Select
                          id={`filter-${field.name}`}
                          placeholder={`Select ${field.label}`}
                          allowClear
                          style={{ width: '100%' }}
                          onChange={(value) => handleFilterChange(field.name, value, true)}
                          options={
                            field.options
                              ? field.options.map((opt) => ({ label: opt, value: opt }))
                              : []
                          }
                          aria-label={`Filter by ${field.label}`}
                        />
                      ) : field.type === 'date' ? (
                        <RangePicker
                          id={`filter-${field.name}`}
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
                          aria-label={`Filter ${field.label} by date range`}
                        />
                      ) : (
                        <Input
                          id={`filter-${field.name}`}
                          placeholder={`Filter by ${field.label}`}
                          allowClear
                          onChange={(e) => handleFilterChange(field.name, e.target.value, false)}
                          aria-label={`Filter by ${field.label}`}
                        />
                      )}
                    </Form.Item>
                  </Col>
                ))}
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button 
                      onClick={handleReset}
                      aria-label="Reset all filters"
                    >
                      Reset Filters
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        )}

        {/* Data Table Component */}
        <DataTable
          config={tableConfig}
          data={tableData}
          total={effectiveTotal}
          loading={isFetching && !!config}
          pagination={pagination}
          sorting={sorting}
          onTableChange={handleTableChange}
          onMoreClick={handleMoreClick}
          token={token}
          hasMore={hasMore}
          hasHiddenColumns={hiddenColumns.length > 0}
        />
      </Card>

      <Modal
        title="Column Preferences"
        open={columnModalOpen}
        onCancel={handleColumnModalClose}
        destroyOnClose={false}
        footer={[
          <Button key="revert" onClick={handleRevertToSaved} disabled={!columnSettings.length}>
            Revert to saved
          </Button>,
          <Button key="reset" onClick={handleResetColumnSettings} disabled={!columnSettings.length}>
            Reset to defaults
          </Button>,
          <Button key="close" onClick={handleColumnModalClose}>
            Close
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveColumnSettings}
            loading={savingPreferences}
            disabled={!columnSettings.length}
          >
            Save
          </Button>,
        ]}
      >
        {columnSettings.length === 0 ? (
          <Typography.Text type="secondary">No columns available for this page.</Typography.Text>
        ) : (
          columnSettings.map((col, index) => (
            <div
              key={col.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom:
                  index !== columnSettings.length - 1 ? `1px solid ${token.colorSplit}` : 'none',
              }}
            >
              <Checkbox
                checked={col.visible !== false}
                onChange={(e) => handleColumnVisibilityChange(col.name, e.target.checked)}
              >
                {col.label || toTitle(col.name)}
              </Checkbox>
              <Space>
                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  onClick={() => handleColumnMove(col.name, -1)}
                  disabled={index === 0}
                />
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  onClick={() => handleColumnMove(col.name, 1)}
                  disabled={index === columnSettings.length - 1}
                />
              </Space>
            </div>
          ))
        )}
        {columnSettings.length > 0 && (
          <Typography.Paragraph type="secondary" style={{ marginTop: token.marginSM }}>
            Select which columns appear in the table and their order. Downloads use the same
            selection.
          </Typography.Paragraph>
        )}
      </Modal>

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
              // Show only hidden columns (columns not visible in the table)
              if (hiddenColumns.length > 0) {
                return hiddenColumns.map((col) => {
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

              // Fallback: if no column config, show all fields not in visible columns
              if (selectedRecord && typeof selectedRecord === 'object') {
                const visibleSet = new Set(visibleColumnNames);
                const hiddenFields = Object.entries(selectedRecord).filter(([key]) => !visibleSet.has(key));
                
                if (hiddenFields.length > 0) {
                  return hiddenFields.map(([key, value]) => {
                    let displayValue = '-';
                    if (value !== null && value !== undefined) {
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
                      <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
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
              }

              return (
                <Descriptions.Item key="no-data" label="No additional data">
                  <Typography.Text type="secondary">
                    All columns are currently visible in the table. Use the Columns button to hide some columns.
                  </Typography.Text>
                </Descriptions.Item>
              );
            })()}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}

export default DataPage;


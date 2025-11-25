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
  theme as antdTheme,
  Row,
  Col,
  Breadcrumb,
  Modal,
  Checkbox,
  Drawer,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { usePage, downloadPageData } from '../api/pages';
import { showSuccess, showError } from '../utils/errorHandler';
import useAuthStore from '../stores/authStore';
import useDataPageStore from '../stores/dataPageStore';
import DataTable from '../components/DataTable';
import ErrorDisplay from '../components/ErrorDisplay';
import { useDebounce } from '../hooks/useDebounce';
import {
  getColumnPreferences,
  saveColumnPreferences,
  clearColumnPreferences,
  initializeColumnSettings,
  normalizeColumns,
} from '../utils/columnPreferences';

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

function DataPage() {
  const { pageKey } = useParams();
  const { token } = antdTheme.useToken();
  const selectedTenant = useAuthStore((state) => state.selectedTenant);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [exportFormat, setExportFormat] = useState('csv');
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [columnSettings, setColumnSettings] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [preferencesVersion, setPreferencesVersion] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);

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
  const setDownloading = useDataPageStore((state) => state.setDownloading);
  const resetPageState = useDataPageStore((state) => state.resetFilters);

  // Use stable defaults when state doesn't exist yet
  const searchText = pageState?.searchText ?? '';
  const filters = pageState?.filters ?? defaultFilters;
  const sorting = pageState?.sorting ?? defaultSorting;
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

  // Load column preferences from localStorage
  const savedPreferences = useMemo(() => {
    if (!pageKey || !config?.columns) return null;
    return getColumnPreferences(pageKey);
  }, [pageKey, config?.columns, preferencesVersion]);

  // Build column settings with preferences applied
  const buildColumnSettings = useCallback(() => {
    if (!config?.columns || !Array.isArray(config.columns)) return [];
    return initializeColumnSettings(config.columns, savedPreferences);
  }, [config?.columns, savedPreferences]);

  // Initialize column settings when config loads
  useEffect(() => {
    if (config?.columns) {
      const settings = buildColumnSettings();
      setColumnSettings(settings);
    }
  }, [config?.columns, buildColumnSettings]);

  // Get visible columns (all visible ones, not limited to 5)
  const visibleColumns = useMemo(() => {
    if (!config?.columns || columnSettings.length === 0) return config?.columns || [];
    const visible = columnSettings.filter(col => col.visible);
    return visible.map(col => {
      const originalCol = config.columns.find(c => c.name === col.name);
      return originalCol || { name: col.name, label: col.label, type: col.type, width: col.width };
    });
  }, [config?.columns, columnSettings]);

  // Get hidden columns (for modal/drawer - all columns that are not visible)
  const hiddenColumns = useMemo(() => {
    if (!config?.columns || columnSettings.length === 0) return [];
    return columnSettings.filter(col => !col.visible);
  }, [columnSettings]);

  const tableConfig = useMemo(() => {
    if (!config) return null;
    return {
      ...config,
      columns: visibleColumns,
    };
  }, [config, visibleColumns]);
  
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
      // Use only visible columns for download (not hidden columns)
      // Fallback to all config columns if no visible columns (edge case)
      const visibleColumnNames = visibleColumns.length > 0
        ? visibleColumns.map(col => col.name)
        : (config?.columns?.map(col => col.name) || []);
      await downloadPageData(pageKey, queryParams, visibleColumnNames, exportFormat, config);
      showSuccess(`Download completed successfully (${exportFormat.toUpperCase()})`);
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
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const handleColumnSettingsChange = (index, field, value) => {
    const newSettings = [...columnSettings];
    if (field === 'visible') {
      newSettings[index].visible = value;
    }
    setColumnSettings(newSettings);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSettings = [...columnSettings];
    const draggedItem = newSettings[draggedIndex];
    
    // Remove dragged item
    newSettings.splice(draggedIndex, 1);
    
    // Insert at new position
    const newIndex = draggedIndex < index ? index - 1 : index;
    newSettings.splice(newIndex, 0, draggedItem);
    
    // Update orders
    newSettings.forEach((col, idx) => {
      col.order = idx;
    });
    
    setColumnSettings(newSettings);
    setDraggedIndex(newIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Handle column reorder from table (direct drag in table headers)
  const handleColumnReorder = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    
    const newSettings = [...columnSettings];
    const visibleColumns = newSettings.filter(col => col.visible);
    
    // Only reorder visible columns
    if (fromIndex >= visibleColumns.length || toIndex >= visibleColumns.length) return;
    
    // Get the column names in current order
    const visibleColumnNames = visibleColumns.map(col => col.name);
    const draggedColumnName = visibleColumnNames[fromIndex];
    
    // Reorder the visible column names
    visibleColumnNames.splice(fromIndex, 1);
    visibleColumnNames.splice(toIndex, 0, draggedColumnName);
    
    // Update orders for all columns based on new visible order
    let orderIndex = 0;
    const visibleNamesSet = new Set(visibleColumnNames);
    
    // First update visible columns in their new order
    visibleColumnNames.forEach(columnName => {
      const settingIndex = newSettings.findIndex(s => s.name === columnName);
      if (settingIndex !== -1) {
        newSettings[settingIndex].order = orderIndex++;
      }
    });
    
    // Then update hidden columns (keep their relative order)
    const hiddenColumns = newSettings.filter(s => !visibleNamesSet.has(s.name));
    hiddenColumns.forEach(setting => {
      setting.order = orderIndex++;
    });
    
    // Re-sort all settings by order
    newSettings.sort((a, b) => a.order - b.order);
    setColumnSettings(newSettings);
    
    // Auto-save preferences when reordered in table
    if (pageKey) {
      const preferences = {
        visibleColumns: normalizeColumns(newSettings),
      };
      saveColumnPreferences(pageKey, preferences);
      setPreferencesVersion(prev => prev + 1);
    }
  }, [columnSettings, pageKey]);

  const handleSaveColumnPreferences = () => {
    if (!pageKey) return;
    
    const preferences = {
      visibleColumns: normalizeColumns(columnSettings),
    };
    
    saveColumnPreferences(pageKey, preferences);
    showSuccess('Column preferences saved');
    setColumnModalOpen(false);
    setPreferencesVersion(prev => prev + 1);
  };

  const handleResetColumnPreferences = () => {
    if (!pageKey || !config?.columns) return;
    
    clearColumnPreferences(pageKey);
    const defaultSettings = config.columns.map((col, index) => ({
      name: col.name,
      label: col.label || col.name,
      type: col.type || 'string',
      visible: index < 5, // First 5 visible by default
      order: index,
      width: col.width,
    }));
    setColumnSettings(defaultSettings);
    showSuccess('Column preferences reset to defaults');
    setPreferencesVersion(prev => prev + 1);
  };

  const handleRevertColumnPreferences = () => {
    if (!config?.columns) return;
    const settings = buildColumnSettings();
    setColumnSettings(settings);
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
            {config.is_download_allowed && (
              <Space.Compact>
                <Tooltip title="CSV: Simple text format, easy to import. Excel: Formatted with headers, borders, and styling.">
                  <Select
                    value={exportFormat}
                    onChange={setExportFormat}
                    disabled={downloading}
                    style={{ width: 100 }}
                    options={[
                      { label: 'CSV', value: 'csv' },
                      { label: 'Excel', value: 'excel' },
                    ]}
                    aria-label="Select export format"
                  />
                </Tooltip>
                <Tooltip title={`Download current data as ${exportFormat.toUpperCase()}. Only visible columns will be included.`}>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={isError || downloading}
                loading={downloading}
                    aria-label={downloading ? 'Downloading data' : `Download data as ${exportFormat.toUpperCase()}`}
              >
                    {downloading ? 'Downloading...' : 'Download'}
              </Button>
                </Tooltip>
              </Space.Compact>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
              aria-label="Refresh page data"
            >
              Refresh
            </Button>
            {config?.columns && config.columns.length > 0 && (
              <Button
                icon={<SettingOutlined />}
                onClick={() => setColumnModalOpen(true)}
                aria-label="Customize columns"
              >
                Columns
              </Button>
            )}
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
                <Tooltip title="Global search searches across all listed fields simultaneously. Type your search term and press Enter or click the search icon.">
                  <InfoCircleOutlined style={{ fontSize: 12, cursor: 'help' }} />
                </Tooltip>
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
            title={
              <Space>
                <span>Filters</span>
                <Tooltip title="Apply filters to narrow down results. Filters work together (AND logic). Use Reset to clear all filters.">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                </Tooltip>
              </Space>
            }
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
                      ) : field.type === 'tags' ? (
                        <Select
                          id={`filter-${field.name}`}
                          mode="tags"
                          placeholder={`Type and press Enter to add ${field.label} values`}
                          allowClear
                          style={{ width: '100%' }}
                          onChange={(values) => {
                            // Convert array to comma-separated string for backend
                            const filterValue = Array.isArray(values) && values.length > 0 
                              ? values.join(',')
                              : '';
                            handleFilterChange(field.name, filterValue, false);
                          }}
                          value={
                            filters[field.name] 
                              ? (typeof filters[field.name] === 'string'
                                  ? filters[field.name].split(',').filter(v => v.trim())
                                  : Array.isArray(filters[field.name])
                                    ? filters[field.name]
                                    : [])
                              : undefined
                          }
                          tokenSeparators={[',']}
                          aria-label={`Filter by ${field.label}`}
                          notFoundContent={null}
                          maxTagCount="responsive"
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
          onMoreClick={hiddenColumns.length > 0 ? handleMoreClick : null}
          onColumnReorder={handleColumnReorder}
          token={token}
          hasMore={hasMore}
          hasHiddenColumns={hiddenColumns.length > 0}
        />
      </Card>

      {/* Column Preferences Modal */}
      {config?.columns && (
      <Modal
          title="Column Preferences"
        open={columnModalOpen}
          onCancel={() => {
            setColumnModalOpen(false);
            handleRevertColumnPreferences();
          }}
          onOk={handleSaveColumnPreferences}
          okText="Save"
          cancelText="Cancel"
          width={600}
      >
        <Alert
          message="Column Customization"
            description="Toggle column visibility and drag columns to reorder them. All visible columns will be shown in the table."
          type="info"
          showIcon
            style={{ marginBottom: token.marginLG }}
        />
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {columnSettings.map((col, index) => (
            <div
              key={col.name}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                  padding: token.paddingSM,
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  gap: token.marginSM,
                  cursor: 'move',
                  backgroundColor: draggedIndex === index ? token.colorFillSecondary : 'transparent',
                  opacity: draggedIndex === index ? 0.5 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    color: token.colorTextSecondary,
                    marginRight: token.marginXS,
                    cursor: 'grab',
              }}
                  title="Drag to reorder"
                >
                  ⋮⋮
                </span>
              <Checkbox
                  checked={col.visible}
                  onChange={(e) => handleColumnSettingsChange(index, 'visible', e.target.checked)}
              >
                  <span style={{ fontWeight: col.visible ? 500 : 400 }}>
                    {col.label}
                  </span>
              </Checkbox>
            </div>
            ))}
          </div>
          <div style={{ marginTop: token.marginLG, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleRevertColumnPreferences}>
              Revert to Saved
            </Button>
            <Button onClick={handleResetColumnPreferences} danger>
              Reset to Defaults
            </Button>
          </div>
      </Modal>
      )}

      {/* Drawer for showing additional record details */}
      {selectedRecord && (
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
            {hiddenColumns.map((col) => {
              const value = selectedRecord[col.name];
              let displayValue = '-';
              if (value !== null && value !== undefined) {
                if (col.type === 'date' && value) {
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
                <Descriptions.Item key={col.name} label={col.label}>
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
      </Drawer>
      )}
    </div>
  );
}

export default DataPage;


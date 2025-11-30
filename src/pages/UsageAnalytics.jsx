import { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  DatePicker,
  Space,
  Typography,
  Tag,
  Alert,
  Spin,
  Breadcrumb,
  Button,
  theme as antdTheme,
  Divider,
} from 'antd';
import {
  HomeOutlined,
  ReloadOutlined,
  BarChartOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useUsageMetrics, useLicenseCompliance, useTopPages, useDailyUsageSummary } from '../api/usageMetrics';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../api/organizations';
import dayjs from 'dayjs';
import ReusableChart from '../components/charts/ReusableChart';
import { 
  transformDailyMetrics, 
  transformTotalsToPieData, 
  transformTopPages,
  createChartSeries,
  formatChartDate,
} from '../utils/chartUtils';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function UsageAnalytics() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Date range state (default: last 30 days)
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  // Metric type filter
  const [metricType, setMetricType] = useState(null);

  // Organization filter (SUPER_ADMIN only)
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  // Get organizations for SUPER_ADMIN
  const { data: organizationsData } = useOrganizations({ enabled: isSuperAdmin });
  const organizations = organizationsData?.data || (Array.isArray(organizationsData) ? organizationsData : []);

  // Prepare filters
  const filters = useMemo(() => {
    // For SUPER_ADMIN: use selectedOrgId if provided, otherwise don't filter by org
    // For regular users: use their organization_id (required)
    const orgId = isSuperAdmin 
      ? (selectedOrgId || undefined)  // SUPER_ADMIN can query all or specific org
      : currentUser?.organization_id;  // Regular users must have org_id
    
    // Only include organizationId in filters if it exists
    const filterObj = {
      metricType: metricType || undefined,
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD'),
    };
    
    // Only add organizationId if it exists (for SUPER_ADMIN it might be undefined to query all)
    if (orgId) {
      filterObj.organizationId = orgId;
    }
    
    return filterObj;
  }, [isSuperAdmin, selectedOrgId, currentUser?.organization_id, metricType, dateRange]);

  // Fetch data
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useUsageMetrics(filters);
  const { data: complianceData, isLoading: complianceLoading } = useLicenseCompliance(filters);
  const { data: topPagesData, isLoading: topPagesLoading } = useTopPages({ ...filters, limit: 10 });
  const { data: summaryData, isLoading: summaryLoading } = useDailyUsageSummary(filters);

  // Extract data from response
  // API functions extract data from {success, message, data} response
  // So metricsData should already be the array, but handle both cases
  const metrics = Array.isArray(metricsData) ? metricsData : (metricsData?.data || []);
  const compliance = complianceData?.data || (complianceData && typeof complianceData === 'object' && !Array.isArray(complianceData) ? complianceData : {});
  const topPages = Array.isArray(topPagesData) ? topPagesData : (topPagesData?.data || []);
  const summary = summaryData?.data || (summaryData && typeof summaryData === 'object' && !Array.isArray(summaryData) ? summaryData : {});

  // Calculate totals from metrics
  const totals = useMemo(() => {
    const result = {
      queries: 0,
      exports: 0,
      pageViews: 0,
      logins: 0,
    };

    if (Array.isArray(metrics) && metrics.length > 0) {
      metrics.forEach((metric) => {
        const type = metric.metric_type;
        const count = metric.total_count || 0;
        if (type === 'query') result.queries += count;
        else if (type === 'export') result.exports += count;
        else if (type === 'page_view') result.pageViews += count;
        else if (type === 'login') result.logins += count;
      });
    }

    return result;
  }, [metrics]);

  // Prepare chart data using utility functions (DRY)
  const chartData = useMemo(() => {
    return transformDailyMetrics(summary?.daily_metrics || []);
  }, [summary]);

  const pieChartData = useMemo(() => {
    return transformTotalsToPieData(totals, {
      queries: token.colorPrimary,
      exports: token.colorSuccess,
      pageViews: token.colorInfo,
      logins: token.colorWarning,
    });
  }, [totals, token]);

  const topPagesChartData = useMemo(() => {
    return transformTopPages(topPages, 10);
  }, [topPages]);

  // Chart color theme (DRY: centralized color configuration)
  const chartColors = useMemo(() => ({
    query: token.colorPrimary,
    export: token.colorSuccess,
    pageView: token.colorInfo,
    login: token.colorWarning,
    views: token.colorPrimary,
    users: token.colorInfo,
  }), [token]);

  // Top pages table columns
  const topPagesColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (_, __, index) => (
        <Tag color={index < 3 ? 'gold' : 'default'}>{index + 1}</Tag>
      ),
    },
    {
      title: 'Page Key',
      dataIndex: 'page_key',
      key: 'page_key',
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: 'Total Views',
      dataIndex: 'total_count',
      key: 'total_count',
      sorter: (a, b) => a.total_count - b.total_count,
      render: (count) => count?.toLocaleString() || 0,
    },
    {
      title: 'Unique Users',
      dataIndex: 'unique_users',
      key: 'unique_users',
      render: (count) => count?.toLocaleString() || 0,
    },
    {
      title: 'Avg Execution Time',
      dataIndex: 'avg_execution_time_ms',
      key: 'avg_execution_time_ms',
      render: (ms) => ms ? `${(ms / 1000).toFixed(2)}s` : 'N/A',
    },
  ];

  const isLoading = metricsLoading || complianceLoading || topPagesLoading || summaryLoading;

  return (
    <div style={{ padding: token.paddingLG }}>
      <Breadcrumb
        style={{ marginBottom: token.marginMD }}
        items={[
          {
            title: (
              <Space>
                <HomeOutlined />
                <span>Home</span>
              </Space>
            ),
          },
          {
            title: (
              <Space>
                <BarChartOutlined />
                <span>Usage Analytics</span>
              </Space>
            ),
          },
        ]}
      />

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Usage Analytics
            </Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                refetchMetrics();
              }}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <Card size="small">
            <Space wrap>
              <Space>
                <Text strong>Date Range:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates || [dayjs().subtract(30, 'day'), dayjs()])}
                  format="YYYY-MM-DD"
                />
              </Space>

              <Space>
                <Text strong>Metric Type:</Text>
                <Select
                  style={{ width: 150 }}
                  value={metricType}
                  onChange={setMetricType}
                  allowClear
                  placeholder="All Types"
                >
                  <Option value="query">Queries</Option>
                  <Option value="export">Exports</Option>
                  <Option value="page_view">Page Views</Option>
                  <Option value="login">Logins</Option>
                </Select>
              </Space>

              {isSuperAdmin && (
                <Space>
                  <Text strong>Organization:</Text>
                  <Select
                    style={{ width: 200 }}
                    value={selectedOrgId}
                    onChange={setSelectedOrgId}
                    allowClear
                    placeholder="All Organizations"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {organizations.map((org) => (
                      <Option key={org.id} value={org.id} label={org.name}>
                        {org.name}
                      </Option>
                    ))}
                  </Select>
                </Space>
              )}
            </Space>
          </Card>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: token.paddingXXL }}>
              <Spin size="large" />
              <div style={{ marginTop: token.marginMD }}>
                <Text type="secondary">Loading analytics data...</Text>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Statistics */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Total Queries"
                      value={totals.queries}
                      prefix={<DatabaseOutlined />}
                      valueStyle={{ color: token.colorPrimary }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Total Exports"
                      value={totals.exports}
                      prefix={<DownloadOutlined />}
                      valueStyle={{ color: token.colorSuccess }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="Page Views"
                      value={totals.pageViews}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: token.colorInfo }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="User Logins"
                      value={totals.logins}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: token.colorWarning }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Charts Section */}
              <Row gutter={[16, 16]}>
                {/* Daily Usage Trends - Area Chart */}
                <Col xs={24} lg={16}>
                  <ReusableChart
                    type="area"
                    title="Daily Usage Trends"
                    data={chartData}
                    series={createChartSeries([
                      { dataKey: 'query', name: 'Queries' },
                      { dataKey: 'export', name: 'Exports' },
                      { dataKey: 'page_view', name: 'Page Views' },
                      { dataKey: 'login', name: 'Logins' },
                    ], chartColors)}
                    config={{
                      categoryKey: 'date',
                      xAxisFormatter: (date) => formatChartDate(date),
                      labelFormatter: (date) => formatChartDate(date, 'YYYY-MM-DD'),
                      stackId: '1',
                    }}
                    colors={chartColors}
                  />
                </Col>

                {/* Metric Distribution - Pie Chart */}
                <Col xs={24} lg={8}>
                  <ReusableChart
                    type="pie"
                    title="Metric Distribution"
                    data={pieChartData}
                    series={[{ dataKey: 'value' }]}
                    config={{
                      outerRadius: 80,
                      showLabel: true,
                    }}
                    colors={chartColors}
                  />
                </Col>

                {/* Top Pages - Horizontal Bar Chart */}
                {topPagesChartData.length > 0 && (
                  <Col xs={24}>
                    <ReusableChart
                      type="horizontalBar"
                      title="Top Pages Usage"
                      data={topPagesChartData}
                      series={createChartSeries([
                        { dataKey: 'views', name: 'Total Views' },
                        { dataKey: 'users', name: 'Unique Users' },
                      ], chartColors)}
                      config={{
                        categoryKey: 'name',
                        yAxisWidth: 150,
                      }}
                      colors={chartColors}
                    />
                  </Col>
                )}
              </Row>

              {/* License Compliance */}
              {compliance && Object.keys(compliance).length > 0 && (
                <Card title="License Compliance" size="small">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Statistic
                        title="Total Users"
                        value={compliance.total_users || 0}
                        suffix={`/ ${compliance.max_users || '∞'}`}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Statistic
                        title="Total Tenants"
                        value={compliance.total_tenants || 0}
                        suffix={`/ ${compliance.max_tenants || '∞'}`}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Statistic
                        title="License Status"
                        value={compliance.license_status || 'N/A'}
                        valueStyle={{
                          color:
                            compliance.license_status === 'ACTIVE'
                              ? token.colorSuccess
                              : compliance.license_status === 'EXPIRED'
                              ? token.colorError
                              : token.colorTextSecondary,
                        }}
                      />
                    </Col>
                  </Row>
                  {compliance.license_status === 'EXPIRED' && (
                    <Alert
                      message="License Expired"
                      description={`License expired on ${compliance.expires_at || 'N/A'}`}
                      type="warning"
                      showIcon
                      style={{ marginTop: token.marginMD }}
                    />
                  )}
                </Card>
              )}

              {/* Top Pages */}
              <Card title="Top Pages by Usage" size="small">
                {topPages.length > 0 ? (
                  <Table
                    columns={topPagesColumns}
                    dataSource={topPages.map((page, index) => ({
                      ...page,
                      key: page.page_key || index,
                      rank: index + 1,
                    }))}
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Alert
                    message="No data available"
                    description="No page usage data found for the selected period."
                    type="info"
                    showIcon
                  />
                )}
              </Card>

              {/* Daily Summary */}
              {summary && summary.daily_metrics && summary.daily_metrics.length > 0 && (
                <Card title="Daily Summary" size="small">
                  <Table
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'event_date',
                        key: 'event_date',
                        render: (date) => dayjs(date).format('YYYY-MM-DD'),
                      },
                      {
                        title: 'Metric Type',
                        dataIndex: 'metric_type',
                        key: 'metric_type',
                        render: (type) => (
                          <Tag color={
                            type === 'query' ? 'blue' :
                            type === 'export' ? 'green' :
                            type === 'page_view' ? 'cyan' :
                            'orange'
                          }>
                            {type}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Total Count',
                        dataIndex: 'total_count',
                        key: 'total_count',
                        render: (count) => count?.toLocaleString() || 0,
                      },
                      {
                        title: 'Unique Users',
                        dataIndex: 'unique_users',
                        key: 'unique_users',
                        render: (count) => count?.toLocaleString() || 0,
                      },
                    ]}
                    dataSource={summary.daily_metrics.map((metric, index) => ({
                      ...metric,
                      key: `${metric.event_date}-${metric.metric_type}-${index}`,
                    }))}
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </Card>
              )}

              {/* No Data Message */}
              {metrics.length === 0 && !isLoading && (
                <Alert
                  message="No Data Available"
                  description="No usage metrics found for the selected filters. Try adjusting the date range or filters."
                  type="info"
                  showIcon
                />
              )}
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}


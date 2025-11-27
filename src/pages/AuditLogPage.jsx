import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Typography,
  Tag,
  Select,
  Input,
  DatePicker,
  Button,
  Drawer,
  Descriptions,
  Badge,
  Tooltip,
  message,
  theme as antdTheme,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useAuditLogs, useAuditLog } from '../api/auditLogs';
import { useAuth } from '../contexts/AuthContext';
import { decryptSql } from '../utils/sqlDecrypt';
import dayjs from 'dayjs';

const formatDate = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const formatDateWithMs = (date) => {
  if (!date) return 'N/A';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss.SSS');
};

const { Title, Text } = Typography;
const { Option } = Select;

export default function AuditLogPage() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const canDecryptSql = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 50,
  });
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [decryptedSql, setDecryptedSql] = useState(null);

  const { data: logsData, isLoading, refetch } = useAuditLogs(filters);
  const { data: logDetail } = useAuditLog(selectedLogId, {
    enabled: Boolean(selectedLogId),
  });

  // Decrypt SQL when logDetail changes
  useEffect(() => {
    if (logDetail?.encrypted_sql && canDecryptSql) {
      if (import.meta.env.DEV) {
        console.log('Attempting to decrypt SQL:', {
          hasEncryptedSql: !!logDetail.encrypted_sql,
          encryptedSqlLength: logDetail.encrypted_sql?.length,
          encryptedSqlPreview: logDetail.encrypted_sql?.substring(0, 50),
          hasKey: !!(import.meta.env.VITE_LOG_ENCRYPTION_KEY)
        });
      }
      const decrypted = decryptSql(logDetail.encrypted_sql);
      if (import.meta.env.DEV) {
        console.log('Decryption result:', {
          success: !!decrypted,
          decryptedLength: decrypted?.length
        });
      }
      setDecryptedSql(decrypted);
    } else {
      setDecryptedSql(null);
    }
  }, [logDetail?.encrypted_sql, canDecryptSql]);

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const currentPage = logsData?.page || 1;
  const pageSize = logsData?.pageSize || 50;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleViewDetails = (logId) => {
    setSelectedLogId(logId);
    setIsDrawerOpen(true);
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const start = dates[0].startOf('day');
      const end = dates[1].endOf('day');
      setFilters((prev) => ({
        ...prev,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        page: 1,
      }));
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev, page: 1 };
        delete newFilters.startDate;
        delete newFilters.endDate;
        return newFilters;
      });
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      normal: 'default',
      warning: 'warning',
      error: 'error',
    };
    return colors[severity] || 'default';
  };

  const getSuccessTag = (success) => {
    return success ? (
      <Tag color="success" icon={<span>✓</span>}>
        Success
      </Tag>
    ) : (
      <Tag color="error" icon={<span>✗</span>}>
        Failed
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 180,
      render: (date) => formatDate(date),
      sorter: false,
    },
    {
      title: 'Page Key',
      dataIndex: 'page_key',
      key: 'page_key',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Text code>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action_type',
      key: 'action_type',
      width: 120,
      render: (text) => <Tag>{text || 'N/A'}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      width: 100,
      render: (success) => getSuccessTag(success),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => (
        <Badge status={getSeverityColor(severity)} text={severity || 'normal'} />
      ),
    },
    {
      title: 'Execution Time',
      dataIndex: 'execution_time_ms',
      key: 'execution_time_ms',
      width: 130,
      render: (ms) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
      },
    },
    {
      title: 'Rows',
      dataIndex: 'rows_returned',
      key: 'rows_returned',
      width: 80,
      render: (rows) => rows ?? 'N/A',
    },
    {
      title: 'Tenant',
      dataIndex: 'tenant_id',
      key: 'tenant_id',
      width: 120,
      ellipsis: true,
      render: (text) => text || 'N/A',
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
      render: (text) => text || 'N/A',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (text) => text || 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Audit Logs</Title>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <Card size="small" title={<><FilterOutlined /> Filters</>}>
            <Space wrap>
              <Input
                placeholder="Search page key or error message"
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                allowClear
              />

              <Select
                placeholder="Severity"
                style={{ width: 120 }}
                value={filters.severity}
                onChange={(value) => handleFilterChange('severity', value || undefined)}
                allowClear
              >
                <Option value="normal">Normal</Option>
                <Option value="warning">Warning</Option>
                <Option value="error">Error</Option>
              </Select>

              <Select
                placeholder="Status"
                style={{ width: 120 }}
                value={filters.success}
                onChange={(value) => handleFilterChange('success', value)}
                allowClear
              >
                <Option value={true}>Success</Option>
                <Option value={false}>Failed</Option>
              </Select>

              <Select
                placeholder="Action Type"
                style={{ width: 150 }}
                value={filters.actionType}
                onChange={(value) => handleFilterChange('actionType', value || undefined)}
                allowClear
              >
                <Option value="data_query">Data Query</Option>
                <Option value="page_data_download">Data Download</Option>
                <Option value="metadata_query">Metadata Query</Option>
              </Select>

              <Input
                placeholder="Page Key"
                style={{ width: 150 }}
                value={filters.pageKey}
                onChange={(e) => handleFilterChange('pageKey', e.target.value || undefined)}
                allowClear
              />

              <Input
                placeholder="Tenant ID"
                style={{ width: 150 }}
                value={filters.tenantId}
                onChange={(e) => handleFilterChange('tenantId', e.target.value || undefined)}
                allowClear
              />

              <DatePicker.RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={handleDateRangeChange}
                placeholder={['Start Date', 'End Date']}
              />
            </Space>
          </Card>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} logs`,
              pageSizeOptions: ['20', '50', '100', '200'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1500 }}
            size="small"
          />
        </Space>
      </Card>

      {/* Details Drawer */}
      <Drawer
        title="Audit Log Details"
        placement="right"
        width={700}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLogId(null);
        }}
      >
        {logDetail && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">
              <Text code>{logDetail.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              {formatDateWithMs(logDetail.createdOn)}
            </Descriptions.Item>
            <Descriptions.Item label="Page Key">
              <Text code>{logDetail.page_key}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Action Type">
              <Tag>{logDetail.action_type || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getSuccessTag(logDetail.success)}
            </Descriptions.Item>
            <Descriptions.Item label="Severity">
              <Badge status={getSeverityColor(logDetail.severity)} text={logDetail.severity || 'normal'} />
            </Descriptions.Item>
            <Descriptions.Item label="Execution Time">
              {logDetail.execution_time_ms
                ? `${logDetail.execution_time_ms}ms (${(logDetail.execution_time_ms / 1000).toFixed(2)}s)`
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Rows Returned">
              {logDetail.rows_returned ?? 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tenant ID">
              {logDetail.tenant_id || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              {logDetail.user_id || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              {logDetail.ip_address || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Source Type">
              {logDetail.source_type || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Data Source">
              {logDetail.data_source || 'N/A'}
            </Descriptions.Item>
            {logDetail.error_code && (
              <Descriptions.Item label="Error Code">
                <Tag color="error">{logDetail.error_code}</Tag>
              </Descriptions.Item>
            )}
            {logDetail.error_message && (
              <Descriptions.Item label="Error Message">
                <Text type="danger" style={{ whiteSpace: 'pre-wrap' }}>
                  {logDetail.error_message}
                </Text>
              </Descriptions.Item>
            )}
            {logDetail.query_params && (
              <Descriptions.Item label="Query Parameters">
                <pre style={{ 
                  background: token.colorFillTertiary || token.colorBgContainer, 
                  padding: token.paddingXS, 
                  borderRadius: token.borderRadius, 
                  overflow: 'auto' 
                }}>
                  {JSON.stringify(JSON.parse(logDetail.query_params), null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {logDetail.query_context && (
              <Descriptions.Item label="Query Context">
                <pre style={{ 
                  background: token.colorFillTertiary || token.colorBgContainer, 
                  padding: token.paddingXS, 
                  borderRadius: token.borderRadius, 
                  overflow: 'auto' 
                }}>
                  {JSON.stringify(JSON.parse(logDetail.query_context), null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {canDecryptSql && logDetail?.encrypted_sql && (
              <Descriptions.Item label="SQL Query">
                {decryptedSql ? (
                  <pre style={{ 
                    background: token.colorFillTertiary || token.colorBgContainer, 
                    padding: token.paddingXS, 
                    borderRadius: token.borderRadius, 
                    overflow: 'auto', 
                    maxHeight: '400px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {decryptedSql}
                  </pre>
                ) : (
                  <Text type="warning">
                    Failed to decrypt SQL. Please check encryption key configuration.
                  </Text>
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


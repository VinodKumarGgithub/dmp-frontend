import { useMemo } from 'react';
import { Table, Card, Skeleton, Typography, Tooltip } from 'antd';
import { FileTextOutlined, MoreOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const { Title } = Typography;

export default function DataTable({
  config,
  data,
  total,
  loading,
  pagination,
  sorting,
  onTableChange,
  onMoreClick,
  token,
  hasMore = false,
  hasHiddenColumns = false,
}) {
  // Build table columns from config or data
  const tableColumns = useMemo(() => {
    // If columns are specified in config, use them
    if (config?.columns && Array.isArray(config.columns) && config.columns.length > 0) {
      const columns = config.columns.map((col) => ({
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

      // Only add "More" column if there are hidden columns
      if (hasHiddenColumns) {
        columns.push({
          title: 'More',
          key: 'more',
          width: 100,
          fixed: 'right',
          render: (_, record) => {
            return (
              <Button
                type="link"
                icon={<MoreOutlined />}
                size="small"
                onClick={() => onMoreClick(record)}
                style={{ color: token.colorPrimary }}
              >
                {/* View More */}
              </Button>
            );
          },
        });
      }

      return columns;
    }

    // If columns are not specified, generate from data (SELECT *)
    if (Array.isArray(data) && data.length > 0) {
      // Get all unique keys from the first record
      const firstRecord = data[0];
      const allKeys = Object.keys(firstRecord);
      const maxVisibleColumns = 5;
      const visibleKeys = allKeys.slice(0, maxVisibleColumns);
      const hiddenKeys = allKeys.slice(maxVisibleColumns);

      // Build visible columns
      const columns = visibleKeys.map((key) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        dataIndex: key,
        key: key,
        sorter: true,
        render: (value) => {
          if (value === null || value === undefined) return '-';
          // Try to detect date format
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            try {
              return new Date(value).toLocaleDateString();
            } catch {
              return String(value);
            }
          }
          return String(value);
        },
      }));

      // Add "More" column if there are hidden columns
      if (hiddenKeys.length > 0) {
        columns.push({
          title: 'More',
          key: 'more',
          width: 100,
          fixed: 'right',
          render: (_, record) => {
            return (
              <Button
                type="link"
                icon={<MoreOutlined />}
                size="small"
                onClick={() => onMoreClick(record)}
                style={{ color: token.colorPrimary }}
              >
                {/* View More */}
              </Button>
            );
          },
        });
      }

      return columns;
    }

    return [];
  }, [config, data, token, onMoreClick, hasHiddenColumns]);

  // Generate unique row key from record data - MUST be before any early returns
  const getRowKey = useMemo(() => {
    return (record) => {
      // Try to find a unique identifier in the record
      if (record.id) return String(record.id);
      
      // If columns are specified, use them
      if (config?.columns && Array.isArray(config.columns) && config.columns.length > 0) {
        // Try first column value
        const firstColumn = config.columns[0]?.name;
        if (firstColumn && record[firstColumn] !== undefined && record[firstColumn] !== null) {
          return String(record[firstColumn]);
        }
        
        // Generate key from multiple column values as fallback
        const keyParts = config.columns
          .slice(0, 3)
          .map(col => record[col.name])
          .filter(val => val !== undefined && val !== null)
          .map(val => String(val));
        
        if (keyParts.length > 0) {
          return keyParts.join('_');
        }
      } else {
        // If columns are not specified, use first few keys from record
        const keys = Object.keys(record);
        if (keys.length > 0) {
          const keyParts = keys
            .slice(0, 3)
            .map(key => record[key])
            .filter(val => val !== undefined && val !== null)
            .map(val => String(val));
          
          if (keyParts.length > 0) {
            return keyParts.join('_');
          }
        }
      }
      
      // Last resort: use a hash of the record
      return JSON.stringify(record);
    };
  }, [config]);

  // Show skeleton loader when loading
  if (loading) {
    return (
      <Card>
        <Skeleton
          active
          title={false}
          paragraph={{
            rows: 10,
            width: ['100%', '100%', '100%', '100%', '100%', '100%', '100%', '100%', '100%', '100%'],
          }}
          avatar={false}
        />
      </Card>
    );
  }

  // Show empty state
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: token.paddingXXL }}>
        <FileTextOutlined
          style={{ fontSize: 48, color: token.colorTextSecondary, marginBottom: token.marginMD }}
        />
        <Title level={4} type="secondary">
          No Data Available
        </Title>
        <p style={{ color: token.colorTextSecondary }}>
          There are no records to display for this page. Try adjusting your filters or search criteria.
        </p>
      </Card>
    );
  }

  // Show table with data
  return (
    <Table
      columns={tableColumns}
      dataSource={data}
      rowKey={getRowKey}
      loading={false}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (tot, range) => {
          const isProcedure = config?.source_type === 'PROCEDURE';
          const baseText = `Showing ${range[0]}-${range[1]} of `;
          if (!isProcedure) {
            return `${baseText}${tot} items`;
          }
          return (
            <span>
              {baseText}
              {hasMore ? 'many+' : `${tot} items`}
              <Tooltip title="Stored procedures return streaming results, so we estimate totals using hasMore pagination.">
                <InfoCircleOutlined style={{ marginLeft: 6, color: token.colorTextSecondary }} />
              </Tooltip>
            </span>
          );
        },
        pageSizeOptions: (() => {
          // Include config's default page size in options if not already present
          const defaultOptions = ['10', '20', '50', '100'];
          const defaultPageSize = config?.page_size_default;
          if (defaultPageSize && !defaultOptions.includes(String(defaultPageSize))) {
            const options = [...defaultOptions, String(defaultPageSize)];
            return options.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
          }
          return defaultOptions;
        })(),
      }}
      onChange={onTableChange}
      scroll={{ x: 'max-content' }}
    />
  );
}


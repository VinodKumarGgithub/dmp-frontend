import { useMemo, useState } from 'react';
import { Table, Card, Skeleton, Typography, Tooltip, Button } from 'antd';
import { FileTextOutlined, InfoCircleOutlined, MoreOutlined } from '@ant-design/icons';

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
  onColumnReorder,
  token,
  hasMore = false,
  hasHiddenColumns = false,
}) {
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);
  // Handle column drag in table
  const handleColumnDragStart = (index) => {
    setDraggedColumnIndex(index);
  };

  const handleColumnDragOver = (e, index) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === index || !onColumnReorder) return;
    
    // Call parent handler to reorder columns
    onColumnReorder(draggedColumnIndex, index);
    setDraggedColumnIndex(index);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumnIndex(null);
  };

  // Build table columns from config or data
  const tableColumns = useMemo(() => {
    const maxVisibleColumns = 5;
    
    // If columns are specified in config, use them
    if (config?.columns && Array.isArray(config.columns) && config.columns.length > 0) {
      // Use visible columns from config
      const columns = config.columns.map((col, index) => {
        const isMoreColumn = col.name === 'more' || col.key === 'more';
        
        // Create draggable title component
        const titleContent = onColumnReorder && !isMoreColumn ? (
          <div
            draggable
            onDragStart={() => handleColumnDragStart(index)}
            onDragOver={(e) => handleColumnDragOver(e, index)}
            onDragEnd={handleColumnDragEnd}
            style={{
              cursor: 'move',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              userSelect: 'none',
              opacity: draggedColumnIndex === index ? 0.5 : 1,
            }}
          >
            <span
              style={{
                fontSize: '14px',
                color: token.colorTextSecondary,
                cursor: 'grab',
              }}
              title="Drag to reorder"
            >
              ⋮⋮
            </span>
            <span>{col.label || col.name}</span>
          </div>
        ) : (
          <span>{col.label || col.name}</span>
        );
        
        return {
          title: titleContent,
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
        };
      });

      // Add "More" column if there are hidden columns
      if (hasHiddenColumns && onMoreClick) {
        columns.push({
          title: 'More',
          key: 'more',
          width: 80,
          fixed: 'right',
          render: (_, record) => {
            return (
              <Button
                type="link"
                icon={<MoreOutlined />}
                size="small"
                onClick={() => onMoreClick(record)}
                style={{ color: token.colorPrimary }}
                title="View more details"
              />
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
      const visibleKeys = allKeys.slice(0, maxVisibleColumns);
      const hiddenKeys = allKeys.slice(maxVisibleColumns);

      // Build columns from all keys (show all columns)
      const columns = allKeys.map((key) => ({
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

      return columns;
    }

    return [];
  }, [config, data, token, onMoreClick, hasHiddenColumns, onColumnReorder, draggedColumnIndex]);

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


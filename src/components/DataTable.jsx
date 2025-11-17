import { useMemo } from 'react';
import { Table, Card, Skeleton, Typography, theme as antdTheme } from 'antd';
import { FileTextOutlined, MoreOutlined } from '@ant-design/icons';
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
}) {
  // Build table columns from config
  const tableColumns = useMemo(() => {
    if (!config?.columns) return [];

    const allColumns = config.columns;
    const maxVisibleColumns = 5;
    const visibleColumns = allColumns.slice(0, maxVisibleColumns);
    const hiddenColumns = allColumns.slice(maxVisibleColumns);

    // Build visible columns
    const columns = visibleColumns.map((col) => ({
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

    // Add "More" column if there are hidden columns
    if (hiddenColumns.length > 0) {
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
  }, [config, token, onMoreClick]);

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
      rowKey={(record, index) => record.id || record[config.columns[0]?.name] || index}
      loading={false}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: total,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={onTableChange}
      scroll={{ x: 'max-content' }}
    />
  );
}


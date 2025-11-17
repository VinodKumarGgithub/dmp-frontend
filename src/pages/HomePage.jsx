import { Result, Button, Spin, Typography, Card, Space, Alert, theme } from 'antd';
import { FileTextOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePages } from '../api/pages';

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const { pagesConfig: authPagesConfig } = useAuth();
  const { data: pagesData, isLoading: pagesLoading, isError, error, refetch } = usePages();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Use pages from query if available, otherwise fall back to auth context
  const pagesConfig = pagesData?.data || (Array.isArray(pagesData) ? pagesData : authPagesConfig || []);

  // Show loading state
  if (pagesLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spin size="large" tip="Loading pages configuration..." />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div style={{ padding: token.paddingLG, maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Result
            status="error"
            icon={<ExclamationCircleOutlined style={{ color: token.colorError }} />}
            title="Error Loading Pages Configuration"
            subTitle={
              <Space direction="vertical" size="small" style={{ textAlign: 'left', marginTop: token.marginMD }}>
                <Alert
                  message={error?.message || 'Failed to load pages configuration'}
                  type="error"
                  showIcon
                  style={{ marginTop: token.marginMD }}
                />
                <Paragraph>
                  <Text type="secondary">
                    Please check your connection and try again. If the problem persists, contact your administrator.
                  </Text>
                </Paragraph>
              </Space>
            }
            extra={[
              <Button key="retry" type="primary" icon={<ReloadOutlined />} onClick={() => refetch()}>
                Retry
              </Button>,
              <Button key="refresh" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Refresh Page
              </Button>,
            ]}
          />
        </Card>
      </div>
    );
  }

  // Check if pages config is empty
  const hasPages = Array.isArray(pagesConfig) && pagesConfig.length > 0;
  const isEmpty = !hasPages;

  if (isEmpty) {
    return (
      <div style={{ padding: token.paddingLG, maxWidth: 800, margin: '0 auto' }}>
        <Card>
          <Result
            icon={<FileTextOutlined style={{ color: token.colorWarning }} />}
            title="No Pages Configured"
            subTitle={
              <Space direction="vertical" size="small" style={{ textAlign: 'left', marginTop: token.marginMD }}>
                <Paragraph>
                  <Text type="secondary">
                    There are no pages configured in the system yet. Please contact your administrator to set up pages.
                  </Text>
                </Paragraph>
                <Paragraph>
                  <Text type="secondary">
                    Pages need to be configured in the master database before they can be accessed.
                  </Text>
                </Paragraph>
              </Space>
            }
            extra={
              <Button type="primary" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Refresh
              </Button>
            }
          />
        </Card>

        <Card style={{ marginTop: token.marginLG }}>
          <Title level={4}>What are Pages?</Title>
          <Paragraph>Pages are configurable data views that allow you to:</Paragraph>
          <ul>
            <li>View data from tenant databases in a table format</li>
            <li>Search and filter data based on configured fields</li>
            <li>Download data as CSV or Excel files</li>
            <li>Access different data sources dynamically</li>
          </ul>
          <Paragraph type="secondary" style={{ marginTop: token.marginMD }}>
            Each page is configured with:
          </Paragraph>
          <ul>
            <li>Data source (table or view name)</li>
            <li>Columns to display</li>
            <li>Searchable and filterable fields</li>
            <li>Download permissions</li>
          </ul>
        </Card>
      </div>
    );
  }

  // If pages exist, show them
  return (
    <div style={{ padding: token.paddingLG }}>
      <Card>
        <Title level={2}>Welcome to Clinical Frontend</Title>
        <Paragraph>
          You have <Text strong>{pagesConfig.length}</Text> page{pagesConfig.length !== 1 ? 's' : ''} configured.
        </Paragraph>

        <div style={{ marginTop: token.marginLG }}>
          <Title level={4}>Available Pages</Title>
          <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: token.marginMD }}>
            {pagesConfig.map((page) => (
              <Card
                key={page.page_key}
                hoverable
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/pages/${page.page_key}`)}
              >
                <Space>
                  <FileTextOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {page.title || page.page_key}
                    </Title>
                    <Text type="secondary">
                      Key: {page.page_key}
                      {page.is_download_allowed && (
                        <span style={{ marginLeft: token.marginXS, color: token.colorSuccess }}>
                          • Download enabled
                        </span>
                      )}
                    </Text>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </div>
      </Card>
    </div>
  );
}

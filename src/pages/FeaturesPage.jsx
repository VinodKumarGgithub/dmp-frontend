import { Card, Typography, Row, Col, Space, Divider, theme } from 'antd';
import {
  DatabaseOutlined,
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;

const features = [
  {
    icon: <DatabaseOutlined style={{ fontSize: 48 }} />,
    title: 'Multi-Tenant Architecture',
    description: 'Seamlessly switch between tenant databases with zero downtime. Each tenant has isolated data and can be customized independently.',
    benefits: [
      'Instant tenant switching without configuration duplication',
      'Perfect for SaaS products managing multiple clients',
      'Isolated data per tenant with independent customization',
      'No code changes required when adding new tenants',
    ],
    color: '#1890ff',
  },
  {
    icon: <SettingOutlined style={{ fontSize: 48 }} />,
    title: 'No-Code Page Builder',
    description: 'Create powerful data pages, dashboards, and reports without writing a single line of code. Admins configure everything through the UI.',
    benefits: [
      'Eliminates 80-90% of developer dependency',
      'Configure tables, columns, filters, and permissions in minutes',
      'Pages go live instantly - no deployments needed',
      'Metadata-driven architecture auto-detects database changes',
    ],
    color: '#722ed1',
  },
  {
    icon: <UserOutlined style={{ fontSize: 48 }} />,
    title: 'User-Level Customization',
    description: 'Each user can personalize their data views with column customization, filtering, and saved layouts that persist across sessions.',
    benefits: [
      'Show/hide and reorder columns per user',
      'Save custom layouts automatically',
      'Preferences persist across sessions',
      'No IT intervention required',
    ],
    color: '#52c41a',
  },
  {
    icon: <FileTextOutlined style={{ fontSize: 48 }} />,
    title: 'Flexible Data Export',
    description: 'Download data in Excel or CSV format with configurable limits. Admins control download permissions per page or tenant.',
    benefits: [
      'Export to Excel or CSV formats',
      'Configurable download limits',
      'Permission-based access control',
      'No more waiting for IT to generate reports',
    ],
    color: '#fa8c16',
  },
  {
    icon: <BarChartOutlined style={{ fontSize: 48 }} />,
    title: 'Dynamic Dashboards',
    description: 'Create interactive dashboards that automatically reflect your database structure. When you add columns, they appear in the UI instantly.',
    benefits: [
      'Auto-detects all database metadata',
      'Tables, columns, types, and relations discovered automatically',
      'Real-time updates when database structure changes',
      'No code deployments for schema changes',
    ],
    color: '#eb2f96',
  },
  {
    icon: <SafetyOutlined style={{ fontSize: 48 }} />,
    title: 'Role-Based Access Control',
    description: 'Comprehensive RBAC system with fine-grained permissions. Control access at organization, tenant, and page levels.',
    benefits: [
      'Five role levels: SUPER_ADMIN, ADMIN, MANAGER, USER, DEVELOPER',
      'Organization-level isolation',
      'Tenant and page-level permissions',
      'Audit logging for all actions',
    ],
    color: '#f5222d',
  },
  {
    icon: <ThunderboltOutlined style={{ fontSize: 48 }} />,
    title: 'Zero Deployment Workflow',
    description: 'Make changes and see them live immediately. No code deployments, no waiting, no IT bottlenecks.',
    benefits: [
      'Configuration changes go live instantly',
      'No deployment pipeline required',
      'Business users can make changes independently',
      'Reduced IT overhead and faster time-to-market',
    ],
    color: '#faad14',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 48 }} />,
    title: 'Organization Management',
    description: 'Manage multiple organizations from a single platform. Each organization can have its own branding, users, and tenant databases.',
    benefits: [
      'Multi-organization support',
      'Independent branding per organization',
      'Isolated user and tenant management',
      'Scalable architecture for enterprise clients',
    ],
    color: '#13c2c2',
  },
];

export default function FeaturesPage() {
  const { token } = theme.useToken();
  const { isDark } = useTheme();

  const glassmorphismStyle = {
    background: isDark
      ? 'rgba(30, 30, 30, 0.85)'
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: isDark
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
  };

  return (
    <div
      style={{
        padding: token.paddingLG,
        maxWidth: 1400,
        margin: '0 auto',
        minHeight: 'calc(100vh - 64px)',
        background: isDark
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: token.marginXL }}>
          <Title
            level={1}
            style={{
              marginBottom: token.marginMD,
              color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
            }}
          >
            Core Features
          </Title>
          <Paragraph
            style={{
              fontSize: 18,
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
              maxWidth: 800,
              margin: '0 auto',
            }}
          >
            Our platform eliminates 80-90% of developer dependency, empowering business users to create powerful data pages,
            dashboards, and reports without writing a single line of code.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={24} md={12} lg={12} key={index}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: 16,
                  ...glassmorphismStyle,
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: token.paddingLG }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 12px 40px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : '0 12px 40px 0 rgba(31, 38, 135, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = glassmorphismStyle.boxShadow;
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center', color: feature.color }}>
                    {feature.icon}
                  </div>
                  <Title
                    level={3}
                    style={{
                      textAlign: 'center',
                      marginBottom: token.marginSM,
                      color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {feature.title}
                  </Title>
                  <Paragraph
                    style={{
                      textAlign: 'center',
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: 15,
                    }}
                  >
                    {feature.description}
                  </Paragraph>
                  <Divider
                    style={{
                      margin: `${token.marginSM}px 0`,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        display: 'block',
                        marginBottom: token.marginXS,
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
                      }}
                    >
                      Key Benefits:
                    </Text>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 20,
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} style={{ marginBottom: token.marginXS }}>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          style={{
            marginTop: token.marginXL,
            borderRadius: 16,
            background: isDark
              ? 'rgba(24, 144, 255, 0.15)'
              : 'rgba(24, 144, 255, 0.1)',
            border: isDark
              ? '1px solid rgba(24, 144, 255, 0.3)'
              : '1px solid rgba(24, 144, 255, 0.2)',
            ...glassmorphismStyle,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
            <Title
              level={2}
              style={{
                color: token.colorPrimary,
                marginBottom: token.marginMD,
              }}
            >
              Why Choose Our Platform?
            </Title>
            <Row gutter={[32, 16]}>
              <Col xs={24} md={8}>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 48,
                      color: token.colorPrimary,
                      display: 'block',
                    }}
                  >
                    80-90%
                  </Text>
                  <Paragraph
                    style={{
                      marginTop: token.marginXS,
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    Reduction in developer dependency
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 48,
                      color: token.colorPrimary,
                      display: 'block',
                    }}
                  >
                    Zero
                  </Text>
                  <Paragraph
                    style={{
                      marginTop: token.marginXS,
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    Code deployments required for page creation
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 48,
                      color: token.colorPrimary,
                      display: 'block',
                    }}
                  >
                    Instant
                  </Text>
                  <Paragraph
                    style={{
                      marginTop: token.marginXS,
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    Pages go live immediately after configuration
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </Space>
        </Card>
      </Space>
    </div>
  );
}


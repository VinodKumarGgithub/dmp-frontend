import { useState, useEffect } from 'react';
import { theme as antdTheme, Typography, Row, Col } from 'antd';
import {
  SafetyOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  SearchOutlined,
  SendOutlined,
  StopOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import SectionHeader from './SectionHeader';
import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';

const { Text, Title } = Typography;

const securityFeatures = [
  {
    icon: <EyeInvisibleOutlined />,
    title: 'Zero Data Storage',
    description: 'Your data never leaves your database. We only read it temporarily to display pages. Zero retention period.',
    color: '#52c41a',
  },
  {
    icon: <LockOutlined />,
    title: 'Encrypted Credentials',
    description: 'All database passwords are encrypted with AES-256-GCM. Credentials cleared from memory after use.',
    color: '#1890ff',
  },
  {
    icon: <SecurityScanOutlined />,
    title: 'Read-Only Access',
    description: 'We use read-only database connections. Only SELECT queries allowed. Your data is never modified.',
    color: '#722ed1',
  },
  {
    icon: <SafetyOutlined />,
    title: 'SSL/TLS Encryption',
    description: 'All database connections use SSL/TLS encryption. Your data is protected in transit.',
    color: '#fa8c16',
  },
  {
    icon: <CheckCircleOutlined />,
    title: 'Complete Audit Trail',
    description: 'Full audit logging without storing your data. Encrypted SQL queries, access logs, and compliance reports.',
    color: '#13c2c2',
  },
];

export default function SecuritySection() {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      id="security"
      style={{
        padding: isMobile ? token.paddingLG : token.paddingXL * 1.5,
        paddingTop: isMobile ? token.paddingXL * 1 : token.paddingXL * 2,
        paddingBottom: isMobile ? token.paddingXL * 1 : token.paddingXL * 2,
        maxWidth: token.screenLG,
        margin: '0 auto',
        background: 'transparent',
        borderRadius: token.borderRadiusLG * 2,
        border: isDark
          ? `1px solid ${hexToRgba(token.colorText, 0.1)}`
          : `1px solid ${hexToRgba(token.colorText, 0.08)}`,
      }}
    >
      <ScrollReveal direction="up" delay={0}>
        <SectionHeader
          badge="SECURITY FIRST"
          title="Your Data Stays in Your Database"
          description="We don't store your data. We don't copy it. We only read it temporarily to display pages."
          tagline="Zero data storage. Maximum security."
        />
      </ScrollReveal>

      {/* Security Promise Banner */}
      <ScrollReveal direction="up" delay={100}>
        <GlassCard
          style={{
            marginTop: token.marginXL * 1.5,
            marginBottom: token.marginXL * 2,
            padding: token.paddingXL,
            textAlign: 'center',
            background: isDark
              ? `linear-gradient(135deg, ${hexToRgba(token.colorSuccess, 0.15)}, ${hexToRgba(token.colorText, 0.03)})`
              : `linear-gradient(135deg, ${hexToRgba(token.colorSuccess, 0.08)}, ${hexToRgba(token.colorBgContainer, 0.5)})`,
            border: `2px solid ${hexToRgba(token.colorSuccess, 0.3)}`,
          }}
        >
          <Title level={3} style={{ marginBottom: token.marginMD, color: token.colorSuccess }}>
            Zero Data Storage Policy
          </Title>
          <Text
            style={{
              fontSize: token.fontSizeLG,
              lineHeight: 1.8,
              color: isDark ? token.colorTextSecondary : token.colorText,
            }}
          >
            <strong>Your data never leaves your database.</strong> We execute queries against your database,
            return results to you immediately, and discard them. We only log encrypted metadata for audit
            purposes - never your actual data.
          </Text>
        </GlassCard>
      </ScrollReveal>

      {/* Security Features Grid */}
      <Row gutter={[token.marginMD, token.marginMD]} style={{ marginTop: token.marginXL }}>
        {securityFeatures.map((feature, idx) => (
          <Col key={idx} xs={24} sm={12} lg={8}>
            <ScrollReveal direction="up" delay={200 + idx * 100}>
              <GlassCard
                hoverable
                style={{
                  height: '100%',
                  padding: token.paddingLG,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${hexToRgba(feature.color, 0.2)}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = hexToRgba(feature.color, 0.4);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = hexToRgba(feature.color, 0.2);
                }}
              >
                <div style={{ marginBottom: token.marginMD }}>
                  <GlassIcon
                    icon={feature.icon}
                    size={64}
                    iconSize={28}
                    className="icon-minimal"
                    style={{ color: feature.color }}
                  />
                </div>
                <Title
                  level={4}
                  style={{
                    marginBottom: token.marginSM,
                    color: feature.color,
                    fontSize: token.fontSizeLG,
                  }}
                >
                  {feature.title}
                </Title>
                <Text
                  style={{
                    fontSize: token.fontSize,
                    lineHeight: 1.6,
                    color: isDark ? token.colorTextSecondary : token.colorTextTertiary,
                  }}
                >
                  {feature.description}
                </Text>
              </GlassCard>
            </ScrollReveal>
          </Col>
        ))}
      </Row>

      {/* Data Flow Diagram */}
      <ScrollReveal direction="up" delay={600}>
        <GlassCard
          style={{
            marginTop: token.marginXL * 2,
            padding: token.paddingXL,
            background: isDark
              ? hexToRgba(token.colorBgContainer, 0.03)
              : hexToRgba(token.colorBgContainer, 0.5),
          }}
        >
          <Title level={4} style={{ marginBottom: token.marginLG, textAlign: 'center' }}>
            Data Flow - How We Protect Your Data
          </Title>
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: token.marginMD,
            }}
          >
            {[
              { step: '1', text: 'Query Received', icon: <InboxOutlined /> },
              { step: '2', text: 'Executed (Read-Only)', icon: <SearchOutlined /> },
              { step: '3', text: 'Results Returned', icon: <SendOutlined /> },
              { step: '4', text: 'No Storage', icon: <StopOutlined /> },
              { step: '5', text: 'Metadata Logged', icon: <FileTextOutlined /> },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: token.paddingMD,
                  background: isDark
                    ? hexToRgba(token.colorBgContainer, 0.05)
                    : hexToRgba(token.colorText, 0.02),
                  borderRadius: token.borderRadius,
                }}
              >
                <div style={{ marginBottom: token.marginXS }}>
                  <GlassIcon 
                    icon={item.icon} 
                    size={32} 
                    iconSize={16} 
                    className="icon-minimal" 
                  />
                </div>
                <Text strong style={{ display: 'block', marginBottom: token.marginXXS }}>
                  Step {item.step}
                </Text>
                <Text style={{ fontSize: token.fontSizeSM }}>{item.text}</Text>
              </div>
            ))}
          </div>
        </GlassCard>
      </ScrollReveal>
    </section>
  );
}


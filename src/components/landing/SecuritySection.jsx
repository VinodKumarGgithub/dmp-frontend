import { useState, useEffect } from 'react';
import { theme as antdTheme, Typography, Row, Col } from 'antd';
import {
  SafetyOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
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
        maxWidth: 1200,
        margin: '0 auto',
        background: isDark
          ? 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(255, 255, 255, 1) 100%)',
        borderRadius: 24,
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
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
              ? `linear-gradient(135deg, ${hexToRgba('#52c41a', 0.15)}, rgba(255, 255, 255, 0.03))`
              : `linear-gradient(135deg, ${hexToRgba('#52c41a', 0.08)}, rgba(255, 255, 255, 1))`,
            border: `2px solid ${hexToRgba('#52c41a', 0.3)}`,
          }}
        >
          <Title level={3} style={{ marginBottom: token.marginMD, color: '#52c41a' }}>
            Zero Data Storage Policy
          </Title>
          <Text
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
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
                    fontSize: '1.1rem',
                  }}
                >
                  {feature.title}
                </Title>
                <Text
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
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
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(255, 255, 255, 1)',
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
              { step: '1', text: 'Query Received', icon: '📥' },
              { step: '2', text: 'Executed (Read-Only)', icon: '🔍' },
              { step: '3', text: 'Results Returned', icon: '📤' },
              { step: '4', text: 'No Storage', icon: '❌' },
              { step: '5', text: 'Metadata Logged', icon: '📝' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: token.paddingMD,
                  background: isDark
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: token.marginXS }}>{item.icon}</div>
                <Text strong style={{ display: 'block', marginBottom: token.marginXXS }}>
                  Step {item.step}
                </Text>
                <Text style={{ fontSize: '0.85rem' }}>{item.text}</Text>
              </div>
            ))}
          </div>
        </GlassCard>
      </ScrollReveal>
    </section>
  );
}


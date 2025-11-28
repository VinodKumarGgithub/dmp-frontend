import { useState, useEffect } from 'react';
import { Button, Typography, Space, Row, Col, theme as antdTheme } from 'antd';
import { DatabaseOutlined, LoginOutlined, RocketOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';
import ScrollReveal from './ScrollReveal';

const { Title, Paragraph, Text } = Typography;

const heroFeatures = [
  {
    title: 'No Code Required',
    description: 'Create powerful data-driven pages directly from configuration, without writing a single line of code.',
    icon: <DatabaseOutlined />,
  },
  {
    title: 'Instant Deployment',
    description: 'Every page is live instantly — no deployments, no coding, no waiting for engineering teams.',
    icon: <ThunderboltOutlined />,
  },
  {
    title: 'Multi-Tenant Ready',
    description: 'Designed for multi-tenant SaaS products, enterprise applications, support teams, ops teams, and business users.',
    icon: <RocketOutlined />,
  },
  {
    title: 'Enterprise Grade',
    description: 'Built with security, compliance, and scalability in mind. Ready for production from day one.',
    icon: <CheckCircleOutlined />,
  },
];

export default function HeroSection() {
  const navigate = useNavigate();
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
      id="hero"
      style={{
        padding: isMobile ? token.paddingLG : token.paddingXL * 1,
        paddingTop: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        paddingBottom: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Hero Header - Clean Minimal */}
      <ScrollReveal direction="up" delay={0}>
        <div style={{ textAlign: 'center', marginBottom: token.marginXL * 2 }}>
          <Title
            level={1}
            style={{
              fontSize: isMobile ? '1.75rem' : '2.25rem',
              fontWeight: 600,
              marginBottom: token.marginMD,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
              lineHeight: 1.2,
            }}
          >
            Unified Metadata-Driven Platform
          </Title>
          <Paragraph
            style={{
              margin: 0,
              marginBottom: token.marginXL,
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              lineHeight: 1.6,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.6)',
              maxWidth: 700,
              margin: '0 auto',
              marginBottom: token.marginXL,
              fontWeight: 400,
            }}
          >
            Create powerful data-driven pages — tables, dashboards, filters, downloads, and reports —{' '}
            <Text strong style={{ color: token.colorPrimary, fontWeight: 600 }}>
              directly from configuration
            </Text>
            , without writing a single line of code.
          </Paragraph>
          <GlassCard
            style={{
              borderRadius: 8,
              padding: `${token.paddingXS}px ${token.paddingSM}px`,
              display: 'inline-block',
              marginBottom: token.marginLG,
            }}
          >
            <Text
              style={{
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: 400,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                fontStyle: 'italic',
              }}
            >
              "Build in minutes, not months"
            </Text>
          </GlassCard>
        </div>
      </ScrollReveal>

      {/* Hero Features - Compact Cards with Hover Effects */}
      <Row gutter={[token.marginMD, token.marginMD]} style={{ marginTop: token.marginXL }}>
        {heroFeatures.map((feature, idx) => (
          <Col key={idx} xs={24} sm={12} md={12} lg={12}>
            <ScrollReveal direction="up" delay={idx * 100}>
              <GlassCard
                hoverable
                style={{
                  padding: `${token.paddingSM}px ${token.paddingMD}px`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = isDark
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ display: 'flex', gap: token.marginSM, alignItems: 'center' }}>
                  <div style={{ flexShrink: 0 }}>
                    <GlassIcon icon={feature.icon} size={40} iconSize={20} className="icon-minimal" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text
                      strong
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                        display: 'block',
                        marginBottom: 2,
                      }}
                    >
                      {feature.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: '0.75rem',
                        display: 'block',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.description}
                    </Text>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          </Col>
        ))}
      </Row>

      {/* CTA Buttons */}
      <ScrollReveal direction="up" delay={400}>
        <div style={{ textAlign: 'center', marginTop: token.marginXL }}>
          <Space size="large" wrap style={{ justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 44,
                paddingLeft: token.paddingLG,
                paddingRight: token.paddingLG,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 8,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Get Started
            </Button>
            <Button
              size="large"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 44,
                paddingLeft: token.paddingLG,
                paddingRight: token.paddingLG,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 8,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              Sign In
            </Button>
          </Space>
        </div>
      </ScrollReveal>
    </section>
  );
}

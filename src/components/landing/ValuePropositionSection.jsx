import { useState, useEffect } from 'react';
import { theme as antdTheme, Typography, Row, Col } from 'antd';
import {
  DollarOutlined,
  RocketOutlined,
  UserOutlined,
  AppstoreOutlined,
  BuildOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import SectionHeader from './SectionHeader';
import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';

const { Text } = Typography;

const valueProps = [
  { 
    title: 'Reduce engineering cost', 
    description: 'Cut 60–90% of internal-tool development.', 
    icon: <DollarOutlined />,
    metric: '60-90%',
    metricLabel: 'Cost Reduction',
    position: 'center-top',
  },
  { 
    title: 'Faster customer onboarding', 
    description: 'New tenant? Pages ready instantly.', 
    icon: <RocketOutlined />,
    metric: 'Instant',
    metricLabel: 'Deployment',
    position: 'left',
  },
  { 
    title: 'Empower business teams', 
    description: 'Non-technical users build their own tools.', 
    icon: <UserOutlined />,
    metric: '100%',
    metricLabel: 'Self-Service',
    position: 'right',
  },
  { 
    title: 'Standardize reporting & dashboards', 
    description: 'Across multiple tenants, products, use cases.', 
    icon: <AppstoreOutlined />,
    metric: 'Unified',
    metricLabel: 'Platform',
    position: 'left-bottom',
  },
  { 
    title: 'Modernize outdated admin consoles', 
    description: 'Replace manual tools with dynamic, maintainable dashboards.', 
    icon: <BuildOutlined />,
    metric: 'Zero',
    metricLabel: 'Legacy Code',
    position: 'right-bottom',
  },
];

export default function ValuePropositionSection() {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();
  const [isMobile, setIsMobile] = useState(false);
  
  // Color scheme for each value proposition
  const valueColors = {
    'center-top': '#52c41a', // Green for cost reduction
    'left': '#fa8c16', // Orange for speed/onboarding
    'right': '#722ed1', // Purple for empowerment
    'left-bottom': '#13c2c2', // Teal for standardization
    'right-bottom': '#2f54eb', // Indigo for modernization
  };

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
      id="value"
      style={{
        padding: isMobile ? token.paddingLG : token.paddingXL * 1,
        paddingTop: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        paddingBottom: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <ScrollReveal direction="up" delay={0}>
        <SectionHeader
          badge="PROVEN RESULTS"
          title="Value Proposition For Companies"
          description="Transform your business operations with measurable benefits."
          tagline="More value. Less cost. Zero compromise."
        />
      </ScrollReveal>

      {/* Unique Tiered Impact Layout with Metrics */}
      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', marginTop: token.marginXL * 3, marginBottom: token.marginXL * 2, paddingLeft: isMobile ? token.paddingMD : token.paddingLG, paddingRight: isMobile ? token.paddingMD : token.paddingLG }}>
        {/* Center Featured Card */}
        <ScrollReveal direction="up" delay={0}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: token.marginXL }}>
            {valueProps.filter(p => p.position === 'center-top').map((prop, idx) => (
              <GlassCard
                key={idx}
                hoverable
                style={{
                  padding: token.paddingLG,
                  textAlign: 'center',
                  maxWidth: isMobile ? '100%' : 400,
                  border: `2px solid ${hexToRgba(valueColors['center-top'], 0.3)}`,
                  background: isDark
                    ? `linear-gradient(135deg, ${hexToRgba(valueColors['center-top'], 0.1)}, rgba(255, 255, 255, 0.03))`
                    : `linear-gradient(135deg, ${hexToRgba(valueColors['center-top'], 0.06)}, rgba(255, 255, 255, 1))`,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.borderColor = hexToRgba(valueColors['center-top'], 0.5);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = hexToRgba(valueColors['center-top'], 0.3);
                }}
              >
                {/* Metric Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: token.marginXS,
                    padding: `${token.paddingXS}px ${token.paddingSM}px`,
                    borderRadius: 20,
                    background: hexToRgba(valueColors['center-top'], 0.15),
                    marginBottom: token.marginMD,
                  }}
                >
                  <ArrowUpOutlined style={{ fontSize: '0.9rem', color: valueColors['center-top'] }} />
                  <Text
                    strong
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: valueColors['center-top'],
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {prop.metric}
                  </Text>
                  <Text
                    style={{
                      fontSize: '0.7rem',
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {prop.metricLabel}
                  </Text>
                </div>
                <div style={{ marginBottom: token.marginMD }}>
                  <GlassIcon
                    icon={prop.icon}
                    size={64}
                    iconSize={28}
                    className="icon-minimal"
                  />
                </div>
                <Text
                  strong
                  style={{
                    display: 'block',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                    marginBottom: token.marginSM,
                  }}
                >
                  {prop.title}
                </Text>
                <Text
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                  }}
                >
                  {prop.description}
                </Text>
              </GlassCard>
            ))}
          </div>
        </ScrollReveal>

        {/* Side Cards - Two Rows */}
        <Row gutter={[token.marginMD, token.marginMD]} justify="center" style={{ marginTop: token.marginLG }}>
          {/* Top Row - Left and Right */}
          {valueProps.filter(p => p.position === 'left' || p.position === 'right').map((prop, idx) => {
            const cardColor = valueColors[prop.position];
            return (
              <Col key={prop.position} xs={24} sm={12} md={12} lg={12}>
                <ScrollReveal direction={prop.position === 'left' ? 'left' : 'right'} delay={200 + idx * 100}>
                  <GlassCard
                    hoverable
                    style={{
                      padding: `${token.paddingSM}px ${token.paddingMD}px`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: token.marginMD,
                      transition: 'all 0.3s ease',
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
                    <div style={{ flexShrink: 0 }}>
                      <GlassIcon icon={prop.icon} size={48} iconSize={22} className="icon-minimal" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS, marginBottom: 4 }}>
                        <Text
                          strong
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: cardColor,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {prop.metric}
                      </Text>
                      <Text
                        style={{
                          fontSize: '0.65rem',
                          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {prop.metricLabel}
                      </Text>
                    </div>
                    <Text
                      strong
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                        marginBottom: 2,
                      }}
                    >
                      {prop.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: '0.75rem',
                        lineHeight: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                      }}
                    >
                      {prop.description}
                    </Text>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </Col>
            );
          })}

          {/* Bottom Row - Left and Right */}
          {valueProps.filter(p => p.position === 'left-bottom' || p.position === 'right-bottom').map((prop, idx) => {
            const cardColor = valueColors[prop.position];
            return (
              <Col key={prop.position} xs={24} sm={12} md={12} lg={12}>
                <ScrollReveal direction={prop.position === 'left-bottom' ? 'left' : 'right'} delay={400 + idx * 100}>
                  <GlassCard
                    hoverable
                    style={{
                      padding: `${token.paddingSM}px ${token.paddingMD}px`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: token.marginMD,
                      transition: 'all 0.3s ease',
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
                    <div style={{ flexShrink: 0 }}>
                      <GlassIcon icon={prop.icon} size={48} iconSize={22} className="icon-minimal" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: token.marginXS, marginBottom: 4 }}>
                        <Text
                          strong
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: cardColor,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {prop.metric}
                      </Text>
                      <Text
                        style={{
                          fontSize: '0.65rem',
                          color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {prop.metricLabel}
                      </Text>
                    </div>
                    <Text
                      strong
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                        marginBottom: 2,
                      }}
                    >
                      {prop.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: '0.75rem',
                        lineHeight: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                      }}
                    >
                      {prop.description}
                    </Text>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </Col>
            );
          })}
        </Row>
      </div>
    </section>
  );
}

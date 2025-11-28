import { useState, useEffect } from 'react';
import { Button, Typography, Space, theme as antdTheme } from 'antd';
import { RocketOutlined, LoginOutlined, DollarOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';

const { Title, Paragraph, Text } = Typography;

const ctaPoints = [
  {
    title: 'Faster',
    description: 'Build dashboards and reports in minutes, not months.',
    icon: <ThunderboltOutlined />,
  },
  {
    title: 'Cheaper',
    description: 'Cut 60–90% of internal-tool development costs.',
    icon: <DollarOutlined />,
  },
  {
    title: 'More Flexible',
    description: 'One platform that adapts to your data.',
    icon: <RocketOutlined />,
  },
];

export default function CTASection() {
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
      id="cta"
      style={{
        padding: isMobile ? token.paddingLG : token.paddingXL * 1,
        paddingTop: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        paddingBottom: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Benefits as Horizontal Pills */}
      <ScrollReveal direction="up" delay={0}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: token.marginMD,
            marginBottom: token.marginXL,
            flexWrap: 'wrap',
          }}
        >
          {ctaPoints.map((point, idx) => (
            <ScrollReveal key={idx} direction="down" delay={idx * 80}>
              <GlassCard
                hoverable
                style={{
                  padding: `${token.paddingSM}px ${token.paddingLG}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: token.marginSM,
                  borderRadius: 50,
                  transition: 'all 0.3s ease',
                }}
              >
                <GlassIcon icon={point.icon} size={32} iconSize={16} className="icon-minimal" />
                <div>
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
                    {point.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: '0.75rem',
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                    }}
                  >
                    {point.description}
                  </Text>
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>

      {/* Simple Modern CTA Content */}
      <ScrollReveal direction="up" delay={300}>
        <div
          style={{
            textAlign: 'center',
            maxWidth: 700,
            margin: '0 auto',
          }}
        >
          <Title
            level={2}
            style={{
              margin: 0,
              marginBottom: token.marginMD,
              fontSize: isMobile ? '1.75rem' : '2.25rem',
              fontWeight: 600,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
              lineHeight: 1.2,
            }}
          >
            Ready to Transform Your Data Operations?
          </Title>
          <Paragraph
            style={{
              margin: 0,
              marginBottom: token.marginXL,
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              lineHeight: 1.6,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              color: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.6)',
              fontWeight: 400,
            }}
          >
            If your teams repeatedly request dashboards, reports, admin pages, or tenant-specific tools, this platform removes the workload from developers and places control directly in the hands of your business teams.
          </Paragraph>

          {/* CTA Buttons */}
          <Space size="large" wrap style={{ justifyContent: 'center', width: '100%' }}>
            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 52,
                paddingLeft: token.paddingXL,
                paddingRight: token.paddingXL,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 10,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                boxShadow: `0 4px 12px ${hexToRgba(token.colorPrimary, 0.3)}`,
              }}
            >
              Get Started Now
            </Button>
            <Button
              size="large"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{
                height: 52,
                paddingLeft: token.paddingXL,
                paddingRight: token.paddingXL,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 10,
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

import { useState, useEffect } from 'react';
import { theme as antdTheme, Typography } from 'antd';
import {
  DatabaseOutlined,
  ApartmentOutlined,
  SafetyOutlined,
  UserOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import SectionHeader from './SectionHeader';
import ScrollReveal from './ScrollReveal';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';

const { Text } = Typography;

const features = [
  { title: 'Metadata-driven', description: 'It understands your database structure in real-time.', icon: <DatabaseOutlined /> },
  { title: 'Truly multi-tenant aware', description: 'One engine → Many clients → Zero duplication.', icon: <ApartmentOutlined /> },
  { title: 'Secure dynamic querying', description: 'Only SELECT allowed + guardrails. Zero data storage policy.', icon: <SafetyOutlined /> },
  { title: 'Fully customizable at user-level', description: 'Every user gets their own interface preferences.', icon: <UserOutlined /> },
  { title: 'Configurable, not coded', description: 'Everything is created from configuration — no developer needed.', icon: <SettingOutlined /> },
  { title: 'Logs, audit, activity tracking built-in', description: 'Enterprise-level safety, ready for compliance.', icon: <CheckCircleOutlined /> },
];

export default function UniqueFeaturesSection() {
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
      id="features"
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
          badge="UNIQUE BY DESIGN"
          title="Why Our Platform Is Unique"
          description="Unlike typical low-code tools, this platform is built for enterprise needs."
          tagline="Built different. Built better."
        />
      </ScrollReveal>

      {/* Unique Diagonal Zigzag Flow Layout */}
      <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', marginTop: token.marginXL * 2 }}>
        {!isMobile && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {features.map((_, idx) => {
              if (idx === features.length - 1) return null;
              const isEven = idx % 2 === 0;
              const startX = isEven ? '15%' : '85%';
              const endX = isEven ? '85%' : '15%';
              const startY = `${(idx / features.length) * 100}%`;
              const endY = `${((idx + 1) / features.length) * 100}%`;
              
              return (
                <line
                  key={idx}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={isDark ? hexToRgba(token.colorPrimary, 0.2) : hexToRgba(token.colorPrimary, 0.15)}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              );
            })}
          </svg>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          {features.map((feature, idx) => {
            const isEven = idx % 2 === 0;
            const offset = isMobile ? 0 : (isEven ? -20 : 20);
            
            return (
              <ScrollReveal key={idx} direction={isEven ? 'left' : 'right'} delay={idx * 100}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: idx < features.length - 1 ? token.marginXL : 0,
                    flexDirection: isMobile ? 'column' : isEven ? 'row' : 'row-reverse',
                    gap: token.marginMD,
                    transform: isMobile ? 'none' : `translateX(${offset}px)`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {/* Icon with connecting indicator */}
                  <div
                    style={{
                      position: 'relative',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: token.marginSM,
                    }}
                  >
                    <GlassIcon
                      icon={feature.icon}
                      size={isMobile ? 48 : 56}
                      iconSize={isMobile ? 22 : 26}
                      className="icon-minimal"
                    />
                    {!isMobile && idx < features.length - 1 && (
                      <ArrowRightOutlined
                        style={{
                          fontSize: '1.2rem',
                          color: isDark ? hexToRgba(token.colorPrimary, 0.4) : hexToRgba(token.colorPrimary, 0.5),
                          transform: isEven ? 'rotate(0deg)' : 'rotate(180deg)',
                          position: 'absolute',
                          [isEven ? 'right' : 'left']: '-24px',
                        }}
                      />
                    )}
                  </div>

                  {/* Compact Card */}
                  <GlassCard
                    hoverable
                    style={{
                      flex: 1,
                      maxWidth: isMobile ? '100%' : '70%',
                      padding: `${token.paddingSM}px ${token.paddingMD}px`,
                      borderRadius: 12,
                      transition: 'all 0.3s ease',
                      background: isEven
                        ? isDark
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(255, 255, 255, 1)'
                        : isDark
                        ? 'rgba(30, 30, 30, 0.75)'
                        : 'rgba(255, 255, 255, 0.95)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.borderColor = isDark
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.borderColor = isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Text
                        strong
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                          display: 'block',
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
                  </GlassCard>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

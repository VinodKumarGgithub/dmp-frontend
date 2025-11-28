import { useState, useEffect } from 'react';
import { Typography, theme as antdTheme } from 'antd';
import {
  CodeOutlined,
  BuildOutlined,
  ApartmentOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import SectionHeader from './SectionHeader';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';

const { Text } = Typography;

const problems = [
  {
    title: 'Reduces Developer Dependency by 80–90%',
    description: 'No more waiting for engineering to build new admin pages, add filters, expose new columns, or update stored procedures. Business teams do everything themselves.',
    icon: <CodeOutlined />,
    side: 'left',
  },
  {
    title: 'Eliminates Custom Dashboard Development',
    description: 'Instead of building internal tools again and again, your business users configure them in minutes.',
    icon: <BuildOutlined />,
    side: 'right',
  },
  {
    title: 'Harmonizes Multi-Tenant SaaS Architecture',
    description: 'Companies no longer need separate environments, tenant-specific dashboards, or duplicate configuration. Everything is dynamic.',
    icon: <ApartmentOutlined />,
    side: 'left',
  },
  {
    title: 'Replaces Dozens of Stored Procedures',
    description: 'Your team uses dynamic, safe, read-only query execution. No more SP duplication, deploying SP for every change, or maintaining a huge DB script layer.',
    icon: <SyncOutlined />,
    side: 'right',
  },
  {
    title: 'Instant Adaptation to Schema Changes',
    description: 'If you add a column in DB → Page recognizes it automatically.',
    icon: <ThunderboltOutlined />,
    side: 'left',
  },
  {
    title: 'Improves Operational Efficiency',
    description: 'Support, QA, Operations, Sales, Finance, and External Clients all get faster data access, custom views, and role-based permissions without involving IT.',
    icon: <TeamOutlined />,
    side: 'right',
  },
];

export default function ProblemsSection() {
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
      id="problems"
      style={{
        padding: isMobile ? token.paddingLG : token.paddingXL * 1,
        paddingTop: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        paddingBottom: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        maxWidth: 1000,
        margin: '0 auto',
      }}
    >
      <SectionHeader
        badge="REAL IMPACT"
        title="Real World Problems We Solve"
        description="Transform how your teams work with data and reduce dependency on engineering resources."
        tagline="Stop waiting. Start building."
      />

      <div style={{ position: 'relative' }}>
        {/* Vertical line for timeline */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              background: isDark
                ? `linear-gradient(180deg, transparent, ${hexToRgba(token.colorPrimary, 0.3)}, transparent)`
                : `linear-gradient(180deg, transparent, ${hexToRgba(token.colorPrimary, 0.2)}, transparent)`,
              transform: 'translateX(-50%)',
            }}
          />
        )}

        {problems.map((problem, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: token.marginLG,
              flexDirection: isMobile
                ? 'column'
                : problem.side === 'left'
                ? 'row'
                : 'row-reverse',
              gap: token.marginMD,
            }}
          >
            <GlassIcon icon={problem.icon} size={40} iconSize={20} className="icon-minimal" />
            <GlassCard
              hoverable
              style={{
                flex: 1,
                maxWidth: isMobile ? '100%' : '60%',
                padding: `${token.paddingSM}px ${token.paddingMD}px`,
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  {problem.title}
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
                  {problem.description}
                </Text>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </section>
  );
}


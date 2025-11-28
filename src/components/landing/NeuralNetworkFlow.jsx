import { useState, useEffect } from 'react';
import { theme as antdTheme, Typography, Row, Col } from 'antd';
import {
  DatabaseOutlined,
  SettingOutlined,
  SafetyOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  UserOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import GlassCard from './GlassCard';
import GlassIcon from './GlassIcon';
import ScrollReveal from './ScrollReveal';

const { Title, Paragraph } = Typography;

// Organized by tiers/levels
const networkTiers = [
  {
    level: 1,
    title: 'Data Layer',
    nodes: [
      {
        id: 'database',
        title: 'Database',
        description: 'Your existing data structure',
        icon: <DatabaseOutlined />,
      },
    ],
  },
  {
    level: 2,
    title: 'Processing Layer',
    nodes: [
      {
        id: 'metadata',
        title: 'Metadata Engine',
        description: 'Real-time schema understanding',
        icon: <SettingOutlined />,
      },
    ],
  },
  {
    level: 3,
    title: 'Configuration Layer',
    nodes: [
      {
        id: 'config',
        title: 'Configuration',
        description: 'No-code page builder',
        icon: <FileTextOutlined />,
      },
      {
        id: 'security',
        title: 'Security Layer',
        description: 'Guardrails & permissions',
        icon: <SafetyOutlined />,
      },
    ],
  },
  {
    level: 4,
    title: 'Application Layer',
    nodes: [
      {
        id: 'pages',
        title: 'Dynamic Pages',
        description: 'Tables, dashboards, reports',
        icon: <AppstoreOutlined />,
      },
      {
        id: 'tenants',
        title: 'Multi-Tenant',
        description: 'Isolated per organization',
        icon: <ApartmentOutlined />,
      },
    ],
  },
  {
    level: 5,
    title: 'User Layer',
    nodes: [
      {
        id: 'users',
        title: 'Business Users',
        description: 'Self-service access',
        icon: <UserOutlined />,
      },
    ],
  },
];

export default function NeuralNetworkFlow() {
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
    <div style={{ position: 'relative', width: '100%', padding: `${token.paddingXL}px 0` }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: token.marginXL }}>
        {networkTiers.map((tier, tierIdx) => (
          <ScrollReveal key={tier.level} direction="up" delay={tierIdx * 150}>
            <div style={{ position: 'relative' }}>
              {/* Tier Title */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: token.marginLG,
                  position: 'relative',
                }}
              >
                <GlassCard
                  style={{
                    display: 'inline-block',
                    padding: `${token.paddingXS}px ${token.paddingMD}px`,
                    borderRadius: 20,
                  }}
                >
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {tier.title}
                  </Title>
                </GlassCard>
              </div>

              {/* Nodes in this tier */}
              <Row
                gutter={[token.marginLG, token.marginLG]}
                justify="center"
                style={{ position: 'relative' }}
              >
                {tier.nodes.map((node, nodeIdx) => (
                  <Col
                    key={node.id}
                    xs={24}
                    sm={tier.nodes.length === 1 ? 12 : 12}
                    md={tier.nodes.length === 1 ? 8 : 12}
                    lg={tier.nodes.length === 1 ? 6 : 6}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* Node icon */}
                      <GlassIcon
                        icon={node.icon}
                        size={isMobile ? 56 : 64}
                        iconSize={isMobile ? 24 : 28}
                        className="icon-minimal"
                      />

                      {/* Node card */}
                      <GlassCard
                        style={{
                          marginTop: token.marginMD,
                          padding: token.paddingMD,
                          textAlign: 'center',
                          width: '100%',
                        }}
                      >
                        <Title
                          level={5}
                          style={{
                            margin: 0,
                            marginBottom: token.marginXS,
                            fontSize: isMobile ? '0.85rem' : '0.95rem',
                            fontWeight: 600,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                          }}
                        >
                          {node.title}
                        </Title>
                        <Paragraph
                          style={{
                            margin: 0,
                            fontSize: isMobile ? '0.75rem' : '0.85rem',
                            lineHeight: 1.5,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                          }}
                        >
                          {node.description}
                        </Paragraph>
                      </GlassCard>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Connecting arrow/lines between tiers */}
              {tierIdx < networkTiers.length - 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: token.marginLG,
                    marginBottom: token.marginLG,
                    position: 'relative',
                  }}
                >
                  {/* Vertical connecting line */}
                  <div
                    style={{
                      width: 2,
                      height: token.marginXL,
                      background: isDark
                        ? `linear-gradient(180deg, ${hexToRgba(token.colorPrimary, 0.3)}, ${hexToRgba(token.colorPrimary, 0.1)})`
                        : `linear-gradient(180deg, ${hexToRgba(token.colorPrimary, 0.25)}, ${hexToRgba(token.colorPrimary, 0.1)})`,
                      position: 'relative',
                    }}
                  >
                    {/* Connection dots */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: token.colorPrimary,
                        border: `2px solid ${isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)'}`,
                        boxShadow: `0 0 12px ${hexToRgba(token.colorPrimary, 0.4)}`,
                      }}
                    />
                  </div>
                  {/* Arrow icon */}
                  <ArrowDownOutlined
                    style={{
                      fontSize: '1.5rem',
                      color: token.colorPrimary,
                      opacity: 0.6,
                      marginLeft: token.marginSM,
                    }}
                  />
                </div>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

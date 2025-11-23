import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Space, Card, theme, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, DatabaseOutlined, ThunderboltOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { isDark } = useTheme();
  
  // Calculate glassy colors based on theme - premium glassmorphism for both modes
  const glassBg = isDark 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.75)';
  const glassBgLight = isDark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.85)';
  const glassBorder = isDark 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(0, 0, 0, 0.06)';
  const glassBorderLight = isDark 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.08)';
  const overlayColor = isDark 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.01)';
  const gridColor = isDark 
    ? 'rgba(255, 255, 255, 0.02)' 
    : 'rgba(0, 0, 0, 0.015)';
  
  // Enhanced shadows for depth - premium feel
  const cardShadow = isDark
    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
    : '0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08)';
  const featureCardShadow = isDark
    ? '0 4px 16px rgba(0, 0, 0, 0.3)'
    : '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (error) {
      // Error is already handled by login function via handleApiError
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: token.colorBgLayout,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Enhanced background with gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? `radial-gradient(circle at 20% 50%, ${overlayColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${overlayColor} 0%, transparent 50%)`
            : `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorFillQuaternary} 100%)`,
        }}
      />
      
      {/* Glassy background overlay - no blue colors */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? `radial-gradient(circle at 20% 50%, ${overlayColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${overlayColor} 0%, transparent 50%)`
            : `radial-gradient(circle at 25% 30%, ${overlayColor} 0%, transparent 60%), radial-gradient(circle at 75% 70%, ${overlayColor} 0%, transparent 60%)`,
        }}
      />
      
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: isDark ? 1 : 0.5,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: token.paddingLG,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            maxWidth: 1000,
            gap: token.marginXXL,
            alignItems: 'center',
          }}
        >
          {/* Left side - Branding */}
          <div
            style={{
              flex: 1,
              display: isMobile ? 'none' : 'block',
              color: token.colorText,
              padding: token.paddingXXL,
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <div
                  className="icon-container-large icon-blazing"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    background: isDark 
                      ? glassBgLight 
                      : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: token.marginMD,
                    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <DatabaseOutlined
                    className="icon-blazing-shine"
                    style={{
                      fontSize: 40,
                      color: token.colorText,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </div>
                <Title
                  level={1}
                  style={{
                    color: token.colorText,
                    marginBottom: token.marginSM,
                    fontWeight: 700,
                    fontSize: '2.5rem',
                  }}
                >
                  Clinical Manager
                </Title>
                <Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: '1.1rem',
                    display: 'block',
                    marginBottom: token.marginLG,
                  }}
                >
                  Multitenant data management platform for clinical operations
                </Text>
              </div>

              <Divider style={{ borderColor: token.colorBorder }} />

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Card
                  hoverable
                  style={{
                    background: isDark 
                      ? `linear-gradient(180deg, ${glassBg}, rgba(255,255,255,0.02))`
                      : `linear-gradient(180deg, ${glassBg}, rgba(255,255,255,0.95))`,
                    backdropFilter: 'blur(10px) saturate(120%)',
                    border: `1px solid ${isDark ? glassBorder : token.colorBorder}`,
                    borderRadius: 12,
                    boxShadow: featureCardShadow,
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: token.paddingMD }}
                >
                  <Space size="middle">
                    <div
                      className="icon-container-small icon-blazing"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: isDark 
                          ? glassBgLight 
                          : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`,
                        border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <SafetyOutlined className="icon-blazing-shine" style={{ fontSize: 20, color: token.colorText, position: 'relative', zIndex: 1 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: 'block', color: token.colorText, fontSize: '1rem', marginBottom: 4 }}>
                        Multitenant Architecture
                      </Text>
                      <Text style={{ color: token.colorTextSecondary, fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Isolated data per tenant with secure access control
                      </Text>
                    </div>
                  </Space>
                </Card>
                
                <Card
                  hoverable
                  style={{
                    background: isDark 
                      ? `linear-gradient(180deg, ${glassBg}, rgba(255,255,255,0.02))`
                      : `linear-gradient(180deg, ${glassBg}, rgba(255,255,255,0.95))`,
                    backdropFilter: 'blur(10px) saturate(120%)',
                    border: `1px solid ${isDark ? glassBorder : token.colorBorder}`,
                    borderRadius: 12,
                    boxShadow: featureCardShadow,
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: token.paddingMD }}
                >
                  <Space size="middle">
                    <div
                      className="icon-container-small icon-blazing"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: isDark 
                          ? glassBgLight 
                          : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`,
                        border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <ThunderboltOutlined className="icon-blazing-shine" style={{ fontSize: 20, color: token.colorText, position: 'relative', zIndex: 1 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: 'block', color: token.colorText, fontSize: '1rem', marginBottom: 4 }}>
                        Real-time Data Processing
                      </Text>
                      <Text style={{ color: token.colorTextSecondary, fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Execute dynamic SQL queries, stored procedures, and complex joins with instant results
                      </Text>
                    </div>
                  </Space>
                </Card>
                
                <Card
                  hoverable
                  style={{
                    background: isDark 
                      ? `linear-gradient(180deg, ${glassBg}, rgba(255,255,255,0.02))`
                      : `linear-gradient(180deg, ${glassBg}, rgba(255,255,255,0.95))`,
                    backdropFilter: 'blur(10px) saturate(120%)',
                    border: `1px solid ${isDark ? glassBorder : token.colorBorder}`,
                    borderRadius: 12,
                    boxShadow: featureCardShadow,
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: token.paddingMD }}
                >
                  <Space size="middle">
                    <div
                      className="icon-container-small icon-blazing"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: isDark 
                          ? glassBgLight 
                          : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`,
                        border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <AppstoreOutlined className="icon-blazing-shine" style={{ fontSize: 20, color: token.colorText, position: 'relative', zIndex: 1 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ display: 'block', color: token.colorText, fontSize: '1rem', marginBottom: 4 }}>
                        Dynamic Page Creation
                      </Text>
                      <Text style={{ color: token.colorTextSecondary, fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Create and configure data pages with custom SQL, filters, and exports on the fly
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Space>
            </Space>
          </div>

          {/* Right side - Login Form */}
          <Card
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 20,
              background: isDark 
                ? glassBg 
                : `linear-gradient(180deg, ${glassBgLight}, ${glassBg})`,
              backdropFilter: 'blur(24px) saturate(200%)',
              border: `1px solid ${isDark ? glassBorder : glassBorder}`,
              boxShadow: cardShadow,
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: token.paddingXXL }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  className="icon-container-large icon-blazing"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: isDark 
                      ? glassBgLight 
                      : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    marginBottom: token.marginMD,
                    boxShadow: isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <LockOutlined className="icon-blazing-shine" style={{ fontSize: 28, color: token.colorText, position: 'relative', zIndex: 1 }} />
                </div>
                <Title level={2} style={{ marginBottom: token.marginXS, fontWeight: 600, color: token.colorText }}>
                  Welcome Back
                </Title>
                <Text style={{ fontSize: '0.95rem', color: token.colorTextSecondary }}>
                  Sign in to continue to your account
                </Text>
              </div>

              <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                size="large"
                requiredMark={false}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your username!' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />}
                    placeholder="Username"
                    autoComplete="username"
                    style={{
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: isDark ? glassBgLight : token.colorFillQuaternary,
                      border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                      color: token.colorText,
                      transition: 'all 0.2s ease',
                    }}
                    className="glass-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
                    placeholder="Password"
                    autoComplete="current-password"
                    style={{
                      borderRadius: 8,
                      padding: '8px 12px',
                      background: isDark ? glassBgLight : token.colorFillQuaternary,
                      border: `1px solid ${isDark ? glassBorderLight : token.colorBorder}`,
                      color: token.colorText,
                      transition: 'all 0.2s ease',
                    }}
                    className="glass-input"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 52,
                      borderRadius: 12,
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isDark 
                        ? 'none' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isDark 
                        ? token.boxShadow 
                        : '0 8px 20px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isDark 
                        ? 'none' 
                        : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <div style={{ textAlign: 'center', marginTop: token.marginMD }}>
                <Text style={{ fontSize: '0.85rem', color: token.colorTextSecondary }}>
                  <SafetyOutlined style={{ marginRight: 4 }} />
                  Secure login with encrypted credentials
                </Text>
              </div>
            </Space>
          </Card>
        </div>
      </div>

      {/* CSS for glass inputs and icon shine effects */}
      <style>{`
        /* Glass input styles */
        .glass-input::placeholder {
          color: ${token.colorTextTertiary} !important;
        }
        .glass-input:hover {
          background: ${isDark ? 'rgba(255, 255, 255, 0.12)' : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`} !important;
          border-color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : glassBorderLight} !important;
          transform: translateY(-1px);
          box-shadow: ${isDark ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)'} !important;
        }
        .glass-input:focus,
        .glass-input.ant-input-focused {
          background: ${isDark ? 'rgba(255, 255, 255, 0.15)' : `linear-gradient(135deg, ${glassBgLight}, ${glassBg})`} !important;
          border-color: ${isDark ? 'rgba(255, 255, 255, 0.4)' : glassBorderLight} !important;
          box-shadow: ${isDark 
            ? 'none' 
            : `0 0 0 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.1)`} !important;
          transform: translateY(-1px);
        }
        .glass-input.ant-input {
          color: ${token.colorText} !important;
        }
        .glass-input.ant-input-password .ant-input-password-icon {
          color: ${token.colorTextSecondary} !important;
          transition: color 0.2s ease;
        }
        .glass-input.ant-input-password .ant-input-password-icon:hover {
          color: ${token.colorText} !important;
        }

        /* Icon shine effects - unique flashy design */
        @keyframes shine-sweep {
          0% {
            transform: translateX(-100%) skewX(-15deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
            opacity: 0;
          }
        }

        @keyframes shimmer-glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 2px ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'});
          }
          50% {
            filter: brightness(1.4) drop-shadow(0 0 8px ${isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'});
          }
        }


        /* Icon shine effects on containers */
        .icon-container-large::before,
        .icon-container-small::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'} 50%,
            transparent 70%
          );
          animation: shine-sweep 3s linear infinite;
          pointer-events: none;
        }

        .icon-container-small::before {
          animation-duration: 4s;
        }

        /* Blazing shine effect for premium icons */
        @keyframes blazing-shine {
          0% {
            transform: translateX(-150%) translateY(-150%) rotate(45deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          20% {
            opacity: 0.8;
          }
          30% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(150%) translateY(150%) rotate(45deg);
            opacity: 0;
          }
        }

        @keyframes blazing-glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 4px ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'});
          }
        }

        .icon-blazing::before {
          content: '';
          position: absolute;
          top: -100%;
          left: -100%;
          width: 300%;
          height: 300%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            transparent 35%,
            ${isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)'} 50%,
            transparent 65%,
            transparent 100%
          );
          animation: blazing-shine 2.5s ease-in-out infinite;
          pointer-events: none;
        }

        .icon-blazing-shine {
          position: relative;
          display: inline-block;
          filter: drop-shadow(0 0 4px ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'});
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .icon-blazing:hover .icon-blazing-shine {
          transform: scale(1.2) rotate(5deg);
          filter: drop-shadow(0 0 12px ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.3)'});
        }

        .icon-blazing:hover::before {
          animation-duration: 1.5s;
        }

        /* Enhanced hover effects for blazing icons */
        .icon-blazing:hover {
          transform: scale(1.05);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

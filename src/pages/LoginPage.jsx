import { useState } from 'react';
import { Form, Input, Button, Typography, Card, theme, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, LoginOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useAppConfigStore from '../stores/appConfigStore';
import { useTheme } from '../contexts/ThemeContext';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { isDark } = useTheme();
  const getAppName = useAppConfigStore((state) => state.getAppName);

  // Theme-aware colors
  const gridColor = isDark 
    ? `rgba(255, 255, 255, 0.08)` // More visible white grid for dark theme
    : `rgba(0, 0, 0, 0.04)`; // Very subtle black grid for light theme
  
  const gradientOverlay = isDark
    ? `linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.02) 50%, rgba(24, 144, 255, 0.05) 100%)`
    : `linear-gradient(135deg, rgba(24, 144, 255, 0.05) 0%, rgba(24, 144, 255, 0.01) 50%, rgba(24, 144, 255, 0.03) 100%)`;
  
  const circleColor = isDark
    ? `rgba(24, 144, 255, 0.12)`
    : `rgba(24, 144, 255, 0.08)`;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: token.colorBgLayout,
        padding: token.paddingLG,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background with gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradientOverlay,
          zIndex: 0,
        }}
      />

      {/* Grid pattern with uneven opacity */}
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
          backgroundSize: '40px 40px',
          maskImage: isDark
            ? `radial-gradient(ellipse 60% 50% at 30% 20%, black 0%, transparent 50%),
               radial-gradient(ellipse 50% 60% at 70% 80%, black 0%, transparent 50%),
               radial-gradient(ellipse 40% 50% at 50% 50%, black 0%, transparent 60%)`
            : `radial-gradient(ellipse 60% 50% at 30% 20%, black 0%, transparent 50%),
               radial-gradient(ellipse 50% 60% at 70% 80%, black 0%, transparent 50%),
               radial-gradient(ellipse 40% 50% at 50% 50%, black 0%, transparent 60%)`,
          WebkitMaskImage: isDark
            ? `radial-gradient(ellipse 60% 50% at 30% 20%, black 0%, transparent 50%),
               radial-gradient(ellipse 50% 60% at 70% 80%, black 0%, transparent 50%),
               radial-gradient(ellipse 40% 50% at 50% 50%, black 0%, transparent 60%)`
            : `radial-gradient(ellipse 60% 50% at 30% 20%, black 0%, transparent 50%),
               radial-gradient(ellipse 50% 60% at 70% 80%, black 0%, transparent 50%),
               radial-gradient(ellipse 40% 50% at 50% 50%, black 0%, transparent 60%)`,
          opacity: isDark ? 0.9 : 0.6,
          zIndex: 0,
        }}
      />

      {/* Decorative accent circles */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: circleColor,
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: circleColor,
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: circleColor,
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 1,
          boxShadow: isDark 
            ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${isDark ? token.colorBorderSecondary : 'rgba(24, 144, 255, 0.1)'}`,
        }}
      >
        {/* Header with icon */}
        <div style={{ textAlign: 'center', marginBottom: token.marginXL }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: isDark
                ? 'linear-gradient(135deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.1))'
                : 'linear-gradient(135deg, rgba(24, 144, 255, 0.15), rgba(24, 144, 255, 0.05))',
              marginBottom: token.marginMD,
              border: `2px solid ${isDark ? 'rgba(24, 144, 255, 0.3)' : 'rgba(24, 144, 255, 0.2)'}`,
            }}
          >
            <SafetyCertificateOutlined
              style={{
                fontSize: 32,
                color: token.colorPrimary,
              }}
            />
          </div>
          <Title level={2} style={{ marginBottom: token.marginXS, marginTop: 0 }}>
            {getAppName()}
          </Title>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
            Sign in to continue to your account
          </Typography.Text>
        </div>

        <Divider style={{ margin: `${token.marginLG}px 0` }} />

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
            style={{ marginBottom: token.marginLG }}
          >
            <Input
              prefix={<UserOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="Enter your username"
              autoComplete="username"
              style={{
                borderRadius: token.borderRadius,
                padding: `${token.paddingSM}px ${token.paddingMD}px`,
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            style={{ marginBottom: token.marginXL }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="Enter your password"
              autoComplete="current-password"
              style={{
                borderRadius: token.borderRadius,
                padding: `${token.paddingSM}px ${token.paddingMD}px`,
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              icon={<LoginOutlined />}
              style={{
                height: 44,
                borderRadius: token.borderRadius,
                fontSize: token.fontSizeLG,
                fontWeight: 500,
                background: isDark
                  ? 'linear-gradient(90deg, rgba(24, 144, 255, 0.9) 0%, rgba(24, 144, 255, 0.6) 50%, rgba(24, 144, 255, 0.3) 100%)'
                  : 'linear-gradient(90deg, rgba(24, 144, 255, 0.95) 0%, rgba(24, 144, 255, 0.7) 50%, rgba(24, 144, 255, 0.4) 100%)',
                border: 'none',
                boxShadow: isDark
                  ? '0 4px 12px rgba(24, 144, 255, 0.3)'
                  : '0 4px 12px rgba(24, 144, 255, 0.2)',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Footer with security badge */}
        <div
          style={{
            marginTop: token.marginXL,
            paddingTop: token.marginMD,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: token.marginXS,
          }}
        >
          <SafetyOutlined style={{ color: token.colorSuccess, fontSize: 14 }} />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Secure login with encrypted connection
          </Typography.Text>
        </div>
      </Card>
    </div>
  );
}

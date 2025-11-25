import { useState } from 'react';
import { Form, Input, Button, Typography, Card, theme } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import useAppConfigStore from '../stores/appConfigStore';

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const getAppName = useAppConfigStore((state) => state.getAppName);

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
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: token.marginLG }}>
          <Title level={2} style={{ marginBottom: token.marginSM }}>
            {getAppName()}
          </Title>
          <Typography.Text type="secondary">
            Sign in to continue
          </Typography.Text>
        </div>

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
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

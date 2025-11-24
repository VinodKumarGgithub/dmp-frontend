import { ProLayout } from '@ant-design/pro-layout';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, HomeOutlined, SettingOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Dropdown, Space, Button, theme, Typography } from 'antd';
import useAuthStore from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { logout as logoutApi } from '../api/auth';
import TenantSelector from '../components/TenantSelector';
import ThemeToggle from '../components/ThemeToggle';
import PageSwitcher from '../components/PageSwitcher';
import { protectedRoutes } from '../config/routes';
import useAppConfigStore from '../stores/appConfigStore';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const pagesConfig = useAuthStore((state) => state.pagesConfig);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const getAppName = useAppConfigStore((state) => state.getAppName);
  const getAppShortName = useAppConfigStore((state) => state.getAppShortName);

  const handleLogout = () => {
    logout(logoutApi, queryClient);
    navigate('/login');
  };

  // Build menu items from protected routes and pages config
  const menuItems = [
    // Home is always first
    {
      path: '/',
      name: 'Home',
      icon: <HomeOutlined />,
    },
    // Static routes from protectedRoutes (excluding home)
    ...protectedRoutes
      .filter((route) => route.label && route.key !== 'home')
      .filter((route) => {
        // Only show admin routes to admin users
        if (route.adminOnly && user?.role !== 'ADMIN') {
          return false;
        }
        // Show developer routes to admin or developer users
        if (route.developerOnly && user?.role !== 'ADMIN' && user?.role !== 'DEVELOPER') {
          return false;
        }
        return true;
      })
      .map((route) => ({
        path: route.path,
        name: route.label,
        icon:
          route.key === 'page-config' ? (
            <SettingOutlined />
          ) : route.key === 'users' ? (
            <UserOutlined />
          ) : (
            <HomeOutlined />
          ),
      })),
  ];

  const { Text } = Typography;

  // User menu dropdown with detailed user information
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <Space direction="vertical" size="small" style={{ width: '100%', padding: '4px 0' }}>
          <Space>
            <UserOutlined />
            <Text strong>{user?.name || user?.username || 'User'}</Text>
          </Space>
          {user?.email && (
            <Space style={{ marginLeft: 20 }}>
              <MailOutlined style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
            </Space>
          )}
          {user?.phone_number && (
            <Space style={{ marginLeft: 20 }}>
              <PhoneOutlined style={{ fontSize: 12 }} />
              <Text type="secondary" style={{ fontSize: 12 }}>{user.phone_number}</Text>
            </Space>
          )}
          {!user?.name && user?.username && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 20 }}>
              @{user.username}
            </Text>
          )}
        </Space>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          <span>Logout</span>
        </Space>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <ProLayout
      title={getAppName()}
      logo={<div style={{ color: token.colorText, fontWeight: token.fontWeightStrong }}>{getAppShortName()}</div>}
      location={{
        pathname: location.pathname,
      }}
      menu={{
        request: async () => {
          return menuItems;
        },
      }}
      menuItemRender={(item, dom) => {
        return <Link to={item.path || '/'}>{dom}</Link>;
      }}
      avatarProps={{
        src: null,
        title: user?.name || user?.username || 'User',
        icon: <UserOutlined />,
        size: 'small',
        render: (props, dom) => {
          return (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              {dom}
            </Dropdown>
          );
        },
      }}
      actionsRender={() => {
        return [
          <ThemeToggle key="theme" />,
          <TenantSelector key="tenant" />
        ];
      }}
      headerContentRender={() => null}
      onMenuHeaderClick={() => navigate('/')}
      fixSiderbar
      layout="mix"
      contentStyle={{
        minHeight: 'calc(100vh - 48px)',
        background: token.colorBgLayout,
      }}
    >
      <div
        style={{
          padding: token.paddingLG,
          background: token.colorBgContainer,
          minHeight: '100%',
          borderRadius: token.borderRadius,
        }}
      >
        {children}
        {/* Floating page switcher - only show if there are pages configured */}
        {Array.isArray(pagesConfig) && pagesConfig.length > 0 && <PageSwitcher />}
      </div>
    </ProLayout>
  );
}

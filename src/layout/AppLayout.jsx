import { ProLayout } from '@ant-design/pro-layout';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, HomeOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { Dropdown, Space, Button, theme } from 'antd';
import useAuthStore from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { logout as logoutApi } from '../api/auth';
import TenantSelector from '../components/TenantSelector';
import ThemeToggle from '../components/ThemeToggle';
import { protectedRoutes } from '../config/routes';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const pagesConfig = useAuthStore((state) => state.pagesConfig);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { token } = theme.useToken();

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
    // Add pages from config as menu items (only if there are pages configured)
    ...(Array.isArray(pagesConfig) && pagesConfig.length > 0
      ? pagesConfig.map((page) => ({
          path: `/pages/${page.page_key}`,
          name: page.title || page.page_key,
          icon: <FileTextOutlined />,
        }))
      : []),
  ];

  // User menu dropdown
  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <Space>
          <UserOutlined />
          <span>{user?.username || 'User'}</span>
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
      title="Clinical Manager"
      logo={<div style={{ color: token.colorText, fontWeight: token.fontWeightStrong }}>CM</div>}
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
        title: user?.username || 'User',
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
      </div>
    </ProLayout>
  );
}

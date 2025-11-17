import { ProLayout } from '@ant-design/pro-layout';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Space, Button, theme } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import TenantSelector from '../components/TenantSelector';
import ThemeToggle from '../components/ThemeToggle';
import { protectedRoutes } from '../config/routes';

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, pagesConfig } = useAuth();
  const { token } = theme.useToken();

  const handleLogout = () => {
    logout();
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
    // Add pages from config as menu items
    ...(Array.isArray(pagesConfig) && pagesConfig.length > 0
      ? pagesConfig.map((page) => ({
          path: `/pages/${page.page_key}`,
          name: page.title || page.page_key,
          icon: <UserOutlined />,
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

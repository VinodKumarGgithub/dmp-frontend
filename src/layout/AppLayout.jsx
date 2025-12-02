import { memo, useMemo } from 'react';
import { ProLayout } from '@ant-design/pro-layout';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  SettingOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  BarChartOutlined,
  DatabaseOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Dropdown, Space, Button, theme, Typography } from 'antd';
import useAuthStore from '../stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { logout as logoutApi } from '../api/auth';
import TenantSelector from '../components/TenantSelector';
import ThemeToggle from '../components/ThemeToggle';
import PageSwitcher from '../components/PageSwitcher';
import HelpCenter from '../components/HelpCenter';
import GlobalSearch from '../components/GlobalSearch';
import { LicenseStatusBanner } from '../components/LicenseStatusBanner';
import { ReadOnlyModeIndicator } from '../components/ReadOnlyModeIndicator';
import { protectedRoutes } from '../config/routes';
import { useOrganizationBranding } from '../hooks/useOrganizationBranding';
import { getUserAvatarUrl } from '../utils/gravatar';

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const pagesConfig = useAuthStore((state) => state.pagesConfig);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const branding = useOrganizationBranding();

  const handleLogout = () => {
    logout(logoutApi, queryClient);
    navigate('/login');
  };

  // Build menu items from protected routes and pages config
  // Memoize to prevent re-renders when tenant changes (menu doesn't depend on tenant)
  const menuItems = useMemo(() => [
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
        // Only show super admin routes to SUPER_ADMIN users
        if (route.superAdminOnly && user?.role !== 'SUPER_ADMIN') {
          return false;
        }
        // Only show admin routes to admin or super admin users
        if (route.adminOnly && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
          return false;
        }
        // Show developer routes to admin, super admin, or developer users
        if (route.developerOnly && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN' && user?.role !== 'DEVELOPER') {
          return false;
        }
        return true;
      })
      .map((route) => {
        // Map each route to its appropriate icon
        let icon;
        switch (route.key) {
          case 'page-config':
            icon = <SettingOutlined />;
            break;
          case 'users':
            icon = <UserOutlined />;
            break;
          case 'tenants':
            icon = <DatabaseOutlined />;
            break;
          case 'organizations':
            icon = <TeamOutlined />;
            break;
          case 'licenses':
            icon = <SafetyCertificateOutlined />;
            break;
          case 'audit-logs':
            icon = <FileTextOutlined />;
            break;
          case 'analytics':
            icon = <BarChartOutlined />;
            break;
          default:
            icon = <HomeOutlined />;
        }
        return {
        path: route.path,
        name: route.label,
          icon,
        };
      }),
  ], [user?.role]);

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
      key: 'profile',
      label: (
        <Space>
          <UserOutlined />
          <span>Profile</span>
        </Space>
      ),
      onClick: () => navigate('/profile'),
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
      title={branding.appName}
      logo={branding.logoUrl ? (
        <img 
          src={branding.logoUrl} 
          alt={branding.appName}
          style={{ height: 32, objectFit: 'contain' }}
        />
      ) : (
        <div style={{ color: token.colorText, fontWeight: token.fontWeightStrong }}>{branding.appShortName}</div>
      )}
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
        src: getUserAvatarUrl(user, 40),
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
          <ReadOnlyModeIndicator key="readonly" />,
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
        {/* License Status Banner - shows warnings/errors for license issues */}
        <LicenseStatusBanner />
        {children}
        {/* Floating page switcher - only show if there are pages configured */}
        {Array.isArray(pagesConfig) && pagesConfig.length > 0 && <PageSwitcher />}
        {/* Help Center - always available */}
        <HelpCenter />
        {/* Global Search - accessible via Cmd/Ctrl + K */}
        <GlobalSearch />
      </div>
    </ProLayout>
  );
}

// Memoize AppLayout to prevent re-renders when tenant changes
// AppLayout structure (menu, header, etc.) doesn't depend on tenant
export default memo(AppLayout, (prevProps, nextProps) => {
  // Only re-render if children actually change
  return prevProps.children === nextProps.children;
});

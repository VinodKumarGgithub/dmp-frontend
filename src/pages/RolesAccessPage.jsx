import { Card, Typography, Row, Col, Space, Tag, Divider, theme, Descriptions } from 'antd';
import {
  CrownOutlined,
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import useAuthStore from '../stores/authStore';

const { Title, Paragraph, Text } = Typography;

const roleDetails = {
  SUPER_ADMIN: {
    icon: <CrownOutlined style={{ fontSize: 32 }} />,
    color: '#ff7875',
    description: 'Full system access, manages all organizations',
    permissions: [
      'Manage all organizations',
      'Create and manage SUPER_ADMIN users',
      'Access all tenants across all organizations',
      'Configure system-wide settings',
      'View all audit logs',
      'No restrictions',
    ],
    access: ['All Organizations', 'All Tenants', 'All Pages', 'All Features'],
  },
  ADMIN: {
    icon: <SafetyOutlined style={{ fontSize: 32 }} />,
    color: '#b37feb',
    description: 'Manages users and tenants within their organization',
    permissions: [
      'Manage users in their organization',
      'Create and manage tenants',
      'Assign page permissions',
      'View organization audit logs',
      'Access all tenants in organization',
      'Cannot create SUPER_ADMIN users',
    ],
    access: ['Own Organization', 'All Tenants in Org', 'All Pages in Org', 'User Management'],
  },
  DEVELOPER: {
    icon: <BuildOutlined style={{ fontSize: 32 }} />,
    color: '#69c0ff',
    description: 'Can configure pages and access developer features',
    permissions: [
      'Create and configure pages',
      'Access page configuration UI',
      'View database metadata',
      'Test page configurations',
      'No user management access',
      'No tenant management access',
    ],
    access: ['Page Configuration', 'Metadata Access', 'Developer Tools'],
  },
  MANAGER: {
    icon: <TeamOutlined style={{ fontSize: 32 }} />,
    color: '#95de64',
    description: 'Access to all tenants and pages in organization',
    permissions: [
      'Access all tenants in organization',
      'View all pages in organization',
      'Export data from all pages',
      'Customize personal views',
      'No management capabilities',
    ],
    access: ['All Tenants in Org', 'All Pages in Org', 'Data Export', 'Custom Views'],
  },
  USER: {
    icon: <UserOutlined style={{ fontSize: 32 }} />,
    color: '#ffc069',
    description: 'Standard user with assigned tenant and page access',
    permissions: [
      'Access assigned tenants only',
      'View assigned pages only',
      'Export data (if permitted)',
      'Customize personal views',
      'No management capabilities',
    ],
    access: ['Assigned Tenants', 'Assigned Pages', 'Data Export (if permitted)', 'Custom Views'],
  },
};

export default function RolesAccessPage() {
  const { token } = theme.useToken();
  const { isDark } = useTheme();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'USER';

  // Define role hierarchy - roles that can be seen by each role
  const roleVisibility = {
    SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN', 'DEVELOPER', 'MANAGER', 'USER'],
    ADMIN: ['ADMIN', 'DEVELOPER', 'MANAGER', 'USER'],
    DEVELOPER: ['DEVELOPER', 'USER'],
    MANAGER: ['MANAGER', 'USER'],
    USER: ['USER'],
  };

  // Get visible roles based on current user's role
  const visibleRoles = roleVisibility[userRole] || roleVisibility.USER;

  // Filter role details to only show visible roles
  const filteredRoleDetails = Object.fromEntries(
    Object.entries(roleDetails).filter(([role]) => visibleRoles.includes(role))
  );

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const glassmorphismStyle = {
    background: isDark
      ? 'rgba(30, 30, 30, 0.85)'
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: isDark
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
  };

  return (
    <div
      style={{
        padding: token.paddingLG,
        maxWidth: 1400,
        margin: '0 auto',
        minHeight: 'calc(100vh - 64px)',
        background: isDark
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: token.marginXL }}>
          <Title
            level={1}
            style={{
              marginBottom: token.marginMD,
              color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
              fontSize: 32,
              fontWeight: 600,
            }}
          >
            Roles & Access Control
          </Title>
          <Paragraph
            style={{
              fontSize: 13,
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
              maxWidth: 800,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Our platform uses a hierarchical role-based access control (RBAC) system with five distinct roles,
            each with specific permissions and access levels.
          </Paragraph>
        </div>

        {/* Role Hierarchy Information - Show First */}
        <Card
          style={{
            marginTop: token.marginXL,
            borderRadius: 16,
            ...glassmorphismStyle,
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title
              level={3}
              style={{
                textAlign: 'center',
                color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                marginBottom: token.marginMD,
              }}
            >
              Role Hierarchy
            </Title>

            {/* Visual Hierarchy Flow */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: token.marginMD,
                padding: token.paddingLG,
              }}
            >
              {/* SUPER_ADMIN Level */}
              {visibleRoles.includes('SUPER_ADMIN') && (
                <>
                  <Card
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      borderRadius: 12,
                      borderTop: `4px solid ${roleDetails.SUPER_ADMIN.color}`,
                      background: isDark
                        ? hexToRgba(roleDetails.SUPER_ADMIN.color, 0.15)
                        : hexToRgba(roleDetails.SUPER_ADMIN.color, 0.1),
                      ...glassmorphismStyle,
                    }}
                    bodyStyle={{ padding: token.paddingMD }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                      <CrownOutlined
                        style={{ fontSize: 32, color: roleDetails.SUPER_ADMIN.color }}
                      />
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        SUPER_ADMIN
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Top level - Full system control
                      </Text>
                    </Space>
                  </Card>
                  {visibleRoles.length > 1 && (
                    <ArrowDownOutlined
                      style={{
                        fontSize: 24,
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  )}
                </>
              )}

              {/* ADMIN Level */}
              {visibleRoles.includes('ADMIN') && (
                <>
                  <Card
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      borderRadius: 12,
                      borderTop: `4px solid ${roleDetails.ADMIN.color}`,
                      background: isDark
                        ? hexToRgba(roleDetails.ADMIN.color, 0.15)
                        : hexToRgba(roleDetails.ADMIN.color, 0.1),
                      ...glassmorphismStyle,
                    }}
                    bodyStyle={{ padding: token.paddingMD }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                      <SafetyOutlined
                        style={{ fontSize: 32, color: roleDetails.ADMIN.color }}
                      />
                      <Text strong style={{ fontSize: 16, display: 'block' }}>
                        ADMIN
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Organization-level management
                      </Text>
                    </Space>
                  </Card>
                  {(visibleRoles.includes('DEVELOPER') ||
                    visibleRoles.includes('MANAGER') ||
                    visibleRoles.includes('USER')) && (
                    <ArrowDownOutlined
                      style={{
                        fontSize: 24,
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  )}
                </>
              )}

              {/* DEVELOPER and MANAGER Level (side by side) */}
              {(visibleRoles.includes('DEVELOPER') || visibleRoles.includes('MANAGER')) && (
                <>
                  <Row gutter={[16, 16]} justify="center" style={{ width: '100%' }}>
                    {visibleRoles.includes('DEVELOPER') && (
                      <Col xs={24} sm={12} md={12}>
                        <Card
                          style={{
                            width: '100%',
                            borderRadius: 12,
                            borderTop: `4px solid ${roleDetails.DEVELOPER.color}`,
                            background: isDark
                              ? hexToRgba(roleDetails.DEVELOPER.color, 0.15)
                              : hexToRgba(roleDetails.DEVELOPER.color, 0.1),
                            ...glassmorphismStyle,
                          }}
                          bodyStyle={{ padding: token.paddingMD }}
                        >
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: '100%', textAlign: 'center' }}
                          >
                            <BuildOutlined
                              style={{ fontSize: 28, color: roleDetails.DEVELOPER.color }}
                            />
                            <Text strong style={{ fontSize: 14, display: 'block' }}>
                              DEVELOPER
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Page configuration and development
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                    )}
                    {visibleRoles.includes('MANAGER') && (
                      <Col xs={24} sm={12} md={12}>
                        <Card
                          style={{
                            width: '100%',
                            borderRadius: 12,
                            borderTop: `4px solid ${roleDetails.MANAGER.color}`,
                            background: isDark
                              ? hexToRgba(roleDetails.MANAGER.color, 0.15)
                              : hexToRgba(roleDetails.MANAGER.color, 0.1),
                            ...glassmorphismStyle,
                          }}
                          bodyStyle={{ padding: token.paddingMD }}
                        >
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: '100%', textAlign: 'center' }}
                          >
                            <TeamOutlined
                              style={{ fontSize: 28, color: roleDetails.MANAGER.color }}
                            />
                            <Text strong style={{ fontSize: 14, display: 'block' }}>
                              MANAGER
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Organization-wide data access
                            </Text>
                          </Space>
                        </Card>
                      </Col>
                    )}
                  </Row>
                  {visibleRoles.includes('USER') && (
                    <ArrowDownOutlined
                      style={{
                        fontSize: 24,
                        color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  )}
                </>
              )}

              {/* USER Level */}
              {visibleRoles.includes('USER') && (
                <Card
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 12,
                    borderTop: `4px solid ${roleDetails.USER.color}`,
                    background: isDark
                      ? hexToRgba(roleDetails.USER.color, 0.15)
                      : hexToRgba(roleDetails.USER.color, 0.1),
                    ...glassmorphismStyle,
                  }}
                  bodyStyle={{ padding: token.paddingMD }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: 32, color: roleDetails.USER.color }} />
                    <Text strong style={{ fontSize: 16, display: 'block' }}>
                      USER
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Assigned tenant and page access only
                    </Text>
                  </Space>
                </Card>
              )}
            </div>

            <Divider
              style={{
                margin: `${token.marginMD}px 0`,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            />

            <Paragraph
              style={{
                textAlign: 'center',
                color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                marginBottom: 0,
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              Permissions flow downward in the hierarchy. Higher roles inherit and extend permissions
              of lower roles. When assigning roles, ensure users have the minimum access required for
              their responsibilities.
            </Paragraph>
          </Space>
        </Card>

        {/* Role Cards Grid - Show After Hierarchy */}
        <Row gutter={[24, 24]}>
          {Object.entries(filteredRoleDetails).map(([role, details]) => (
            <Col xs={24} sm={24} md={12} lg={8} key={role}>
              <Card
                style={{
                  height: '100%',
                  borderRadius: 16,
                  ...glassmorphismStyle,
                  borderTop: `4px solid ${details.color}`,
                }}
                bodyStyle={{ padding: token.paddingLG }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: details.color, marginBottom: token.marginSM }}>
                      {details.icon}
                    </div>
                    <Tag
                      color={details.color}
                      style={{
                        fontSize: 14,
                        padding: '4px 16px',
                        fontWeight: 600,
                        marginBottom: token.marginXS,
                      }}
                    >
                      {role}
                    </Tag>
                    <Paragraph
                      style={{
                        marginTop: token.marginSM,
                        marginBottom: 0,
                        color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                        fontSize: 14,
                      }}
                    >
                      {details.description}
                    </Paragraph>
                  </div>

                  <Divider
                    style={{
                      margin: `${token.marginSM}px 0`,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        display: 'block',
                        marginBottom: token.marginXS,
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
                      }}
                    >
                      Key Permissions:
                    </Text>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {details.permissions.map((permission, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <CheckCircleOutlined
                            style={{
                              color: details.color,
                              fontSize: 14,
                              marginTop: 4,
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                              lineHeight: 1.6,
                            }}
                          >
                            {permission}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </div>

                  <Divider
                    style={{
                      margin: `${token.marginSM}px 0`,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        display: 'block',
                        marginBottom: token.marginXS,
                        color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)',
                      }}
                    >
                      Access Levels:
                    </Text>
                    <Space wrap size="small" style={{ width: '100%' }}>
                      {details.access.map((access, idx) => (
                        <Tag key={idx} color="blue" style={{ fontSize: 11 }}>
                          {access}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
}

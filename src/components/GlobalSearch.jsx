import { useState, useEffect, useMemo, useRef } from 'react';
import React from 'react';
import { Modal, Input, List, Typography, Space, Tag, Empty, Divider } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getSearchableHelpItems } from '../data/helpContent';
import useAuthStore from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';
import { theme as antdTheme } from 'antd';
import { protectedRoutes } from '../config/routes';

const { Text, Title } = Typography;

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'USER';
  const pagesConfig = useAuthStore((state) => state.pagesConfig);
  const { isDark } = useTheme();
  const { token } = antdTheme.useToken();
  const inputRef = useRef(null);

  // Get searchable help items
  const helpItems = useMemo(() => getSearchableHelpItems(userRole), [userRole]);

  // Get searchable pages
  const searchablePages = useMemo(() => {
    if (!Array.isArray(pagesConfig)) return [];
    return pagesConfig.map((page) => ({
      type: 'page',
      id: page.page_key,
      title: page.title || page.page_key,
      description: `View data from ${page.title || page.page_key}`,
      path: `/pages/${page.page_key}`,
      icon: <FileTextOutlined />,
    }));
  }, [pagesConfig]);

  // Get searchable routes with proper icons
  const searchableRoutes = useMemo(() => {
    return protectedRoutes
      .filter((route) => {
        if (!route.label) return false;
        if (route.adminOnly && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') return false;
        if (route.developerOnly && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && userRole !== 'DEVELOPER') return false;
        return true;
      })
      .map((route) => {
        let icon = <HomeOutlined />;
        if (route.key === 'page-config') icon = <SettingOutlined />;
        else if (route.key === 'users') icon = <UserOutlined />;
        else if (route.key === 'tenants') icon = <TeamOutlined />;
        else if (route.key === 'organizations') icon = <BankOutlined />;
        else if (route.key === 'audit-logs') icon = <AuditOutlined />;
        else if (route.key === 'home') icon = <HomeOutlined />;

        return {
          type: 'route',
          id: route.key,
          title: route.label,
          description: `Navigate to ${route.label}`,
          path: route.path,
          icon,
        };
      });
  }, [userRole]);

  // Combine all searchable items
  const allSearchableItems = useMemo(() => {
    const helpItemsFormatted = helpItems.map((item) => ({
      type: 'help',
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.categoryTitle,
      path: null, // Help items open in Help Center
      icon: item.categoryIcon ? React.createElement(item.categoryIcon) : <QuestionCircleOutlined />,
      item: item, // Store original item for navigation
    }));

    return [...searchableRoutes, ...searchablePages, ...helpItemsFormatted];
  }, [helpItems, searchableRoutes, searchablePages]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return [];
    const searchLower = searchText.toLowerCase();
    return allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.category && item.category.toLowerCase().includes(searchLower))
    );
  }, [searchText, allSearchableItems]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups = {
      routes: [],
      pages: [],
      help: [],
    };
    filteredItems.forEach((item) => {
      if (item.type === 'route') groups.routes.push(item);
      else if (item.type === 'page') groups.pages.push(item);
      else if (item.type === 'help') groups.help.push(item);
    });
    return groups;
  }, [filteredItems]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      // Don't trigger if user is typing in an input/textarea
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'k' &&
        e.target.tagName !== 'INPUT' &&
        e.target.tagName !== 'TEXTAREA' &&
        !e.target.isContentEditable
      ) {
        e.preventDefault();
        setOpen(true);
      }
      // ESC to close
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setSearchText('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      // Use a longer timeout to ensure modal is fully rendered
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select(); // Select any existing text
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = (item) => {
    if (item.path) {
      navigate(item.path);
      setOpen(false);
      setSearchText('');
    } else if (item.type === 'help') {
      // For help items, we'll trigger the Help Center to open
      // We can use a custom event or store the selected item
      // For now, just close and let user open Help Center manually
      // In the future, we could add a context or event emitter
      setOpen(false);
      setSearchText('');
      // Dispatch custom event to open Help Center with item
      window.dispatchEvent(
        new CustomEvent('openHelpCenter', {
          detail: { item: item.item },
        })
      );
    }
  };

  const glassmorphismStyle = {
    background: isDark
      ? 'rgba(30, 30, 30, 0.95)'
      : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.8)',
    boxShadow: isDark
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5)',
  };

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setSearchText('');
      }}
      footer={null}
      width={600}
      styles={{
        content: {
          padding: 0,
          ...glassmorphismStyle,
          borderRadius: 16,
        },
        mask: {
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        },
      }}
      destroyOnHidden
      closable={false}
    >
      <div style={{ padding: token.paddingLG }}>
        <Input
          ref={inputRef}
          autoFocus
          placeholder="Search pages, help articles, and navigation..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          style={{
            marginBottom: token.marginMD,
            borderRadius: 8,
          }}
          suffix={
            <Tag
              style={{
                fontSize: 11,
                padding: '2px 6px',
                margin: 0,
                lineHeight: 1.5,
                fontFamily: 'monospace',
              }}
            >
              {isMac ? '⌘' : 'Ctrl'}+K
            </Tag>
          }
          onKeyDown={(e) => {
            // Handle Enter key to select first result
            if (e.key === 'Enter' && filteredItems.length > 0) {
              handleSelect(filteredItems[0]);
            }
            // Handle Escape to close
            if (e.key === 'Escape') {
              setOpen(false);
              setSearchText('');
            }
          }}
        />

        {!searchText.trim() ? (
          <div style={{ textAlign: 'center', padding: token.paddingXL }}>
            <SearchOutlined
              style={{
                fontSize: 48,
                color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                marginBottom: token.marginMD,
              }}
            />
            <Text
              type="secondary"
              style={{
                display: 'block',
                fontSize: 14,
              }}
            >
              Start typing to search across pages, help articles, and navigation
            </Text>
            <Text
              type="secondary"
              style={{
                display: 'block',
                fontSize: 12,
                marginTop: token.marginXS,
                opacity: 0.7,
              }}
            >
              Press {isMac ? '⌘' : 'Ctrl'}+K anytime to open search
            </Text>
          </div>
        ) : filteredItems.length === 0 ? (
          <Empty
            description="No results found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: token.paddingXL }}
          />
        ) : (
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {groupedResults.routes.length > 0 && (
                <div>
                  <Title level={5} style={{ marginBottom: token.marginXS, fontSize: 12, fontWeight: 600 }}>
                    Navigation
                  </Title>
                  <List
                    size="small"
                    dataSource={groupedResults.routes}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          padding: token.paddingSM,
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Space>
                          <span style={{ color: token.colorPrimary, fontSize: 16 }}>{item.icon}</span>
                          <div>
                            <Text strong style={{ display: 'block', fontSize: 13 }}>
                              {item.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {item.description}
                            </Text>
                          </div>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {groupedResults.pages.length > 0 && (
                <div>
                  {groupedResults.routes.length > 0 && (
                    <Divider style={{ margin: `${token.marginSM}px 0` }} />
                  )}
                  <Title level={5} style={{ marginBottom: token.marginXS, fontSize: 12, fontWeight: 600 }}>
                    Pages
                  </Title>
                  <List
                    size="small"
                    dataSource={groupedResults.pages}
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          padding: token.paddingSM,
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Space>
                          <span style={{ color: token.colorPrimary, fontSize: 16 }}>{item.icon}</span>
                          <div>
                            <Text strong style={{ display: 'block', fontSize: 13 }}>
                              {item.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {item.description}
                            </Text>
                          </div>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}

              {groupedResults.help.length > 0 && (
                <div>
                  {(groupedResults.routes.length > 0 || groupedResults.pages.length > 0) && (
                    <Divider style={{ margin: `${token.marginSM}px 0` }} />
                  )}
                  <Title level={5} style={{ marginBottom: token.marginXS, fontSize: 12, fontWeight: 600 }}>
                    Help Articles
                  </Title>
                  <List
                    size="small"
                    dataSource={groupedResults.help.slice(0, 5)} // Limit to 5 help results
                    renderItem={(item) => (
                      <List.Item
                        style={{
                          cursor: 'pointer',
                          padding: token.paddingSM,
                          borderRadius: 8,
                          transition: 'all 0.2s',
                        }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Space>
                          <span style={{ color: token.colorPrimary, fontSize: 16 }}>{item.icon}</span>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ display: 'block', fontSize: 13 }}>
                              {item.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {item.description}
                            </Text>
                            {item.category && (
                              <Tag color="blue" style={{ fontSize: 10, marginTop: 4 }}>
                                {item.category}
                              </Tag>
                            )}
                          </div>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Space>
          </div>
        )}
      </div>
    </Modal>
  );
}


import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import {
  FloatButton,
  Drawer,
  Input,
  List,
  Typography,
  Card,
  Space,
  Tag,
  Tabs,
  Empty,
  Collapse,
  Button,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  QuestionCircleOutlined,
  SearchOutlined,
  CloseOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { getHelpContentByRole, getSearchableHelpItems } from '../data/helpContent';
import useAuthStore from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { theme as antdTheme } from 'antd';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function HelpCenter() {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'USER';
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { token } = antdTheme.useToken();

  // Get role-filtered content
  const helpContent = useMemo(
    () => getHelpContentByRole(userRole),
    [userRole]
  );

  const searchableItems = useMemo(
    () => getSearchableHelpItems(userRole),
    [userRole]
  );

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return searchableItems;
    const searchLower = searchText.toLowerCase();
    return searchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.categoryTitle.toLowerCase().includes(searchLower)
    );
  }, [searchText, searchableItems]);

  // Group filtered items by category
  const groupedResults = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = {
          category: {
            id: item.categoryId,
            title: item.categoryTitle,
            icon: item.categoryIcon,
            color: item.categoryColor,
          },
          items: [],
        };
      }
      groups[item.categoryId].items.push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedCategory(item.categoryId);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
    setSelectedCategory(null);
    setSearchText('');
  };

  // Listen for custom event from GlobalSearch to open Help Center with specific item
  useEffect(() => {
    const handleOpenHelpCenter = (event) => {
      const { item } = event.detail || {};
      if (item) {
        setOpen(true);
        setSelectedItem(item);
        setSelectedCategory(item.categoryId);
        setSearchText(''); // Clear search when opening from global search
      }
    };

    window.addEventListener('openHelpCenter', handleOpenHelpCenter);
    return () => {
      window.removeEventListener('openHelpCenter', handleOpenHelpCenter);
    };
  }, []);

  const categories = Object.values(helpContent);

  return (
    <>
      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24, bottom: 80 }}
        onClick={() => setOpen(true)}
        tooltip="Help & Guides"
      />
      <Drawer
        title={
          <Space>
            <QuestionCircleOutlined />
            <span>Help Center</span>
            {userRole && (
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {userRole}
              </Tag>
            )}
          </Space>
        }
        placement="right"
        width={700}
        open={open}
        onClose={handleClose}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleClose}
          />
        }
      >
        {selectedItem ? (
          // Detail view
          <div>
            <Button
              type="link"
              onClick={handleBackToList}
              style={{ padding: 0, marginBottom: 16 }}
            >
              ← Back to Help Center
            </Button>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Tag
                    color={selectedItem.categoryColor}
                    icon={selectedItem.categoryIcon ? React.createElement(selectedItem.categoryIcon) : null}
                    style={{ marginBottom: 8 }}
                  >
                    {selectedItem.categoryTitle}
                  </Tag>
                  <Title level={3} style={{ marginTop: 8, marginBottom: 8 }}>
                    {selectedItem.title}
                  </Title>
                  <Paragraph type="secondary">{selectedItem.description}</Paragraph>
                </div>
                <Divider />
                <div
                  dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                  style={{
                    lineHeight: 1.8,
                  }}
                />
                {selectedItem.steps && selectedItem.steps.length > 0 && (
                  <div>
                    <Title level={5}>Quick Steps:</Title>
                    <List
                      size="small"
                      dataSource={selectedItem.steps}
                      renderItem={(step, index) => (
                        <List.Item>
                          <Space>
                            <Tag color="blue">{index + 1}</Tag>
                            <Text>{step}</Text>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </div>
                )}
              </Space>
            </Card>
          </div>
        ) : (
          // List view
          <div>
            <Input
              placeholder="Search help articles..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              allowClear
              style={{ marginBottom: 24 }}
            />

            {/* Quick Links Section - Only show when not searching and user is admin */}
            {!searchText.trim() && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ marginBottom: 12 }}>
                  Quick Links
                </Title>
                <Row gutter={[12, 12]}>
                  <Col span={24}>
                    <Card
                      hoverable
                      onClick={() => {
                        navigate('/roles-access');
                        setOpen(false);
                      }}
                      style={{
                        borderRadius: 12,
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
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      bodyStyle={{ padding: 16 }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isDark
                          ? '0 12px 40px 0 rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                          : '0 12px 40px 0 rgba(31, 38, 135, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%', textAlign: 'center' }}>
                        <SafetyOutlined
                          style={{
                            fontSize: 32,
                            color: '#722ed1',
                          }}
                        />
                        <Text strong style={{ display: 'block', fontSize: 14 }}>
                          Roles & Access
                        </Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, display: 'block' }}
                        >
                          Understand permissions
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </div>
            )}

            {searchText.trim() ? (
              // Search results
              <div>
                <Title level={5}>
                  Search Results ({filteredItems.length})
                </Title>
                {filteredItems.length === 0 ? (
                  <Empty
                    description="No help articles found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {Object.values(groupedResults).map((group) => (
                      <Card
                        key={group.category.id}
                        size="small"
                        title={
                          <Space>
                            {group.category.icon ? React.createElement(group.category.icon) : null}
                            <span>{group.category.title}</span>
                          </Space>
                        }
                      >
                        <List
                          dataSource={group.items}
                          renderItem={(item) => (
                            <List.Item
                              style={{ cursor: 'pointer', padding: '12px' }}
                              onClick={() => handleItemClick(item)}
                            >
                              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Text strong>{item.title}</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {item.description}
                                </Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </Card>
                    ))}
                  </Space>
                )}
              </div>
            ) : (
              // Category view
              <Tabs
                defaultActiveKey={categories[0]?.id}
                items={categories.map((category) => ({
                  key: category.id,
                  label: (
                    <Space>
                      {category.icon ? React.createElement(category.icon) : null}
                      <span>{category.title}</span>
                    </Space>
                  ),
                  children: (
                    <Collapse
                      defaultActiveKey={category.items[0]?.id}
                      style={{ background: 'transparent' }}
                    >
                      {category.items.map((item) => (
                        <Panel
                          key={item.id}
                          header={
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <Text strong>{item.title}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {item.description}
                              </Text>
                            </Space>
                          }
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: item.content }}
                            style={{ lineHeight: 1.8 }}
                          />
                          {item.steps && item.steps.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                              <Title level={5}>Quick Steps:</Title>
                              <List
                                size="small"
                                dataSource={item.steps}
                                renderItem={(step, index) => (
                                  <List.Item>
                                    <Space>
                                      <Tag color="blue">{index + 1}</Tag>
                                      <Text>{step}</Text>
                                    </Space>
                                  </List.Item>
                                )}
                              />
                            </div>
                          )}
                          <Button
                            type="link"
                            onClick={() => handleItemClick(item)}
                            style={{ padding: 0, marginTop: 8 }}
                          >
                            View Full Article →
                          </Button>
                        </Panel>
                      ))}
                    </Collapse>
                  ),
                }))}
              />
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}


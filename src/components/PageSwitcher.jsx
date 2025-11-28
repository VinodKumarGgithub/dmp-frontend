import { useState } from 'react';
import { FloatButton, Popover, List, Input, Space, Typography, theme as antdTheme } from 'antd';
import {
  AppstoreOutlined,
  SearchOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  HeartOutlined,
  ShoppingOutlined,
  BankOutlined,
  CalendarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const { Text } = Typography;

// Function to get relevant icon based on page content
const getPageIcon = (pageKey, title) => {
  const searchText = `${pageKey || ''} ${title || ''}`.toLowerCase();
  
  if (searchText.includes('drug') || searchText.includes('medication') || searchText.includes('medicine')) {
    return MedicineBoxOutlined;
  }
  if (searchText.includes('patient')) {
    return UserOutlined;
  }
  if (searchText.includes('user') || searchText.includes('staff')) {
    return TeamOutlined;
  }
  if (searchText.includes('report') || searchText.includes('analytics')) {
    return BarChartOutlined;
  }
  if (searchText.includes('data') || searchText.includes('table')) {
    return DatabaseOutlined;
  }
  if (searchText.includes('lab') || searchText.includes('test') || searchText.includes('experiment')) {
    return ExperimentOutlined;
  }
  if (searchText.includes('cardiac') || searchText.includes('heart')) {
    return HeartOutlined;
  }
  if (searchText.includes('order') || searchText.includes('purchase')) {
    return ShoppingOutlined;
  }
  if (searchText.includes('billing') || searchText.includes('payment') || searchText.includes('financial')) {
    return BankOutlined;
  }
  if (searchText.includes('schedule') || searchText.includes('appointment')) {
    return CalendarOutlined;
  }
  if (searchText.includes('config') || searchText.includes('setting')) {
    return SettingOutlined;
  }
  if (searchText.includes('pbm') || searchText.includes('gcn')) {
    return MedicineBoxOutlined;
  }
  
  // Default icon
  return FileTextOutlined;
};

export default function PageSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const pagesConfig = useAuthStore((state) => state.pagesConfig);
  const { token } = antdTheme.useToken();
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);

  const pages = Array.isArray(pagesConfig) ? pagesConfig : [];
  
  // Filter pages based on search
  const filteredPages = pages.filter((page) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      (page.title || '').toLowerCase().includes(searchLower) ||
      (page.page_key || '').toLowerCase().includes(searchLower)
    );
  });

  const handlePageClick = (pageKey) => {
    navigate(`/pages/${pageKey}`);
    setOpen(false);
    setSearchText('');
  };

  const content = (
    <div style={{ width: 300, maxHeight: 400, overflow: 'auto' }}>
      <Input
        placeholder="Search pages..."
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: token.marginSM }}
        allowClear
      />
      <List
        size="small"
        dataSource={filteredPages}
        locale={{
          emptyText: searchText ? 'No pages found' : 'No pages configured',
        }}
        renderItem={(page) => {
          const isActive = location.pathname === `/pages/${page.page_key}`;
          const IconComponent = getPageIcon(page.page_key, page.title);
          return (
            <List.Item
              style={{
                cursor: 'pointer',
                backgroundColor: isActive ? token.colorPrimaryBg : 'transparent',
                borderRadius: token.borderRadius,
                padding: token.paddingXS,
                marginBottom: token.marginXS,
              }}
              onClick={() => handlePageClick(page.page_key)}
            >
              <Space>
                <IconComponent style={{ color: isActive ? token.colorPrimary : token.colorTextSecondary }} />
                <div>
                  <div style={{ fontWeight: isActive ? token.fontWeightStrong : 'normal' }}>
                    {page.title || page.page_key}
                  </div>
                  {page.title && (
                    <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {page.page_key}
                    </Text>
                  )}
                </div>
              </Space>
            </List.Item>
          );
        }}
      />
    </div>
  );

  return (
    <Popover
      content={content}
      title="Switch Pages"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="leftTop"
    >
      <FloatButton
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<AppstoreOutlined />}
        tooltip="Switch Pages"
      />
    </Popover>
  );
}


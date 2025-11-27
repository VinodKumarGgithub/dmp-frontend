import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Typography,
  message,
  theme as antdTheme,
  Tag,
  Breadcrumb,
  Tooltip,
  Drawer,
  Descriptions,
  ColorPicker,
  Upload,
  Tabs,
  Image,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  ShopOutlined,
  SearchOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useOrganizations, useCreateOrganization, useUpdateOrganizationBranding, useCheckSubdomainAvailability } from '../api/organizations';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Branding Preview Component (Phase 3)
const BrandingPreview = ({ branding, form }) => {
  const { token } = antdTheme.useToken();
  const primaryColor = Form.useWatch('primary_color', form) || branding?.primary_color || '#1890ff';
  const logoUrl = Form.useWatch('logo_url', form) || branding?.logo_url;
  const appName = Form.useWatch('app_name', form) || branding?.app_name || 'App Name';
  const name = Form.useWatch('name', form) || branding?.name || 'Organization Name';

  return (
    <Card
      title="Branding Preview"
      size="small"
      style={{
        border: `2px solid ${primaryColor}`,
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Header Preview */}
        <div
          style={{
            padding: 16,
            backgroundColor: primaryColor,
            borderRadius: 4,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <Text strong style={{ color: '#fff', fontSize: 16 }}>
            {appName || name}
          </Text>
        </div>

        {/* Login Page Preview */}
        <div
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: 4,
            padding: 24,
            textAlign: 'center',
            backgroundColor: token.colorBgContainer,
          }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              style={{ maxHeight: 60, width: 'auto', marginBottom: 16 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <Title level={4} style={{ color: primaryColor, marginBottom: 8 }}>
            {appName || name}
          </Title>
          <Text type="secondary">Login to your account</Text>
        </div>
      </Space>
    </Card>
  );
};

/**
 * Normalize color value from ColorPicker to hex string
 * Handles Color objects, hex strings, and other formats
 */
function normalizeColorValue(color) {
  if (!color) return '';
  
  // If already a string, validate and normalize
  if (typeof color === 'string') {
    // Remove any whitespace
    const trimmed = color.trim();
    // If it's a valid hex, return it (normalize to 6-digit)
    if (/^#[0-9A-Fa-f]{3,8}$/i.test(trimmed)) {
      // Convert 3-digit to 6-digit hex
      if (trimmed.length === 4) {
        return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toUpperCase();
      }
      // Return 6-digit hex (first 7 chars: #RRGGBB)
      return trimmed.substring(0, 7).toUpperCase();
    }
    return trimmed;
  }
  
  // Handle Color object from antd
  if (color && typeof color === 'object') {
    // Try toHexString() method (antd Color object)
    if (typeof color.toHexString === 'function') {
      const hex = color.toHexString();
      return hex.substring(0, 7).toUpperCase(); // Remove alpha if present
    }
    // Try toHex() method
    if (typeof color.toHex === 'function') {
      const hex = color.toHex();
      return hex.substring(0, 7).toUpperCase();
    }
    // Try toString() method
    if (typeof color.toString === 'function') {
      const str = color.toString();
      if (/^#[0-9A-Fa-f]{3,8}$/i.test(str)) {
        return str.substring(0, 7).toUpperCase();
      }
    }
  }
  
  // Fallback: convert to string
  return String(color);
}

/**
 * Generate subdomain from organization name
 */
function generateSubdomainFromName(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .substring(0, 63);
}

export default function OrganizationManagement() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const [searchText, setSearchText] = useState('');
  const { data: organizationsData, isLoading } = useOrganizations({ search: searchText });
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganizationBranding();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [form] = Form.useForm();

  // Watch form subdomain value directly
  const formSubdomain = Form.useWatch('subdomain', form) || '';
  
  // Debounce subdomain for availability check
  const debouncedSubdomain = useDebounce(formSubdomain, 500);
  
  // Check availability (only when creating)
  const shouldCheckAvailability = !editingOrganization && debouncedSubdomain && debouncedSubdomain.trim().length >= 2;
  const { data: availabilityData, isLoading: checkingAvailability } = useCheckSubdomainAvailability(
    debouncedSubdomain,
    { enabled: shouldCheckAvailability }
  );
  
  // Response format: { success: true, data: { available: boolean, suggestions: [] }, message: '...' }
  const availability = availabilityData?.data || { available: null, suggestions: [] };

  const organizations = organizationsData?.data || (Array.isArray(organizationsData) ? organizationsData : []);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleAdd = () => {
    setEditingOrganization(null);
    form.resetFields();
    setLogoPreview(null);
    // Don't set ID - it will be auto-generated
    form.setFieldsValue({
      primary_color: '#1890ff',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (org) => {
    setEditingOrganization(org);
    const brandingJson = org.branding_json ? (typeof org.branding_json === 'string' ? JSON.parse(org.branding_json) : org.branding_json) : {};
    
    form.setFieldsValue({
      // Don't set ID - it's internal, not editable
      subdomain: org.subdomain,
      name: org.name, // Name first
      logo_url: org.logo_url || '',
      primary_color: org.primary_color || '#1890ff',
      app_name: org.app_name || '',
      app_short_name: brandingJson.app_short_name || '',
      favicon_url: brandingJson.favicon_url || '',
      secondary_color: brandingJson.secondary_color || '',
      email_footer_text: brandingJson.email_footer_text || '',
      support_email: brandingJson.support_email || '',
      support_phone: brandingJson.support_phone || '',
      custom_css: brandingJson.custom_css || '',
    });
    
    // Set logo preview if logo_url exists
    if (org.logo_url) {
      setLogoPreview(org.logo_url);
    } else {
      setLogoPreview(null);
    }
    
    setIsModalOpen(true);
  };

  // Auto-generate subdomain when name changes (only when creating)
  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingOrganization && name) {
      const generated = generateSubdomainFromName(name);
      if (generated) {
        form.setFieldsValue({ subdomain: generated });
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Organization ID is now auto-generated by backend - don't send it
      const brandingJson = {
        app_short_name: values.app_short_name || undefined,
        favicon_url: values.favicon_url || undefined,
        secondary_color: values.secondary_color || undefined,
        email_footer_text: values.email_footer_text || undefined,
        support_email: values.support_email || undefined,
        support_phone: values.support_phone || undefined,
        custom_css: values.custom_css || undefined,
      };

      // Remove undefined values
      Object.keys(brandingJson).forEach(key => {
        if (brandingJson[key] === undefined || brandingJson[key] === '') {
          delete brandingJson[key];
        }
      });

      const updateData = {
        subdomain: values.subdomain,
        name: values.name,
        logo_url: values.logo_url || null,
        primary_color: values.primary_color || '#1890ff',
        app_name: values.app_name || null,
        branding_json: Object.keys(brandingJson).length > 0 ? brandingJson : undefined,
      };

      if (editingOrganization) {
        // Update existing - use existing ID
        await updateMutation.mutateAsync({
          id: editingOrganization.id,
          data: updateData,
        });
      } else {
        // Create new - backend will auto-generate ID
        // Don't send 'id' field - let backend generate it
        await createMutation.mutateAsync(updateData);
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingOrganization(null);
      setLogoPreview(null);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleLogoUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setLogoPreview(base64);
      form.setFieldsValue({ logo_url: base64 });
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  const handleViewMore = (org) => {
    setSelectedOrganization(org);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedOrganization(null);
  };

  const columns = [
    {
      title: 'Logo',
      key: 'logo',
      width: 80,
      render: (_, record) => {
        if (record.logo_url) {
          return (
            <img
              src={record.logo_url}
              alt="Logo"
              style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          );
        }
        return (
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: token.colorFillTertiary,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShopOutlined style={{ color: token.colorTextSecondary }} />
          </div>
        );
      },
    },
    {
      title: 'Subdomain',
      dataIndex: 'subdomain',
      key: 'subdomain',
      width: 120,
      render: (subdomain) => (
        <Tag color="blue">{subdomain}</Tag>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'App Name',
      dataIndex: 'app_name',
      key: 'app_name',
      width: 150,
      render: (appName) => appName || <Text type="secondary">-</Text>,
    },
    {
      title: 'Primary Color',
      dataIndex: 'primary_color',
      key: 'primary_color',
      width: 120,
      render: (color) => (
        <Space>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color || '#1890ff',
              border: `1px solid ${token.colorBorder}`,
              borderRadius: 4,
            }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {color || '#1890ff'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'More',
      key: 'more',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="link"
            icon={<MoreOutlined />}
            onClick={() => handleViewMore(record)}
            style={{ color: token.colorPrimary }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Organization">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: token.paddingLG }}>
      <Breadcrumb
        style={{ marginBottom: token.marginMD }}
        items={[
          {
            title: (
              <Link to="/">
                <HomeOutlined /> Home
              </Link>
            ),
          },
          {
            title: (
              <Space>
                <ShopOutlined />
                <span>Organization Management</span>
              </Space>
            ),
          },
        ]}
      />
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: token.marginLG,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            <ShopOutlined /> Organization Management
          </Title>
          <Space>
            <Input
              placeholder="Search by name or subdomain..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
            {isSuperAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                Add New Organization
              </Button>
            )}
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={organizations}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} organization${total !== 1 ? 's' : ''}`,
          }}
        />
      </Card>

      <Modal
        title={editingOrganization ? 'Edit Organization Branding' : 'Create New Organization'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingOrganization(null);
          setLogoPreview(null);
        }}
        onOk={() => form.submit()}
        width={900}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingOrganization ? 'Update' : 'Create'}
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs
            defaultActiveKey="core"
            items={[
              {
                key: 'core',
                label: 'Core Information',
                children: (
                  <>
                    {/* Organization Name - MOVED TO FIRST */}
                    <Form.Item
                      name="name"
                      label="Organization Name"
                      rules={[
                        { required: true, message: 'Please enter organization name' },
                        { min: 2, message: 'Name must be at least 2 characters' },
                        { max: 100, message: 'Name must be less than 100 characters' },
                      ]}
                    >
                      <Input 
                        placeholder="e.g., Acme Corporation" 
                        onChange={handleNameChange}
                      />
                    </Form.Item>

                    {/* Subdomain - MOVED TO SECOND */}
                    <Form.Item
                      name="subdomain"
                      label="Subdomain"
                      rules={[
                        { required: true, message: 'Please enter subdomain' },
                        { pattern: /^[a-z0-9][a-z0-9_-]{0,62}$/i, message: 'Invalid subdomain format' },
                      ]}
                      help={
                        !editingOrganization && debouncedSubdomain && debouncedSubdomain.trim().length >= 2 && (
                          checkingAvailability ? (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Checking...
                            </Text>
                          ) : availability.available === true ? (
                            <Text type="success" style={{ fontSize: 12 }}>
                              ✅ Available
                            </Text>
                          ) : availability.available === false ? (
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                              <Text type="danger" style={{ fontSize: 12 }}>
                                ❌ Already taken
                              </Text>
                              {availability.suggestions?.length > 0 && (
                                <Space size={4} wrap>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Try:</Text>
                                  {availability.suggestions.map((suggestion) => (
                                    <Tag
                                      key={suggestion}
                                      color="blue"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => {
                                        form.setFieldsValue({ subdomain: suggestion });
                                      }}
                                    >
                                      {suggestion}
                                    </Tag>
                                  ))}
                                </Space>
                              )}
                            </Space>
                          ) : null
                        )
                      }
                    >
                      <Input placeholder="e.g., acme" />
                    </Form.Item>

                    {/* Organization ID - REMOVED (will be auto-generated) */}
                    {/* This field is now hidden and auto-generated internally */}
                    
                    <Form.Item
                      name="app_name"
                      label="App Name"
                      rules={[
                        { max: 100, message: 'App name must be less than 100 characters' },
                      ]}
                    >
                      <Input placeholder="Custom application name" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'branding',
                label: 'Branding',
                children: (
                  <>
                    <BrandingPreview branding={editingOrganization} form={form} />
                    <Divider />
                    <Form.Item
                      name="logo_url"
                      label={
                        <Space>
                          <span>Logo</span>
                          <Tooltip title="Upload image or enter URL/base64">
                            <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value && !logoPreview) {
                              return Promise.resolve(); // Optional
                            }
                            if (value && !value.startsWith('data:') && !value.startsWith('http')) {
                              return Promise.reject(new Error('Must be a valid URL or base64 image'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Upload
                          showUploadList={false}
                          beforeUpload={handleLogoUpload}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                        {logoPreview && (
                          <div style={{ marginTop: 8 }}>
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              style={{ maxWidth: 200, maxHeight: 100, objectFit: 'contain' }}
                              preview={{
                                mask: <EyeOutlined />,
                              }}
                            />
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                setLogoPreview(null);
                                form.setFieldsValue({ logo_url: '' });
                              }}
                              style={{ marginLeft: 8 }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <Input
                          placeholder="Or enter URL or base64: https://example.com/logo.png"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value && (value.startsWith('http') || value.startsWith('data:'))) {
                              setLogoPreview(value);
                            } else if (!value) {
                              setLogoPreview(null);
                            }
                          }}
                        />
                      </Space>
                    </Form.Item>

                    <Form.Item
                      name="primary_color"
                      label="Primary Color"
                      rules={[
                        { required: true, message: 'Please select primary color' },
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.reject(new Error('Please select primary color'));
                            }
                            // Normalize color value
                            const hexValue = normalizeColorValue(value);
                            if (hexValue && /^#[0-9A-Fa-f]{6}$/i.test(hexValue)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Color must be a valid hex code (e.g., #1890ff)'));
                          },
                        },
                      ]}
                      getValueFromEvent={(color) => {
                        return normalizeColorValue(color);
                      }}
                    >
                      <ColorPicker
                        showText
                        format="hex"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="secondary_color"
                      label="Secondary Color"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value) {
                              return Promise.resolve(); // Optional field
                            }
                            // Normalize color value
                            const hexValue = normalizeColorValue(value);
                            if (hexValue && /^#[0-9A-Fa-f]{6}$/i.test(hexValue)) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Color must be a valid hex code'));
                          },
                        },
                      ]}
                      getValueFromEvent={(color) => {
                        return normalizeColorValue(color);
                      }}
                    >
                      <ColorPicker
                        showText
                        format="hex"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="app_short_name"
                      label="App Short Name"
                      rules={[
                        { max: 50, message: 'Short name must be less than 50 characters' },
                      ]}
                    >
                      <Input placeholder="Short version of app name" />
                    </Form.Item>

                    <Form.Item
                      name="favicon_url"
                      label="Favicon URL"
                      rules={[
                        { type: 'url', message: 'Please enter a valid URL' },
                      ]}
                    >
                      <Input placeholder="https://example.com/favicon.ico" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'advanced',
                label: 'Advanced',
                children: (
                  <>
                    <Form.Item
                      name="support_email"
                      label="Support Email"
                      rules={[
                        { type: 'email', message: 'Please enter a valid email address' },
                      ]}
                    >
                      <Input placeholder="support@example.com" />
                    </Form.Item>

                    <Form.Item
                      name="support_phone"
                      label="Support Phone"
                      rules={[
                        { max: 20, message: 'Phone number must be less than 20 characters' },
                      ]}
                    >
                      <Input placeholder="+1-234-567-8900" />
                    </Form.Item>

                    <Form.Item
                      name="email_footer_text"
                      label="Email Footer Text"
                      rules={[
                        { max: 500, message: 'Footer text must be less than 500 characters' },
                      ]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Custom text for email footers"
                      />
                    </Form.Item>

                    <Form.Item
                      name="custom_css"
                      label={
                        <Space>
                          <span>Custom CSS</span>
                          <Tooltip title="Additional CSS styles for custom branding">
                            <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { max: 5000, message: 'CSS must be less than 5000 characters' },
                      ]}
                    >
                      <TextArea
                        rows={6}
                        placeholder=".custom-class { color: #1890ff; }"
                      />
                    </Form.Item>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      <Drawer
        title="Organization Details"
        placement="right"
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        width={600}
      >
        {selectedOrganization && (
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{
              fontWeight: token.fontWeightStrong,
              width: '40%',
              background: token.colorFillAlter,
            }}
            contentStyle={{
              background: token.colorBgContainer,
            }}
          >
            <Descriptions.Item label="Subdomain">
              <Tag color="blue">{selectedOrganization.subdomain}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedOrganization.name}
            </Descriptions.Item>
            <Descriptions.Item label="App Name">
              {selectedOrganization.app_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Primary Color">
              <Space>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: selectedOrganization.primary_color || '#1890ff',
                    border: `1px solid ${token.colorBorder}`,
                    borderRadius: 4,
                  }}
                />
                <Text>{selectedOrganization.primary_color || '#1890ff'}</Text>
              </Space>
            </Descriptions.Item>
            {selectedOrganization.logo_url && (
              <Descriptions.Item label="Logo">
                <img
                  src={selectedOrganization.logo_url}
                  alt="Logo"
                  style={{ maxWidth: 200, maxHeight: 100 }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Created At">
              {selectedOrganization.created_at
                ? new Date(selectedOrganization.created_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {selectedOrganization.updated_at
                ? new Date(selectedOrganization.updated_at).toLocaleString()
                : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}


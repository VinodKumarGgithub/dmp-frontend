import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  message,
  theme as antdTheme,
  Avatar,
  Row,
  Col,
  Divider,
  Tag,
  Select,
  Badge,
  Statistic,
  Descriptions,
  Switch,
  Empty,
  Upload,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  CrownOutlined,
  TeamOutlined,
  CalendarOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
  FontSizeOutlined,
  CameraOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useUpdateProfilePicture,
  useRemoveProfilePicture,
} from '../api/profile';
import { usePreferences, useUpdatePreferences } from '../api/profile';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import useAuthStore from '../stores/authStore';
import {
  AVAILABLE_FONTS,
  applyFontFamily,
  DEFAULT_FONT,
  getRecommendedFonts,
  getFontsByCategory,
} from '../utils/fontLoader';
import { getUserAvatarUrl } from '../utils/gravatar';

const { Title, Text, Paragraph } = Typography;

export default function ProfilePage() {
  const { token } = antdTheme.useToken();
  const { user: currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const setUser = useAuthStore((state) => state.setUser);

  const { data: profileData, isLoading: profileLoading } = useProfile();
  const profile = profileData?.data || profileData || currentUser;

  const { data: preferencesData } = usePreferences();
  const preferences = preferencesData?.data || preferencesData || { theme: 'light', language: 'en' };

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updatePreferencesMutation = useUpdatePreferences();
  const updateProfilePictureMutation = useUpdateProfilePicture();
  const removeProfilePictureMutation = useRemoveProfilePicture();

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Initialize forms when data loads
  useEffect(() => {
    if (profile) {
      profileForm.setFieldsValue({
        username: profile.username,
        name: profile.name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
      });
    }
  }, [profile, profileForm]);

  const handleProfileUpdate = async (values) => {
    try {
      const result = await updateProfileMutation.mutateAsync({
        name: values.name || null,
        email: values.email || null,
        phone_number: values.phone_number || null,
      });

      if (result?.data) {
        setUser({
          ...currentUser,
          name: result.data.name,
          email: result.data.email,
          phone_number: result.data.phone_number,
          profile_picture: result.data.profile_picture,
        });
      }

      setIsEditingProfile(false);
      message.success('Profile updated successfully');
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      passwordForm.resetFields();
      setIsChangingPassword(false);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const handleThemeToggle = (checked) => {
    // Use ThemeContext's toggleTheme which handles API save
    toggleTheme();
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'red',
      MANAGER: 'orange',
      DEVELOPER: 'purple',
      USER: 'blue',
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role) => {
    if (role === 'ADMIN') return <CrownOutlined />;
    if (role === 'MANAGER') return <TeamOutlined />;
    return <UserOutlined />;
  };

  if (profileLoading) {
    return (
      <div style={{ padding: token.paddingLG }}>
        <Card loading={true} />
      </div>
    );
  }

  return (
    <div style={{ padding: token.paddingLG, maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero Header Section */}
      <Card
        style={{
          marginBottom: token.marginLG,
          background: `linear-gradient(135deg, ${token.colorPrimary}15 0%, ${token.colorPrimary}05 100%)`,
          border: `1px solid ${token.colorPrimary}20`,
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'pointer',
                }}
                className="profile-avatar-container"
              >
                {/* Avatar with bottom gradient shadow */}
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    zIndex: 1,
                  }}
                >
                  <Avatar
                    size={120}
                    src={getUserAvatarUrl(profile, 240)}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: token.colorPrimary,
                      fontSize: 48,
                      border: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'block',
                    }}
                  />
                  
                  {/* Black gradient shadow at bottom only */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background: `linear-gradient(to top, 
                        rgba(0, 0, 0, 0.6) 0%, 
                        rgba(0, 0, 0, 0.4) 30%, 
                        rgba(0, 0, 0, 0.2) 60%, 
                        rgba(0, 0, 0, 0.05) 85%, 
                        transparent 100%)`,
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />
                </div>
                
                {/* Upload button - visible on hover */}
                <div
                  className="profile-avatar-actions"
                  style={{
                    position: 'absolute',
                    bottom: 6,
                    right: 6,
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    zIndex: 5,
                    transform: 'translateY(4px)',
                  }}
                >
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
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
                        updateProfilePictureMutation.mutate(base64, {
                          onSuccess: (data) => {
                            if (data?.data?.profile_picture) {
                              setUser({
                                ...currentUser,
                                profile_picture: data.data.profile_picture,
                              });
                            }
                          },
                        });
                      };
                      reader.readAsDataURL(file);
                      return false; // Prevent auto upload
                    }}
                    accept="image/*"
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                    />
                  </Upload>
                </div>
                
                {/* Delete button - visible on hover */}
                {profile?.profile_picture && (
                  <div
                    className="profile-avatar-actions"
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      opacity: 0,
                      transition: 'all 0.3s ease',
                      zIndex: 5,
                      transform: 'translateY(4px)',
                    }}
                  >
                    <Popconfirm
                      title="Remove profile picture?"
                      description="Are you sure you want to remove your profile picture?"
                      onConfirm={() => {
                        removeProfilePictureMutation.mutate(undefined, {
                          onSuccess: () => {
                            setUser({
                              ...currentUser,
                              profile_picture: null,
                            });
                          },
                        });
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="primary"
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        size="small"
                        style={{
                          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.35)',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                        }}
                      />
                    </Popconfirm>
                  </div>
                )}
              </div>
              <style>{`
                .profile-avatar-container {
                  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .profile-avatar-container:hover {
                  transform: scale(1.03);
                }
                .profile-avatar-container:hover .profile-avatar-actions {
                  opacity: 1 !important;
                  transform: translateY(0) !important;
                }
              `}</style>
              <div style={{ marginTop: token.marginMD }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {profile?.profile_picture ? 'Click camera to change' : 'Click camera to upload'}
                  {profile?.email && !profile?.profile_picture && ' or use Gravatar'}
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={18}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {profile?.name || profile?.username || 'User'}
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  @{profile?.username}
                </Text>
              </div>
              <Space size="middle" wrap>
                <Tag color={getRoleColor(profile?.role)} icon={getRoleIcon(profile?.role)}>
                  {profile?.role || 'USER'}
                </Tag>
                {profile?.email && (
                  <Tag icon={<MailOutlined />} color="blue">
                    {profile.email}
                  </Tag>
                )}
                {profile?.phone_number && (
                  <Tag icon={<PhoneOutlined />} color="green">
                    {profile.phone_number}
                  </Tag>
                )}
              </Space>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Member since {profile?.createdon ? new Date(profile.createdon).toLocaleDateString() : 'N/A'}
              </Paragraph>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Profile Information Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Personal Information</span>
              </Space>
            }
            extra={
              !isEditingProfile ? (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit
                </Button>
              ) : (
                <Space>
                  <Button
                    type="link"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      setIsEditingProfile(false);
                      profileForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              )
            }
            style={{ height: '100%' }}
          >
            {!isEditingProfile ? (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Username">
                  <Text strong>{profile?.username || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Full Name">
                  {profile?.name || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {profile?.email || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Phone Number">
                  {profile?.phone_number || <Text type="secondary">Not set</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Role">
                  <Tag color={getRoleColor(profile?.role)} icon={getRoleIcon(profile?.role)}>
                    {profile?.role || 'USER'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Account Created">
                  <Space>
                    <CalendarOutlined />
                    {profile?.createdon
                      ? new Date(profile.createdon).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileUpdate}
              >
                <Form.Item label="Username" name="username">
                  <Input prefix={<UserOutlined />} disabled />
                </Form.Item>

                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ max: 100, message: 'Name must be less than 100 characters' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { type: 'email', message: 'Please enter a valid email address' },
                    { max: 255, message: 'Email must be less than 255 characters' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="phone_number"
                  rules={[{ max: 20, message: 'Phone number must be less than 20 characters' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter your phone number" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<CheckOutlined />}
                      loading={updateProfileMutation.isPending}
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingProfile(false);
                        profileForm.resetFields();
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>

        {/* Security & Preferences Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SafetyOutlined />
                <span>Security & Preferences</span>
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Change Password Section */}
              <div>
                <div style={{ marginBottom: token.marginMD }}>
                  <Space>
                    <LockOutlined />
                    <Text strong>Change Password</Text>
                  </Space>
                  {!isChangingPassword && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setIsChangingPassword(true)}
                      style={{ marginLeft: token.marginXS }}
                    >
                      Change
                    </Button>
                  )}
                </div>
                {isChangingPassword ? (
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      label="Current Password"
                      name="oldPassword"
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter current password"
                      />
                    </Form.Item>

                    <Form.Item
                      label="New Password"
                      name="newPassword"
                      rules={[
                        { required: true, message: 'Please enter a new password' },
                        { min: 6, message: 'Password must be at least 6 characters' },
                        { max: 100, message: 'Password must be less than 100 characters' },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Enter new password" />
                    </Form.Item>

                    <Form.Item
                      label="Confirm New Password"
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm new password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<CheckOutlined />}
                          loading={changePasswordMutation.isPending}
                        >
                          Update Password
                        </Button>
                        <Button
                          onClick={() => {
                            setIsChangingPassword(false);
                            passwordForm.resetFields();
                          }}
                        >
                          Cancel
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <Text type="secondary">Click "Change" to update your password</Text>
                )}
              </div>

              <Divider />

              {/* Theme Preference */}
              <div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      {preferences?.theme === 'dark' ? <MoonOutlined /> : <SunOutlined />}
                      <Text strong>Theme</Text>
                    </Space>
                    <Switch
                      checked={isDark}
                      onChange={handleThemeToggle}
                      checkedChildren={<MoonOutlined />}
                      unCheckedChildren={<SunOutlined />}
                    />
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {preferences?.theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </Text>
                </Space>
              </div>

              <Divider />

              {/* Language Preference */}
              <div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <GlobalOutlined />
                    <Text strong>Language</Text>
                  </Space>
                  <Select
                    value={preferences?.language || 'en'}
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      updatePreferencesMutation.mutate({
                        theme: preferences?.theme || 'light',
                        language: value,
                        fontFamily: preferences?.fontFamily || DEFAULT_FONT,
                      });
                    }}
                  >
                    <Select.Option value="en">English</Select.Option>
                  </Select>
                </Space>
              </div>

              <Divider />

              {/* Font Family Preference */}
              <div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <FontSizeOutlined />
                    <Text strong>Font Style</Text>
                  </Space>
                  <Select
                    value={preferences?.fontFamily || DEFAULT_FONT}
                    style={{ width: '100%' }}
                    showSearch
                    placeholder="Search or select a font..."
                    optionFilterProp="label"
                    filterOption={(input, option) => {
                      const searchText = input.toLowerCase();
                      const fontName = option?.font?.name?.toLowerCase() || '';
                      const category = option?.font?.category?.toLowerCase() || '';
                      const description = option?.font?.description?.toLowerCase() || '';
                      return fontName.includes(searchText) || category.includes(searchText) || description.includes(searchText);
                    }}
                    onChange={(value) => {
                      // Apply font immediately
                      applyFontFamily(value);
                      // Save to preferences
                      updatePreferencesMutation.mutate({
                        theme: preferences?.theme || 'light',
                        language: preferences?.language || 'en',
                        fontFamily: value,
                      });
                    }}
                    optionRender={(option) => {
                      // Handle divider
                      if (option.value === '__divider__') {
                        return (
                          <div style={{ padding: '4px 0', textAlign: 'center', color: token.colorTextSecondary }}>
                            <Divider style={{ margin: '8px 0' }}>All Fonts</Divider>
                          </div>
                        );
                      }
                      
                      const font = AVAILABLE_FONTS.find((f) => f.value === option.value);
                      if (!font) return option.label;
                      
                      // Preload font for preview
                      if (font.value !== DEFAULT_FONT) {
                        const fontId = `google-font-${font.value.replace(/\s+/g, '-').toLowerCase()}`;
                        if (!document.getElementById(fontId)) {
                          const link = document.createElement('link');
                          link.id = fontId;
                          link.rel = 'stylesheet';
                          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
                            font.value
                          )}:wght@400;500;600&display=swap`;
                          document.head.appendChild(link);
                        }
                      }
                      
                      return (
                        <div
                          style={{
                            padding: '8px 0',
                            fontFamily: `"${font.value}", sans-serif`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{font.name}</span>
                                {font.recommended && (
                                  <Tag color="gold" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>
                                    ⭐ Recommended
                                  </Tag>
                                )}
                              </div>
                              {font.description && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: token.colorTextSecondary,
                                    fontStyle: 'italic',
                                    marginBottom: 6,
                                  }}
                                >
                                  {font.description}
                                </div>
                              )}
                              <div
                                style={{
                                  fontSize: 22,
                                  fontWeight: 500,
                                  letterSpacing: '0.5px',
                                  color: token.colorText,
                                  lineHeight: '1.4',
                                }}
                              >
                                Aa Bb Cc 123
                              </div>
                            </div>
                            <Tag color="blue" style={{ marginLeft: 12, flexShrink: 0 }}>
                              {font.category}
                            </Tag>
                          </div>
                        </div>
                      );
                    }}
                    options={[
                      // Recommended fonts first
                      ...getRecommendedFonts().map((font) => ({
                        value: font.value,
                        label: font.name,
                        font: font,
                      })),
                      // Divider (only if there are non-recommended fonts)
                      ...(AVAILABLE_FONTS.filter((f) => !f.recommended).length > 0
                        ? [
                            {
                              value: '__divider__',
                              label: 'All Fonts',
                              disabled: true,
                              font: null,
                            },
                          ]
                        : []),
                      // All other fonts
                      ...AVAILABLE_FONTS.filter((f) => !f.recommended).map((font) => ({
                        value: font.value,
                        label: font.name,
                        font: font,
                      })),
                    ]}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Choose from {AVAILABLE_FONTS.length} Google Fonts. Recommended fonts are marked with ⭐. Changes apply immediately.
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

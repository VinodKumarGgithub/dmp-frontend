import { useState, useEffect, useRef, useCallback } from 'react';
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

  // Debounced preference update
  const debounceTimerRef = useRef(null);
  const debouncedUpdatePreferences = useCallback((prefs) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updatePreferencesMutation.mutate(prefs);
    }, 500); // 500ms debounce delay
  }, [updatePreferencesMutation]);

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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
                {/* Premium Background Circle - creates depth */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${token.colorPrimary}15 0%, ${token.colorPrimary}08 40%, transparent 70%)`,
                    filter: 'blur(20px)',
                    zIndex: 0,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="profile-avatar-bg"
                />
                
                {/* Premium Gradient Border Wrapper */}
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    borderRadius: '50%',
                    padding: '3px',
                    background: `linear-gradient(135deg, ${token.colorPrimary}40 0%, ${token.colorPrimary}20 50%, rgba(255, 255, 255, 0.1) 100%)`,
                    boxShadow: `
                      0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                      0 8px 32px rgba(0, 0, 0, 0.12),
                      0 4px 16px rgba(0, 0, 0, 0.08),
                      0 0 40px ${token.colorPrimary}15
                    `,
                    zIndex: 1,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="profile-avatar-border"
                >
                  {/* Avatar Container with Enhanced Shadows */}
                  <div
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      boxShadow: `
                        0 4px 20px rgba(0, 0, 0, 0.15),
                        0 2px 8px rgba(0, 0, 0, 0.1),
                        inset 0 1px 2px rgba(255, 255, 255, 0.1)
                      `,
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
                    
                    {/* Vignette Effect - darker edges, lighter center */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.2) 70%, rgba(0, 0, 0, 0.4) 100%)`,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        zIndex: 2,
                      }}
                    />
                    
                    {/* Subtle Shine/Reflection at Top */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: '20%',
                        right: '20%',
                        height: '35%',
                        background: `radial-gradient(ellipse, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)`,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        zIndex: 3,
                      }}
                    />
                    
                    {/* Black gradient shadow at bottom */}
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
                        zIndex: 4,
                      }}
                    />
                  </div>
                </div>
                
                {/* Upload button - visible on hover */}
                <div
                  className="profile-avatar-actions"
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 6,
                    transform: 'translateY(4px) scale(0.9)',
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
                        boxShadow: `0 4px 16px ${token.colorPrimary}50, 0 2px 8px rgba(0, 0, 0, 0.2)`,
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
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
                      bottom: 8,
                      left: 8,
                      opacity: 0,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      zIndex: 6,
                      transform: 'translateY(4px) scale(0.9)',
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
                          boxShadow: '0 4px 16px rgba(255, 77, 79, 0.5), 0 2px 8px rgba(0, 0, 0, 0.2)',
                          border: '2px solid rgba(255, 255, 255, 0.4)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                        }}
                      />
                    </Popconfirm>
                  </div>
                )}
              </div>
              <style>{`
                @keyframes profilePulse {
                  0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 0.8;
                    transform: scale(1.02);
                  }
                }
                
                @keyframes profileGlow {
                  0%, 100% {
                    box-shadow: 0 0 0 0 ${token.colorPrimary}40;
                  }
                  50% {
                    box-shadow: 0 0 0 8px ${token.colorPrimary}00;
                  }
                }
                
                .profile-avatar-container {
                  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .profile-avatar-container:hover {
                  transform: scale(1.05);
                }
                
                .profile-avatar-container:hover .profile-avatar-bg {
                  width: 180px;
                  height: 180px;
                  background: radial-gradient(circle, ${token.colorPrimary}25 0%, ${token.colorPrimary}12 40%, transparent 70%);
                }
                
                .profile-avatar-container:hover .profile-avatar-border {
                  box-shadow: 
                    0 0 0 1px rgba(255, 255, 255, 0.15) inset,
                    0 12px 40px rgba(0, 0, 0, 0.15),
                    0 6px 20px rgba(0, 0, 0, 0.1),
                    0 0 60px ${token.colorPrimary}25;
                  animation: profileGlow 2s ease-in-out infinite;
                }
                
                .profile-avatar-container:hover .profile-avatar-actions {
                  opacity: 1 !important;
                  transform: translateY(0) scale(1) !important;
                }
                
                .profile-avatar-container:active {
                  transform: scale(1.02);
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
                      debouncedUpdatePreferences({
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
                      // Save to preferences with debounce
                      debouncedUpdatePreferences({
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

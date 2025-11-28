import { useState, useEffect } from 'react';
import { theme as antdTheme, Space, Typography, Dropdown, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { useOrganizationBranding } from '../../hooks/useOrganizationBranding';
import { hexToRgba } from '../../utils/colorUtils';
import ThemeToggle from '../ThemeToggle';

const { Text } = Typography;

const sections = [
  { key: 'hero', label: 'Home' },
  { key: 'problems', label: 'Problems' },
  { key: 'how-it-works', label: 'How It Works' },
  { key: 'features', label: 'Features' },
  { key: 'value', label: 'Value' },
  { key: 'cta', label: 'Get Started' },
];

export default function LandingNavbar() {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();
  const branding = useOrganizationBranding();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    const sectionId = typeof e === 'string' ? e : e.key;
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 100; // Account for navbar + padding
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const sloganColor = isDark ? '#ffa940' : '#d46b08';
  const sloganGradient = isDark 
    ? 'linear-gradient(135deg, #ffa940 0%, #ff8c00 100%)'
    : 'linear-gradient(135deg, #d46b08 0%, #fa8c16 100%)';

  const menuItems = sections.map((section) => ({
    key: section.key,
    label: section.label,
    onClick: (e) => handleNavClick(e),
  }));

  const menu = <Menu items={menuItems} />;

  return (
    <nav
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: 1400,
        zIndex: 1000,
        padding: `${token.paddingSM}px ${token.paddingLG}px`,
        background: isDark
          ? 'rgba(30, 30, 30, 0.4)'
          : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '50px',
        boxShadow: isDark
          ? '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 8px 32px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* App Name - Left */}
      <div 
        style={{ 
          flex: '0 0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: token.marginSM,
          cursor: 'pointer',
        }}
        onClick={() => handleNavClick('hero')}
      >
        {branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt={branding.appName}
            style={{
              height: 28,
              objectFit: 'contain',
            }}
          />
        )}
        <Text
          strong
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
            letterSpacing: '-0.01em',
          }}
        >
          {branding.appName || 'Platform'}
        </Text>
      </div>

      {/* Navigation Menu - Center (Desktop) */}
      {!isMobile && (
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Space size="large" style={{ marginRight: token.marginXL }}>
            {sections.map((section) => (
              <Text
                key={section.key}
                onClick={() => handleNavClick(section.key)}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  padding: `${token.paddingXS}px ${token.paddingSM}px`,
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
                }}
              >
                {section.label}
              </Text>
            ))}
          </Space>
        </div>
      )}

      {/* Slogan - Center (Mobile) or Right (Desktop) */}
      <div
        style={{
          flex: isMobile ? '1 1 auto' : '0 0 auto',
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-end',
          alignItems: 'center',
          gap: token.marginSM,
        }}
      >
        {isMobile ? (
          <>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: `${token.paddingXS}px ${token.paddingSM}px`,
                background: isDark
                  ? `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.15)}, ${hexToRgba(sloganColor, 0.08)})`
                  : `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.12)}, ${hexToRgba(sloganColor, 0.06)})`,
                border: `1px solid ${hexToRgba(sloganColor, 0.2)}`,
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: sloganGradient,
                  boxShadow: `0 0 8px ${hexToRgba(sloganColor, 0.6)}`,
                  flexShrink: 0,
                }}
              />
              <Text
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  background: sloganGradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                No Code
              </Text>
            </div>
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <MenuOutlined
                style={{
                  fontSize: '1.2rem',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                  cursor: 'pointer',
                }}
              />
            </Dropdown>
          </>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: `${token.paddingXS}px ${token.paddingMD}px`,
              background: isDark
                ? `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.15)}, ${hexToRgba(sloganColor, 0.08)})`
                : `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.12)}, ${hexToRgba(sloganColor, 0.06)})`,
              border: `1px solid ${hexToRgba(sloganColor, 0.25)}`,
              borderRadius: 24,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              marginRight: token.marginMD,
              boxShadow: isDark
                ? `0 2px 8px ${hexToRgba(sloganColor, 0.15)}, inset 0 1px 0 ${hexToRgba(sloganColor, 0.1)}`
                : `0 2px 8px ${hexToRgba(sloganColor, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = hexToRgba(sloganColor, 0.35);
              e.currentTarget.style.boxShadow = isDark
                ? `0 4px 12px ${hexToRgba(sloganColor, 0.2)}, inset 0 1px 0 ${hexToRgba(sloganColor, 0.15)}`
                : `0 4px 12px ${hexToRgba(sloganColor, 0.15)}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = hexToRgba(sloganColor, 0.25);
              e.currentTarget.style.boxShadow = isDark
                ? `0 2px 8px ${hexToRgba(sloganColor, 0.15)}, inset 0 1px 0 ${hexToRgba(sloganColor, 0.1)}`
                : `0 2px 8px ${hexToRgba(sloganColor, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`;
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: sloganGradient,
                boxShadow: `0 0 10px ${hexToRgba(sloganColor, 0.7)}`,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {['No Code', 'No Limits', 'No Waiting'].map((phrase, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      background: sloganGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phrase}
                  </Text>
                  {idx < 2 && (
                    <div
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: '50%',
                        background: hexToRgba(sloganColor, 0.4),
                        margin: '0 2px',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme Switch - Right */}
        <ThemeToggle />
      </div>
    </nav>
  );
}


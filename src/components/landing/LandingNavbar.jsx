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
  const [isTablet, setIsTablet] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
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
        top: isMobile ? 10 : 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobile 
          ? 'calc(100% - 20px)' 
          : isTablet 
          ? 'calc(100% - 32px)' 
          : 'calc(100% - 40px)',
        maxWidth: 1400,
        minWidth: 280, // Prevent too small navbar
        zIndex: 1000,
        padding: isMobile 
          ? `${token.paddingXS}px ${token.paddingMD}px`
          : isTablet 
          ? `${token.paddingSM}px ${token.paddingMD}px`
          : `${token.paddingSM}px ${token.paddingLG}px`,
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
          gap: isMobile ? token.marginXS : token.marginSM,
          cursor: 'pointer',
          minWidth: 0, // Allow shrinking
          maxWidth: isMobile ? '40%' : isTablet ? '35%' : '30%',
        }}
        onClick={() => handleNavClick('hero')}
      >
        {branding.logoUrl && (
          <img
            src={branding.logoUrl}
            alt={branding.appName}
            style={{
              height: isMobile ? 24 : 28,
              width: 'auto',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
        )}
        <Text
          strong
          ellipsis
          style={{
            fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '1rem',
            fontWeight: 600,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0, // Allow text truncation
          }}
        >
          {branding.appName || 'Platform'}
        </Text>
      </div>

      {/* Navigation Menu - Center (Desktop/Tablet) */}
      {!isMobile && (
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0, // Allow shrinking
            overflow: 'hidden',
          }}
        >
          <Space 
            size={isTablet ? "middle" : "large"} 
            style={{ 
              marginRight: isTablet ? token.marginMD : token.marginXL,
              flexWrap: 'nowrap',
            }}
          >
            {sections.map((section) => (
              <Text
                key={section.key}
                onClick={() => handleNavClick(section.key)}
                ellipsis
                style={{
                  fontSize: isTablet ? '0.75rem' : '0.85rem',
                  fontWeight: 500,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                  padding: `${token.paddingXS}px ${isTablet ? token.paddingXS : token.paddingSM}px`,
                  borderRadius: 8,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isTablet ? '80px' : '120px',
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

      {/* Slogan - Right (All screen sizes) */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: isMobile ? token.marginXS : token.marginSM,
          minWidth: 0, // Allow shrinking
          flexShrink: 0,
        }}
      >
        {isMobile ? (
          <>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: screenWidth < 480 ? 4 : 5,
                padding: `${token.paddingXS}px ${screenWidth < 480 ? token.paddingXS : token.paddingSM}px`,
                background: isDark
                  ? `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.15)}, ${hexToRgba(sloganColor, 0.08)})`
                  : `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.12)}, ${hexToRgba(sloganColor, 0.06)})`,
                border: `1px solid ${hexToRgba(sloganColor, 0.2)}`,
                borderRadius: 20,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                marginRight: token.marginXS,
                flexShrink: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: screenWidth < 480 ? 3 : 4,
                  height: screenWidth < 480 ? 3 : 4,
                  borderRadius: '50%',
                  background: sloganGradient,
                  boxShadow: `0 0 8px ${hexToRgba(sloganColor, 0.6)}`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: screenWidth < 480 ? 3 : 4,
                  flexWrap: 'nowrap',
                }}
              >
                {['No Code', 'No Limits', 'No Waiting'].map((phrase, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: screenWidth < 480 ? 3 : 4 }}>
                    <Text
                      ellipsis
                      style={{
                        fontSize: screenWidth < 480 ? '0.6rem' : '0.65rem',
                        fontWeight: 600,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        background: sloganGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: screenWidth < 480 ? '50px' : '60px',
                      }}
                    >
                      {phrase}
                    </Text>
                    {idx < 2 && (
                      <div
                        style={{
                          width: screenWidth < 480 ? 2 : 2.5,
                          height: screenWidth < 480 ? 2 : 2.5,
                          borderRadius: '50%',
                          background: hexToRgba(sloganColor, 0.4),
                          margin: `0 ${screenWidth < 480 ? 1 : 1}px`,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <MenuOutlined
                style={{
                  fontSize: '1.2rem',
                  color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            </Dropdown>
          </>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: isTablet ? 6 : 8,
              padding: `${token.paddingXS}px ${isTablet ? token.paddingSM : token.paddingMD}px`,
              background: isDark
                ? `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.15)}, ${hexToRgba(sloganColor, 0.08)})`
                : `linear-gradient(135deg, ${hexToRgba(sloganColor, 0.12)}, ${hexToRgba(sloganColor, 0.06)})`,
              border: `1px solid ${hexToRgba(sloganColor, 0.25)}`,
              borderRadius: 24,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              marginRight: isTablet ? token.marginSM : token.marginMD,
              boxShadow: isDark
                ? `0 2px 8px ${hexToRgba(sloganColor, 0.15)}, inset 0 1px 0 ${hexToRgba(sloganColor, 0.1)}`
                : `0 2px 8px ${hexToRgba(sloganColor, 0.1)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
              transition: 'all 0.3s ease',
              flexShrink: 1, // Allow shrinking on smaller screens
              minWidth: 0, // Allow shrinking
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
                gap: isTablet ? 4 : 6,
                flexWrap: 'nowrap',
              }}
            >
              {['No Code', 'No Limits', 'No Waiting'].map((phrase, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: isTablet ? 4 : 6 }}>
                  <Text
                    ellipsis
                    style={{
                      fontSize: isTablet ? '0.7rem' : '0.75rem',
                      fontWeight: 600,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      background: sloganGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: isTablet ? '70px' : '90px',
                    }}
                  >
                    {phrase}
                  </Text>
                  {idx < 2 && (
                    <div
                      style={{
                        width: isTablet ? 2 : 3,
                        height: isTablet ? 2 : 3,
                        borderRadius: '50%',
                        background: hexToRgba(sloganColor, 0.4),
                        margin: `0 ${isTablet ? 1 : 2}px`,
                        flexShrink: 0,
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


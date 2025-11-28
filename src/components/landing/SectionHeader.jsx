import { useState, useEffect } from 'react';
import { Typography, theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import IconBadge from './IconBadge';

const { Title, Paragraph, Text } = Typography;

export default function SectionHeader({
  badge,
  title,
  description,
  tagline,
  titleSize = '2.5rem',
}) {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginBottom: token.marginXL * 1.5 }}>
      {badge && (
        <div style={{ marginBottom: token.marginMD }}>
          <IconBadge>{badge}</IconBadge>
        </div>
      )}
      <Title
        level={2}
        style={{
          fontSize: isMobile ? '1.75rem' : titleSize,
          fontWeight: 600,
          marginBottom: token.marginMD,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          letterSpacing: '-0.03em',
          color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </Title>
      {description && (
        <Paragraph
          style={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
            maxWidth: 700,
            margin: '0 auto',
            marginBottom: tagline ? token.marginSM : 0,
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          {description}
        </Paragraph>
      )}
      {tagline && (
        <Text
          style={{
            fontSize: '0.9rem',
            fontStyle: 'italic',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            fontWeight: 400,
          }}
        >
          "{tagline}"
        </Text>
      )}
    </div>
  );
}

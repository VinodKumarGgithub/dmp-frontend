import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';

export default function GlassCard({ children, style = {}, hoverable = false, ...props }) {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();

  const glassmorphismStyle = {
    background: isDark
      ? 'rgba(30, 30, 30, 0.75)'
      : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: isDark
      ? '0 4px 24px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 4px 24px 0 rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
  };

  const hoverStyles = hoverable
    ? {
        transition: 'all 0.3s ease',
        onMouseEnter: (e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDark
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        },
      }
    : {};

  return (
    <div
      style={{
        ...glassmorphismStyle,
        borderRadius: 12,
        padding: token.paddingLG,
        ...style,
      }}
      {...hoverStyles}
      {...props}
    >
      {children}
    </div>
  );
}

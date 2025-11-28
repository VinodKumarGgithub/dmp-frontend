import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';

export default function GlassIcon({
  icon,
  size = 48,
  iconSize = 20,
  className = 'icon-minimal',
}) {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: size / 2,
        background: isDark
          ? 'rgba(255, 255, 255, 0.06)'
          : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px) saturate(180%)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%)',
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isDark
          ? '0 1px 3px rgba(0, 0, 0, 0.2)'
          : '0 1px 3px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          fontSize: iconSize,
          color: token.colorPrimary,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    </div>
  );
}

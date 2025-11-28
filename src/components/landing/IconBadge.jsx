import { Typography, theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import GlassCard from './GlassCard';

const { Text } = Typography;

export default function IconBadge({ children, style = {} }) {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();

  // Use warm amber/orange instead of blue
  const badgeColor = isDark ? '#ffa940' : '#d46b08';

  return (
    <GlassCard
      style={{
        borderRadius: 12,
        padding: `${token.paddingXS}px ${token.paddingMD}px`,
        display: 'inline-block',
        ...style,
      }}
    >
      <Text
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: badgeColor,
          letterSpacing: '0.5px',
        }}
      >
        {children}
      </Text>
    </GlassCard>
  );
}

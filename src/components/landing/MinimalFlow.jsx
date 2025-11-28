import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import GlassIcon from './GlassIcon';
import GlassCard from './GlassCard';
import ScrollReveal from './ScrollReveal';

export default function MinimalFlow({ items, titleKey = 'title', descKey = 'description', iconKey = 'icon' }) {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();

  return (
    <div style={{ position: 'relative' }}>
      {items.map((item, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <ScrollReveal key={idx} direction="up" delay={idx * 80}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: token.marginLG,
                marginBottom: idx < items.length - 1 ? token.marginXL : 0,
                flexDirection: 'row',
                position: 'relative',
              }}
            >
              {/* Subtle connecting element - only between items */}
              {idx < items.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -token.marginXL,
                    transform: 'translateX(-50%)',
                    width: 1,
                    height: token.marginXL,
                    background: isDark
                      ? `linear-gradient(180deg, ${hexToRgba(token.colorPrimary, 0.1)}, transparent)`
                      : `linear-gradient(180deg, ${hexToRgba(token.colorPrimary, 0.08)}, transparent)`,
                    opacity: 0.4,
                  }}
                />
              )}

              {/* Icon - subtle, no flash */}
              <div style={{ flexShrink: 0 }}>
                <GlassIcon
                  icon={item[iconKey]}
                  size={48}
                  iconSize={20}
                  className="icon-minimal"
                />
              </div>

              {/* Content card - clean and minimal */}
              <GlassCard style={{ flex: 1, padding: token.paddingMD }}>
                {item[titleKey] && (
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: token.marginXS,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      letterSpacing: '-0.01em',
                      color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {item[titleKey]}
                  </h3>
                )}
                {item[descKey] && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.65)',
                      fontWeight: 400,
                    }}
                  >
                    {item[descKey]}
                  </p>
                )}
              </GlassCard>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}


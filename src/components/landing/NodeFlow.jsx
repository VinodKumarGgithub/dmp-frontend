import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import GlassIcon from './GlassIcon';
import GlassCard from './GlassCard';
import ScrollReveal from './ScrollReveal';

export default function NodeFlow({ items, titleKey = 'title', descKey = 'description', iconKey = 'icon' }) {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();

  return (
    <div style={{ position: 'relative', padding: `${token.paddingXL}px 0` }}>
      {/* Neural network connecting line */}
      {items.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 1,
            bottom: 60,
            background: isDark
              ? `linear-gradient(180deg, transparent, ${hexToRgba(token.colorPrimary, 0.15)}, transparent)`
              : `linear-gradient(180deg, transparent, ${hexToRgba(token.colorPrimary, 0.12)}, transparent)`,
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.6,
          }}
        />
      )}

      {/* Node items */}
      {items.map((item, idx) => (
        <ScrollReveal key={idx} direction="up" delay={idx * 100}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: idx < items.length - 1 ? token.marginXL * 1.5 : 0,
              zIndex: 1,
            }}
          >
            {/* Node connector dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: token.colorPrimary,
                border: `2px solid ${isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)'}`,
                position: 'absolute',
                top: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                boxShadow: `0 0 12px ${hexToRgba(token.colorPrimary, 0.4)}`,
              }}
            />

            {/* Icon node */}
            <div style={{ marginBottom: token.marginMD }}>
              <GlassIcon
                icon={item[iconKey]}
                size={56}
                iconSize={22}
                className="icon-container-small icon-blazing"
              />
            </div>

            {/* Content card */}
            <GlassCard style={{ width: '100%', maxWidth: 600, marginTop: token.marginSM }}>
              {item[titleKey] && (
                <h3
                  style={{
                    margin: 0,
                    marginBottom: token.marginSM,
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.02em',
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
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
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
      ))}
    </div>
  );
}


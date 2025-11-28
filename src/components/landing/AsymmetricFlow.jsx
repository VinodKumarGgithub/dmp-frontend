import { useState, useEffect } from 'react';
import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';
import GlassIcon from './GlassIcon';
import GlassCard from './GlassCard';
import ScrollReveal from './ScrollReveal';

export default function AsymmetricFlow({ items, titleKey = 'title', descKey = 'description', iconKey = 'icon' }) {
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

  // Create varied positions and sizes for each item
  const getItemStyle = (idx) => {
    const patterns = [
      // Pattern 1: Left aligned, normal size
      { align: 'left', offset: 0, maxWidth: '65%', iconSize: 48 },
      // Pattern 2: Right aligned, smaller
      { align: 'right', offset: 0, maxWidth: '55%', iconSize: 44 },
      // Pattern 3: Center-left, larger
      { align: 'left', offset: 10, maxWidth: '70%', iconSize: 52 },
      // Pattern 4: Right, medium
      { align: 'right', offset: 5, maxWidth: '60%', iconSize: 48 },
      // Pattern 5: Left, smaller
      { align: 'left', offset: 5, maxWidth: '58%', iconSize: 46 },
      // Pattern 6: Center-right, larger
      { align: 'right', offset: 8, maxWidth: '68%', iconSize: 50 },
    ];
    return patterns[idx % patterns.length];
  };

  return (
    <div style={{ position: 'relative' }}>
      {items.map((item, idx) => {
        const style = getItemStyle(idx);
        const isLeft = style.align === 'left';
        
        return (
          <ScrollReveal key={idx} direction="up" delay={idx * 80}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: token.marginMD,
                marginBottom: idx < items.length - 1 ? token.marginXL * 1.2 : 0,
                flexDirection: isMobile ? 'column' : (isLeft ? 'row' : 'row-reverse'),
                position: 'relative',
                width: '100%',
                paddingLeft: isMobile ? 0 : (isLeft ? `${style.offset}%` : 0),
                paddingRight: isMobile ? 0 : (!isLeft ? `${style.offset}%` : 0),
              }}
            >
              {/* Subtle connecting element - curved/angled */}
              {idx < items.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: isLeft ? `${15 + style.offset}%` : `${85 - style.offset}%`,
                    bottom: -token.marginXL * 1.2,
                    width: 1,
                    height: token.marginXL * 1.2,
                    background: isDark
                      ? `linear-gradient(180deg, ${hexToRgba(token.colorPrimary, 0.08)}, transparent)`
                      : `linear-gradient(180deg, ${hexToRgba(token.colorPrimary, 0.06)}, transparent)`,
                    opacity: 0.3,
                    transform: isLeft ? 'rotate(-2deg)' : 'rotate(2deg)',
                  }}
                />
              )}

              {/* Icon - varied sizes */}
              <div style={{ flexShrink: 0 }}>
                <GlassIcon
                  icon={item[iconKey]}
                  size={style.iconSize}
                  iconSize={style.iconSize * 0.42}
                  className="icon-minimal"
                />
              </div>

              {/* Content card - varied widths */}
              <GlassCard style={{ 
                flex: 1, 
                maxWidth: isMobile ? '100%' : style.maxWidth,
                width: isMobile ? '100%' : 'auto',
                padding: token.paddingMD,
              }}>
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


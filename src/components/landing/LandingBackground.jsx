import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import { hexToRgba } from '../../utils/colorUtils';

export default function LandingBackground() {
  const { token } = antdTheme.useToken();
  const { isDark } = useCustomTheme();

  const overlayColor = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.01)';
  const gridColor = isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(0, 0, 0, 0.12)';

  return (
    <>
      {/* Background overlays with patterns */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark
            ? `radial-gradient(circle at 20% 50%, ${overlayColor} 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${overlayColor} 0%, transparent 50%)`
            : `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorFillQuaternary} 100%)`,
        }}
      />
      {/* Grid pattern - visible in empty spaces with gradient fade */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          opacity: isDark ? 0.7 : 0.6,
          maskImage: 'radial-gradient(ellipse 2000px 1500px at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 2000px 1500px at center, black 20%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Additional grid accents in multiple empty spaces - uneven shapes with fade */}
      {/* Top-left corner - irregular shape */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '3%',
          width: '420px',
          height: '320px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: isDark ? 0.5 : 0.4,
          clipPath: 'polygon(0 0, 85% 5%, 100% 25%, 95% 100%, 15% 95%, 0 70%)',
          WebkitClipPath: 'polygon(0 0, 85% 5%, 100% 25%, 95% 100%, 15% 95%, 0 70%)',
          maskImage: 'radial-gradient(ellipse 400px 300px at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 400px 300px at center, black 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Top-right corner - irregular shape */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          right: '4%',
          width: '380px',
          height: '280px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: isDark ? 0.5 : 0.4,
          clipPath: 'polygon(15% 0, 100% 8%, 100% 75%, 90% 100%, 5% 95%, 0 30%)',
          WebkitClipPath: 'polygon(15% 0, 100% 8%, 100% 75%, 90% 100%, 5% 95%, 0 30%)',
          maskImage: 'radial-gradient(ellipse 350px 280px at center, black 55%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 350px 280px at center, black 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-left corner - irregular shape */}
      <div
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '6%',
          width: '360px',
          height: '260px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: isDark ? 0.5 : 0.4,
          clipPath: 'polygon(0 15%, 20% 0, 100% 10%, 95% 85%, 80% 100%, 0 90%)',
          WebkitClipPath: 'polygon(0 15%, 20% 0, 100% 10%, 95% 85%, 80% 100%, 0 90%)',
          maskImage: 'radial-gradient(ellipse 340px 250px at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 340px 250px at center, black 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-right corner - irregular shape */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: '370px',
          height: '270px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: isDark ? 0.5 : 0.4,
          clipPath: 'polygon(10% 0, 100% 5%, 100% 90%, 85% 100%, 0 95%, 0 25%)',
          WebkitClipPath: 'polygon(10% 0, 100% 5%, 100% 90%, 85% 100%, 0 95%, 0 25%)',
          maskImage: 'radial-gradient(ellipse 360px 260px at center, black 58%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 360px 260px at center, black 58%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Left side middle - organic shape */}
      <div
        style={{
          position: 'absolute',
          top: '45%',
          left: '2%',
          width: '320px',
          height: '220px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: isDark ? 0.4 : 0.35,
          clipPath: 'polygon(0 20%, 25% 0, 100% 15%, 90% 80%, 70% 100%, 0 85%)',
          WebkitClipPath: 'polygon(0 20%, 25% 0, 100% 15%, 90% 80%, 70% 100%, 0 85%)',
          maskImage: 'radial-gradient(ellipse 300px 200px at center, black 65%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 300px 200px at center, black 65%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Right side middle - organic shape */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '3%',
          width: '340px',
          height: '240px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: isDark ? 0.4 : 0.35,
          clipPath: 'polygon(15% 0, 100% 20%, 100% 85%, 75% 100%, 0 90%, 0 25%)',
          WebkitClipPath: 'polygon(15% 0, 100% 20%, 100% 85%, 75% 100%, 0 90%, 0 25%)',
          maskImage: 'radial-gradient(ellipse 320px 220px at center, black 62%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 320px 220px at center, black 62%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Top center (between sections) - wavy shape */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '520px',
          height: '200px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '70px 70px',
          opacity: isDark ? 0.35 : 0.3,
          clipPath: 'polygon(5% 10%, 30% 0, 70% 5%, 95% 0, 100% 30%, 95% 90%, 70% 100%, 30% 95%, 5% 90%, 0 50%)',
          WebkitClipPath: 'polygon(5% 10%, 30% 0, 70% 5%, 95% 0, 100% 30%, 95% 90%, 70% 100%, 30% 95%, 5% 90%, 0 50%)',
          maskImage: 'radial-gradient(ellipse 500px 180px at center, black 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 500px 180px at center, black 70%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom center (between sections) - wavy shape */}
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '180px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '70px 70px',
          opacity: isDark ? 0.35 : 0.3,
          clipPath: 'polygon(0 20%, 20% 0, 50% 5%, 80% 0, 100% 20%, 100% 80%, 80% 100%, 50% 95%, 20% 100%, 0 80%)',
          WebkitClipPath: 'polygon(0 20%, 20% 0, 50% 5%, 80% 0, 100% 20%, 100% 80%, 80% 100%, 50% 95%, 20% 100%, 0 80%)',
          maskImage: 'radial-gradient(ellipse 480px 160px at center, black 68%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 480px 160px at center, black 68%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {/* Animated dot pattern */}
      <div
        className="dot-pattern"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.6,
          animation: 'float 20s ease-in-out infinite',
        }}
      />
      {/* Geometric shapes pattern */}
      <div
        className="geometric-pattern"
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: isDark
            ? `linear-gradient(135deg, rgba(82, 196, 26, 0.08), transparent)`
            : `linear-gradient(135deg, rgba(82, 196, 26, 0.03), transparent)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.4,
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="geometric-pattern"
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: '250px',
          height: '250px',
          background: isDark
            ? `linear-gradient(45deg, rgba(82, 196, 26, 0.08), transparent)`
            : `linear-gradient(45deg, rgba(82, 196, 26, 0.03), transparent)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.4,
          animation: 'pulse 10s ease-in-out infinite',
          animationDelay: '2s',
        }}
      />
    </>
  );
}


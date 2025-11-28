import { useState, useEffect } from 'react';
import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import SectionHeader from './SectionHeader';
import ScrollReveal from './ScrollReveal';
import NeuralNetworkFlow from './NeuralNetworkFlow';

export default function HowItWorksSection() {
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
    <section
      id="how-it-works"
      style={{
        padding: isMobile ? token.paddingLG : token.paddingXL * 1,
        paddingTop: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        paddingBottom: isMobile ? token.paddingXL * 1 : token.paddingXL * 1,
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <ScrollReveal direction="up" delay={0}>
        <SectionHeader
          badge="PLATFORM ARCHITECTURE"
          title="How It Works"
          description="See how all components connect in a unified neural network, from your database to end users."
          tagline="Everything connected. Everything automated."
        />
      </ScrollReveal>

      <NeuralNetworkFlow />
    </section>
  );
}


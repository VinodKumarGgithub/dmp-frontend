import { useState, useEffect } from 'react';
import { theme as antdTheme } from 'antd';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';
import HeroSection from '../components/landing/HeroSection';
import ProblemsSection from '../components/landing/ProblemsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import UniqueFeaturesSection from '../components/landing/UniqueFeaturesSection';
import ValuePropositionSection from '../components/landing/ValuePropositionSection';
import SecuritySection from '../components/landing/SecuritySection';
import CTASection from '../components/landing/CTASection';
import LandingBackground from '../components/landing/LandingBackground';
import LandingNavbar from '../components/landing/LandingNavbar';

export default function LandingPage() {
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
    <div
      style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <LandingBackground />
      
      {/* Fixed Navbar */}
      <LandingNavbar />

      {/* Main content with proper top spacing for navbar */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 1,
          paddingTop: '100px',
        }}
      >
        <HeroSection />
        <ProblemsSection />
        <HowItWorksSection />
        <UniqueFeaturesSection />
        <ValuePropositionSection />
        <SecuritySection />
        <CTASection />
      </div>
    </div>
  );
}

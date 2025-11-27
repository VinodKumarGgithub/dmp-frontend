import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Joyride, { STATUS } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { theme as antdTheme } from 'antd';
import { RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';
import useAuthStore from '../stores/authStore';
import { useTheme } from '../contexts/ThemeContext';

// Component to render HTML content in tour steps
const TourContent = ({ content }) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

export default function UserOnboardingTour() {
  const [runTour, setRunTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'USER';
  const { isDark } = useTheme();
  const { token } = antdTheme.useToken();
  const totalSteps = useRef(0);

  useEffect(() => {
    // Check if user has completed tour
    const tourKey = `hasSeenTour_${userRole}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    
    // Only show tour on home page for first-time users
    if (!hasSeenTour && location.pathname === '/' && user) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setRunTour(true);
        totalSteps.current = getTourSteps().length;
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [location, user, userRole]);

  // Refs to store icon roots for cleanup
  const nextButtonRootRef = useRef(null);
  const backButtonRootRef = useRef(null);

  // Update step counter and inject icons into buttons
  useEffect(() => {
    if (runTour) {
      const updateStepCounter = () => {
        const footer = document.querySelector('.react-joyride__tooltip footer');
        if (footer && totalSteps.current > 0) {
          const stepText = `${currentStep + 1} / ${totalSteps.current}`;
          footer.setAttribute('data-step-counter', stepText);
        }
      };

      const injectIcons = () => {
        // Inject RightCircleOutlined into next button
        const nextButton = document.querySelector('.react-joyride__button--next');
        if (nextButton) {
          let iconContainer = nextButton.querySelector('.tour-icon-container');
          if (!iconContainer) {
            iconContainer = document.createElement('span');
            iconContainer.className = 'tour-icon-container';
            nextButton.appendChild(iconContainer);
            const root = createRoot(iconContainer);
            nextButtonRootRef.current = root;
            root.render(<RightCircleOutlined style={{ fontSize: 18, color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)' }} />);
          } else if (nextButtonRootRef.current) {
            // Update icon if theme changed
            nextButtonRootRef.current.render(<RightCircleOutlined style={{ fontSize: 18, color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)' }} />);
          }
        }

        // Inject LeftCircleOutlined into back button
        const backButton = document.querySelector('.react-joyride__button--back');
        if (backButton) {
          let iconContainer = backButton.querySelector('.tour-icon-container');
          if (!iconContainer) {
            iconContainer = document.createElement('span');
            iconContainer.className = 'tour-icon-container';
            backButton.appendChild(iconContainer);
            const root = createRoot(iconContainer);
            backButtonRootRef.current = root;
            root.render(<LeftCircleOutlined style={{ fontSize: 18, color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)' }} />);
          } else if (backButtonRootRef.current) {
            // Update icon if theme changed
            backButtonRootRef.current.render(<LeftCircleOutlined style={{ fontSize: 18, color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)' }} />);
          }
        }
      };
      
      updateStepCounter();
      injectIcons();
      
      const interval = setInterval(() => {
        updateStepCounter();
        injectIcons();
      }, 100);
      
      return () => {
        clearInterval(interval);
        // Cleanup icon roots
        if (nextButtonRootRef.current) {
          nextButtonRootRef.current.unmount();
          nextButtonRootRef.current = null;
        }
        if (backButtonRootRef.current) {
          backButtonRootRef.current.unmount();
          backButtonRootRef.current = null;
        }
      };
    }
  }, [runTour, currentStep, isDark]);

  // Role-based tour steps - Focused on core value propositions
  const getTourSteps = () => {
    // Step 1: Welcome with value proposition
    const welcomeStep = {
      target: 'body',
      content: <TourContent content="Welcome! This platform eliminates 80-90% of developer dependency. Business users can create powerful data pages, dashboards, and reports without writing a single line of code. Let's explore how it works!" />,
      placement: 'center',
      disableBeacon: true,
    };

    // Step 2: Multi-Tenant Switching (Core Feature #1)
    const tenantSelectorStep = {
      target: '.ant-pro-layout-actions',
      content: <TourContent content="<strong>Multi-Tenant Switching</strong> - Switch between tenant databases instantly with zero downtime. No configuration duplication needed. Perfect for SaaS products managing multiple clients. Each tenant has isolated data and can be customized independently." />,
      placement: 'bottom',
      disableBeacon: false,
    };

    // Step 3: Configurable Pages (Core Feature #2)
    const pagesStep = {
      target: '.ant-pro-layout-sider, .ant-pro-layout-menu',
      content: <TourContent content="<strong>Create Pages Without Developers</strong> - Access configurable data pages that were created without any coding. Admins simply select tables, columns, filters, and permissions. Every page goes live instantly - no deployments needed!" />,
      placement: 'right',
    };

    // Step 4: Column Customization (Core Feature #3)
    const customizationStep = {
      target: 'body',
      content: <TourContent content="<strong>User-Level Customization</strong> - Each user can personalize their data views: show/hide columns, reorder them, and save custom layouts. Your preferences are saved automatically and persist across sessions." />,
      placement: 'center',
    };

    // Step 5: Data Export (Core Feature #4)
    const exportStep = {
      target: 'body',
      content: <TourContent content="<strong>Flexible Data Export</strong> - Download data in Excel or CSV format with configurable limits. Admins control download permissions per page or tenant. No more waiting for IT to generate reports!" />,
      placement: 'center',
    };

    // Role-specific admin/developer features
    const adminSteps = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'DEVELOPER' ? [
      {
        target: '[data-menu-id="/page-config"], a[href="/page-config"]',
        content: <TourContent content="<strong>Page Configuration</strong> - As an admin/developer, you can create new pages in minutes. Just select the data source, configure columns, filters, and permissions. No stored procedures or custom code needed!" />,
        placement: 'right',
      },
    ] : [];

    const developerSteps = userRole === 'DEVELOPER' || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? [
      {
        target: '[data-menu-id="/page-config"], a[href="/page-config"]',
        content: <TourContent content="<strong>Metadata-Driven Architecture</strong> - The system auto-detects all database metadata (tables, columns, types, relations). When you add a column to your database, it automatically appears in the UI - no code changes required!" />,
        placement: 'right',
      },
    ] : [];

    // Build final steps based on role (removed pageSwitcherStep)
    const coreFeatures = [
      welcomeStep,
      tenantSelectorStep,
      pagesStep,
      customizationStep,
      exportStep,
    ];

    // Add role-specific steps
    const roleSpecificSteps = {
      SUPER_ADMIN: [
        ...coreFeatures,
        ...adminSteps,
        {
          target: '[data-menu-id="/organizations"], a[href="/organizations"]',
          content: <TourContent content="<strong>Organization Management</strong> - Manage all organizations from a single platform. Each organization can have its own branding, users, and tenant databases." />,
          placement: 'right',
        },
        {
          target: '[data-menu-id="/users"], a[href="/users"]',
          content: <TourContent content="<strong>User Management</strong> - Create users, assign roles, and manage permissions. Reduce IT overhead by empowering business users with self-service capabilities." />,
          placement: 'right',
        },
      ],
      ADMIN: [
        ...coreFeatures,
        ...adminSteps,
        {
          target: '[data-menu-id="/users"], a[href="/users"]',
          content: <TourContent content="<strong>User Management</strong> - Create users and assign permissions without developer involvement. Business teams can manage their own access." />,
          placement: 'right',
        },
        {
          target: '[data-menu-id="/tenants"], a[href="/tenants"]',
          content: <TourContent content="<strong>Tenant Management</strong> - Add new tenant databases instantly. Test connections and manage credentials all from one place." />,
          placement: 'right',
        },
      ],
      DEVELOPER: [
        ...coreFeatures,
        ...developerSteps,
      ],
      MANAGER: [
        ...coreFeatures,
      ],
      USER: [
        ...coreFeatures,
      ],
    };

    // Add profile step at the end
    const finalSteps = [
      ...(roleSpecificSteps[userRole] || roleSpecificSteps.USER),
      {
        target: '.ant-avatar, [class*="avatar"]',
        content: <TourContent content="<strong>Personalization</strong> - Access your profile, customize preferences, and manage your account settings. The platform adapts to your preferences automatically." />,
        placement: 'bottom',
      },
    ];

    return finalSteps;
  };

  const handleJoyrideCallback = (data) => {
    const { status, index, action } = data;
    
    // Update current step
    if (typeof index === 'number') {
      setCurrentStep(index);
    }
    
    // Update total steps on start
    if (action === 'start' && data.size) {
      totalSteps.current = data.size;
    }
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      const tourKey = `hasSeenTour_${userRole}`;
      localStorage.setItem(tourKey, 'true');
      setRunTour(false);
      setCurrentStep(0);
    }
  };

  if (!runTour || !user) return null;

  // Glassmorphism styles based on theme
  const glassmorphismStyles = {
    // Overlay with blur effect
    overlay: {
      backgroundColor: isDark 
        ? 'rgba(0, 0, 0, 0.4)' 
        : 'rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    // Tooltip with glassmorphism
    tooltip: {
      backgroundColor: isDark
        ? 'rgba(30, 30, 30, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: '16px',
      border: isDark
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: isDark
        ? '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        : '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)',
      padding: '24px',
      color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)',
      fontSize: '15px',
      lineHeight: '1.6',
      maxWidth: '400px',
    },
    // Tooltip container
    tooltipContainer: {
      textAlign: 'left',
    },
    // Tooltip title
    tooltipTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '8px',
      color: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)',
    },
    // Tooltip content
    tooltipContent: {
      fontSize: '14px',
      color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      marginBottom: '16px',
    },
    // Buttons with glassmorphism
    buttonNext: {
      backgroundColor: isDark
        ? 'rgba(24, 144, 255, 0.8)'
        : 'rgba(24, 144, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(24, 144, 255, 0.3)',
      borderRadius: '8px',
      color: '#fff',
      fontWeight: 500,
      padding: '8px 20px',
      boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
      transition: 'all 0.3s ease',
    },
    buttonBack: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: isDark
        ? '1px solid rgba(255, 255, 255, 0.15)'
        : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
      fontWeight: 500,
      padding: '8px 20px',
      transition: 'all 0.3s ease',
    },
    buttonSkip: {
      backgroundColor: 'transparent',
      border: 'none',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
      fontWeight: 400,
      padding: '8px 16px',
      transition: 'all 0.3s ease',
    },
    // Beacon/spotlight effect
    spotlight: {
      borderRadius: '12px',
      boxShadow: isDark
        ? '0 0 0 4px rgba(24, 144, 255, 0.3), 0 0 40px rgba(24, 144, 255, 0.2)'
        : '0 0 0 4px rgba(24, 144, 255, 0.2), 0 0 40px rgba(24, 144, 255, 0.15)',
    },
    // Progress indicator
    progress: {
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
      height: '4px',
    },
    progressBar: {
      backgroundColor: token.colorPrimary,
      borderRadius: '4px',
      boxShadow: `0 0 8px ${token.colorPrimary}40`,
    },
  };

  return (
    <>
      <style>
        {`
          /* Glassmorphism Overlay - Full Page Blur */
          .react-joyride__overlay {
            background-color: ${isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.55)'} !important;
            backdrop-filter: blur(30px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9998 !important;
          }

          /* Prevent body scroll during tour */
          body.react-joyride__open {
            overflow: hidden !important;
          }

          /* Ensure tooltip and spotlight are above overlay */
          .react-joyride__tooltip {
            z-index: 10000 !important;
            position: relative !important;
          }

          .react-joyride__spotlight {
            z-index: 9999 !important;
            position: relative !important;
          }

          /* Glassmorphism Tooltip */
          .react-joyride__tooltip {
            background: ${isDark
              ? 'rgba(30, 30, 30, 0.85)'
              : 'rgba(255, 255, 255, 0.9)'} !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border-radius: 16px !important;
            border: ${isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.8)'} !important;
            box-shadow: ${isDark
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              : '0 8px 32px 0 rgba(31, 38, 135, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5)'} !important;
            padding: 24px !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)'} !important;
            font-size: 15px !important;
            line-height: 1.6 !important;
            max-width: 400px !important;
          }

          .react-joyride__tooltip h4 {
            font-size: 18px !important;
            font-weight: 600 !important;
            margin-bottom: 8px !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'} !important;
          }

          .react-joyride__tooltip p {
            font-size: 14px !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)'} !important;
            margin-bottom: 16px !important;
          }

          .react-joyride__tooltip strong {
            font-weight: 600 !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.9)'} !important;
          }

          /* Pill-shaped Ghost Buttons - Next & Back with Text */
          .react-joyride__button--next {
            background: ${isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)'} !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: ${isDark
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.1)'} !important;
            border-radius: 20px !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'} !important;
            min-width: 90px !important;
            height: 40px !important;
            padding: 0 16px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
            font-size: 13px !important;
            font-weight: 500 !important;
          }

          /* Icon container styling */
          .react-joyride__button--next .tour-icon-container,
          .react-joyride__button--back .tour-icon-container {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important;
            z-index: 10 !important;
            pointer-events: none !important;
          }

          .react-joyride__button--next .tour-icon-container .anticon,
          .react-joyride__button--back .tour-icon-container .anticon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          .react-joyride__button--next:hover {
            transform: translateY(-2px) scale(1.05) !important;
            background: ${isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(0, 0, 0, 0.08)'} !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          }

          .react-joyride__button--back {
            background: ${isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)'} !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: ${isDark
              ? '1px solid rgba(255, 255, 255, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.1)'} !important;
            border-radius: 20px !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'} !important;
            min-width: 90px !important;
            height: 40px !important;
            padding: 0 16px !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 6px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
            font-size: 13px !important;
            font-weight: 500 !important;
          }


          .react-joyride__button--back:hover {
            transform: translateY(-2px) scale(1.05) !important;
            background: ${isDark
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(0, 0, 0, 0.08)'} !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          }

          /* Footer with buttons and step counter */
          .react-joyride__tooltip footer {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            margin-top: 16px !important;
            padding-top: 16px !important;
            border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important;
            position: relative !important;
          }

          /* Step counter - positioned between buttons using CSS */
          .react-joyride__tooltip footer::after {
            content: attr(data-step-counter) !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'} !important;
            position: absolute !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            pointer-events: none !important;
            z-index: 1 !important;
          }

          /* Show button text alongside icons */
          .react-joyride__button--next,
          .react-joyride__button--back {
            position: relative !important;
          }
          
          /* Ensure text is visible */
          .react-joyride__button--next span:not(.tour-icon-container),
          .react-joyride__button--back span:not(.tour-icon-container) {
            display: inline-block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }

          /* Skip button as small helper text */
          .react-joyride__button--skip {
            background: transparent !important;
            border: none !important;
            color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'} !important;
            font-weight: 400 !important;
            font-size: 11px !important;
            padding: 4px 8px !important;
            transition: all 0.3s ease !important;
            text-decoration: underline !important;
            text-decoration-color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'} !important;
            text-underline-offset: 2px !important;
            position: absolute !important;
            top: 12px !important;
            right: 12px !important;
          }

          .react-joyride__button--skip:hover {
            color: ${isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'} !important;
            text-decoration-color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'} !important;
          }

          /* Spotlight Effect */
          .react-joyride__spotlight {
            border-radius: 12px !important;
            box-shadow: ${isDark
              ? '0 0 0 4px rgba(24, 144, 255, 0.3), 0 0 40px rgba(24, 144, 255, 0.2)'
              : '0 0 0 4px rgba(24, 144, 255, 0.2), 0 0 40px rgba(24, 144, 255, 0.15)'} !important;
          }

          /* Progress Bar */
          .react-joyride__progress {
            background: ${isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.1)'} !important;
            border-radius: 4px !important;
            height: 4px !important;
          }

          .react-joyride__progress span {
            background: ${token.colorPrimary} !important;
            border-radius: 4px !important;
            box-shadow: 0 0 8px ${token.colorPrimary}40 !important;
          }
        `}
      </style>
      <Joyride
        steps={getTourSteps()}
        run={runTour}
        continuous
        showProgress={false}
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: token.colorPrimary,
            zIndex: 10000,
          },
          tooltip: glassmorphismStyles.tooltip,
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: glassmorphismStyles.buttonNext,
          buttonBack: glassmorphismStyles.buttonBack,
          buttonSkip: glassmorphismStyles.buttonSkip,
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip tour',
        }}
      />
    </>
  );
}


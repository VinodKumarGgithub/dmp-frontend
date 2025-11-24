import React, { useEffect, useState, useRef } from 'react';
import { theme } from 'antd';
import useAppConfigStore from '../stores/appConfigStore';

export default function LoadingScreen({ isLoading = true }) {
  const { token } = theme.useToken();
  const getAppName = useAppConfigStore((state) => state.getAppName);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Reset progress when component mounts
    progressRef.current = 0;
    setProgress(0);

    // Clear any existing intervals/timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Safety timeout - ensure loading doesn't get stuck (max 10 seconds)
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      progressRef.current = 100;
      setProgress(100);
    }, 10000);

    // Simulate loading progress with smooth acceleration
    intervalRef.current = setInterval(() => {
      // If loading is complete, quickly finish to 100%
      if (!isLoading && progressRef.current < 100) {
        progressRef.current = Math.min(progressRef.current + 20, 100);
        setProgress(progressRef.current);
        if (progressRef.current >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
        return;
      }

      if (progressRef.current >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      
      // Accelerate then decelerate for natural feel
      const remaining = 100 - progressRef.current;
      const speed = remaining > 20 ? 3 + Math.random() * 4 : 1 + Math.random() * 2;
      progressRef.current = Math.min(progressRef.current + speed, 100);
      setProgress(progressRef.current);
    }, 80);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading]);

  const appName = getAppName();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: token.colorBgLayout,
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Subtle Background Gradient */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${token.colorFillTertiary}20 0%, transparent 70%)`,
          animation: 'pulseBg 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Application Name with Premium Fill Effect */}
      <div
        style={{
          position: 'relative',
          fontSize: 'clamp(40px, 7vw, 72px)',
          fontWeight: token.fontWeightStrong,
          letterSpacing: '3px',
          lineHeight: 1.2,
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Background Text (Unfilled) - Subtle Outline */}
        <div
          style={{
            color: token.colorTextTertiary,
            WebkitTextStroke: `1.5px ${token.colorBorder}`,
            WebkitTextFillColor: 'transparent',
            position: 'relative',
            opacity: 0.3,
          }}
        >
          {appName}
        </div>

        {/* Filled Text (Based on Progress) with Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${progress}%`,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            background: `linear-gradient(135deg, ${token.colorTextHeading} 0%, ${token.colorText} 50%, ${token.colorTextHeading} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}
        >
          {appName}
        </div>

        {/* Premium Blazing Shine Effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${progress}%`,
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
            maskImage: `linear-gradient(to right, transparent, black ${progress}%, transparent)`,
            WebkitMaskImage: `linear-gradient(to right, transparent, black ${progress}%, transparent)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-150%',
              width: '60%',
              height: '100%',
              background: `linear-gradient(
                90deg,
                transparent 0%,
                ${token.colorTextHeading}30 20%,
                ${token.colorTextHeading}80 50%,
                ${token.colorTextHeading}30 80%,
                transparent 100%
              )`,
              transform: 'skewX(-20deg)',
              animation: 'premiumShine 2.5s infinite',
              filter: 'blur(2px)',
            }}
          />
        </div>

        {/* Secondary Shine Layer for Depth */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${progress}%`,
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-200%',
              width: '40%',
              height: '100%',
              background: `linear-gradient(
                90deg,
                transparent 0%,
                ${token.colorTextHeading}60 50%,
                transparent 100%
              )`,
              animation: 'secondaryShine 3s infinite 0.5s',
            }}
          />
        </div>
      </div>

      {/* Premium Progress Percentage with Glow */}
      <div
        style={{
          marginTop: token.marginXXL,
          fontSize: token.fontSizeHeading4,
          color: token.colorTextSecondary,
          fontWeight: token.fontWeightStrong,
          letterSpacing: '3px',
          fontVariantNumeric: 'tabular-nums',
          opacity: 0.8,
          animation: 'fadeInUp 0.8s ease-out 0.3s both',
        }}
      >
        {Math.round(progress)}%
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes premiumShine {
            0% {
              left: -150%;
            }
            100% {
              left: 150%;
            }
          }
          
          @keyframes secondaryShine {
            0% {
              left: -200%;
            }
            100% {
              left: 200%;
            }
          }
          
          @keyframes pulseBg {
            0%, 100% {
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              opacity: 0.5;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 0.8;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}


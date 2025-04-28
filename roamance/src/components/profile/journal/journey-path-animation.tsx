import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export type ColorScheme =
  | 'indigo'
  | 'purple'
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'amber';
export type Size = 'sm' | 'md' | 'lg' | 'xl';

interface JourneyPathAnimationProps {
  color?: ColorScheme;
  size?: Size;
  className?: string;
  pathOnly?: boolean;
  showDecorations?: boolean;
}

export const JourneyPathAnimation: React.FC<JourneyPathAnimationProps> = ({
  color = 'indigo',
  size = 'md',
  className,
  pathOnly = false,
  showDecorations = false,
}) => {
  // Use theme detection
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Base styles based on size
  const getSizeStyles = (size: Size) => {
    switch (size) {
      case 'sm':
        return 'w-16 h-16';
      case 'md':
        return 'w-24 h-24';
      case 'lg':
        return 'w-32 h-32';
      case 'xl':
        return 'w-40 h-40';
      default:
        return 'w-24 h-24';
    }
  };

  // Enhanced color schemes with gradients and glow effects
  const getColorStyles = (color: ColorScheme) => {
    // Base colors that will be used for both light and dark modes
    const baseColors = {
      indigo: {
        light: {
          marker1Start: '#818cf8', // lighter indigo
          marker1End: '#4f46e5', // indigo
          marker2Start: '#6366f1', // mid indigo
          marker2End: '#4338ca', // darker indigo
          path: 'stroke-indigo-400/70',
          pathGlow: 'filter drop-shadow(0 0 2px rgba(129, 140, 248, 0.5))',
          pathDash: 'stroke-indigo-500/50',
          decoration: 'text-indigo-400',
        },
        dark: {
          marker1Start: '#a5b4fc', // brighter indigo for dark mode
          marker1End: '#6366f1', // mid-bright indigo
          marker2Start: '#818cf8', // bright indigo
          marker2End: '#4f46e5', // indigo
          path: 'stroke-indigo-300/70',
          pathGlow: 'filter drop-shadow(0 0 3px rgba(165, 180, 252, 0.7))',
          pathDash: 'stroke-indigo-400/60',
          decoration: 'text-indigo-300',
        },
      },
      purple: {
        light: {
          marker1Start: '#c084fc', // lighter purple
          marker1End: '#9333ea', // purple
          marker2Start: '#a855f7', // mid purple
          marker2End: '#7e22ce', // darker purple
          path: 'stroke-purple-400/70',
          pathGlow: 'filter drop-shadow(0 0 2px rgba(192, 132, 252, 0.5))',
          pathDash: 'stroke-purple-500/50',
          decoration: 'text-purple-400',
        },
        dark: {
          marker1Start: '#d8b4fe', // brighter purple
          marker1End: '#a855f7', // mid-bright purple
          marker2Start: '#c084fc', // bright purple
          marker2End: '#9333ea', // purple
          path: 'stroke-purple-300/70',
          pathGlow: 'filter drop-shadow(0 0 3px rgba(216, 180, 254, 0.7))',
          pathDash: 'stroke-purple-400/60',
          decoration: 'text-purple-300',
        },
      },
      blue: {
        light: {
          marker1Start: '#60a5fa', // lighter blue
          marker1End: '#2563eb', // blue
          marker2Start: '#3b82f6', // mid blue
          marker2End: '#1d4ed8', // darker blue
          path: 'stroke-blue-400/70',
          pathGlow: 'filter drop-shadow(0 0 2px rgba(96, 165, 250, 0.5))',
          pathDash: 'stroke-blue-500/50',
          decoration: 'text-blue-400',
        },
        dark: {
          marker1Start: '#93c5fd', // brighter blue
          marker1End: '#3b82f6', // mid-bright blue
          marker2Start: '#60a5fa', // bright blue
          marker2End: '#2563eb', // blue
          path: 'stroke-blue-300/70',
          pathGlow: 'filter drop-shadow(0 0 3px rgba(147, 197, 253, 0.7))',
          pathDash: 'stroke-blue-400/60',
          decoration: 'text-blue-300',
        },
      },
      emerald: {
        light: {
          marker1Start: '#34d399', // lighter emerald
          marker1End: '#059669', // emerald
          marker2Start: '#10b981', // mid emerald
          marker2End: '#047857', // darker emerald
          path: 'stroke-emerald-400/70',
          pathGlow: 'filter drop-shadow(0 0 2px rgba(52, 211, 153, 0.5))',
          pathDash: 'stroke-emerald-500/50',
          decoration: 'text-emerald-400',
        },
        dark: {
          marker1Start: '#6ee7b7', // brighter emerald
          marker1End: '#10b981', // mid-bright emerald
          marker2Start: '#34d399', // bright emerald
          marker2End: '#059669', // emerald
          path: 'stroke-emerald-300/70',
          pathGlow: 'filter drop-shadow(0 0 3px rgba(110, 231, 183, 0.7))',
          pathDash: 'stroke-emerald-400/60',
          decoration: 'text-emerald-300',
        },
      },
      rose: {
        light: {
          marker1Start: '#fb7185', // lighter rose
          marker1End: '#e11d48', // rose
          marker2Start: '#f43f5e', // mid rose
          marker2End: '#be123c', // darker rose
          path: 'stroke-rose-400/70',
          pathGlow: 'filter drop-shadow(0 0 2px rgba(251, 113, 133, 0.5))',
          pathDash: 'stroke-rose-500/50',
          decoration: 'text-rose-400',
        },
        dark: {
          marker1Start: '#fda4af', // brighter rose
          marker1End: '#f43f5e', // mid-bright rose
          marker2Start: '#fb7185', // bright rose
          marker2End: '#e11d48', // rose
          path: 'stroke-rose-300/70',
          pathGlow: 'filter drop-shadow(0 0 3px rgba(253, 164, 175, 0.7))',
          pathDash: 'stroke-rose-400/60',
          decoration: 'text-rose-300',
        },
      },
      amber: {
        light: {
          marker1Start: '#fbbf24', // lighter amber
          marker1End: '#d97706', // amber
          marker2Start: '#f59e0b', // mid amber
          marker2End: '#b45309', // darker amber
          path: 'stroke-amber-400/70',
          pathGlow: 'filter drop-shadow(0 0 2px rgba(251, 191, 36, 0.5))',
          pathDash: 'stroke-amber-500/50',
          decoration: 'text-amber-400',
        },
        dark: {
          marker1Start: '#fcd34d', // brighter amber
          marker1End: '#f59e0b', // mid-bright amber
          marker2Start: '#fbbf24', // bright amber
          marker2End: '#d97706', // amber
          path: 'stroke-amber-300/70',
          pathGlow: 'filter drop-shadow(0 0 3px rgba(252, 211, 77, 0.7))',
          pathDash: 'stroke-amber-400/60',
          decoration: 'text-amber-300',
        },
      },
    };

    // Get the appropriate color scheme based on the theme
    const themeColors = baseColors[color][isDarkMode ? 'dark' : 'light'];

    return {
      marker1: isDarkMode
        ? 'fill-white/90 stroke-white/60'
        : 'fill-white stroke-gray-400/50',
      marker2: isDarkMode
        ? 'fill-white/90 stroke-white/60'
        : 'fill-white stroke-gray-400/50',
      markerGradient1Start: themeColors.marker1Start,
      markerGradient1End: themeColors.marker1End,
      markerGradient2Start: themeColors.marker2Start,
      markerGradient2End: themeColors.marker2End,
      path: themeColors.path,
      pathGlow: themeColors.pathGlow,
      pathDash: themeColors.pathDash,
      decoration: themeColors.decoration,
    };
  };

  const sizeStyles = getSizeStyles(size);
  const colorStyles = getColorStyles(color);

  // Enhanced path animation with smoother easing
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          type: 'spring',
          duration: 2.5,
          bounce: 0.2,
          ease: 'easeInOut',
        },
        opacity: { duration: 0.4 },
      },
    },
  };

  // Enhanced marker animations with scale pulse effect
  const markerVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: [0, 1.2, 1],
      opacity: 1,
      transition: {
        delay: custom * 0.5,
        duration: 0.8,
        ease: 'easeOut',
      },
    }),
    pulse: (custom: number) => ({
      scale: [1, 1.1, 1],
      transition: {
        delay: 2 + custom * 0.3,
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut',
      },
    }),
  };

  // Enhanced dash animation
  const dashVariants = {
    hidden: { pathLength: 0, pathOffset: 0 },
    visible: {
      pathLength: 0.15,
      pathOffset: 1,
      transition: {
        pathOffset: {
          repeat: Infinity,
          duration: 4,
          ease: 'easeInOut',
        },
        pathLength: { duration: 0.3 },
      },
    },
  };

  // Decoration variants
  const decorationVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 0.8,
      transition: {
        delay: 1.2 + custom * 0.3,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className={cn(sizeStyles, 'relative', className)}>
      {/* SVG for the journey path and waypoints */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients for markers */}
          <linearGradient
            id="startMarkerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="10%" stopColor={colorStyles.markerGradient1Start} />
            <stop offset="90%" stopColor={colorStyles.markerGradient1End} />
          </linearGradient>

          <linearGradient
            id="endMarkerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="10%" stopColor={colorStyles.markerGradient2Start} />
            <stop offset="90%" stopColor={colorStyles.markerGradient2End} />
          </linearGradient>

          <filter
            id="markerShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* More curved journey path with deeper curves */}
        <motion.path
          d="M15,80 C25,85 30,65 50,50 C70,35 75,15 85,20"
          fill="none"
          strokeWidth={2}
          className={cn(colorStyles.path, colorStyles.pathGlow)}
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Animated dash that travels along the path */}
        <motion.path
          d="M15,80 C25,85 30,65 50,50 C70,35 75,15 85,20"
          fill="none"
          strokeWidth={3}
          className={colorStyles.pathDash}
          variants={dashVariants}
          initial="hidden"
          animate="visible"
          strokeLinecap="round"
          strokeDasharray="1 100"
          filter="url(#glow)"
        />

        {!pathOnly && (
          <>
            {/* Connection enhancers - small circles to ensure path connections are visible */}
            <circle
              cx="15"
              cy="80"
              r="2.5"
              fill={
                isDarkMode
                  ? 'rgba(255,255,255,0.8)'
                  : colorStyles.markerGradient1End
              }
              filter="url(#glow)"
            />
            <circle
              cx="85"
              cy="20"
              r="2.5"
              fill={
                isDarkMode
                  ? 'rgba(255,255,255,0.8)'
                  : colorStyles.markerGradient2End
              }
              filter="url(#glow)"
            />

            {/* Starting marker (enhanced location pin) */}
            <motion.g
              variants={markerVariants}
              initial="hidden"
              animate={['visible', 'pulse']}
              custom={0}
              filter="url(#markerShadow)"
            >
              <motion.path
                d="M15,80 L15,73 C15,70 10,68 10,65 C10,61 12.5,58 15,58 C17.5,58 20,61 20,65 C20,68 15,70 15,73 Z"
                fill="url(#startMarkerGradient)"
                stroke={isDarkMode ? 'white' : colorStyles.markerGradient1End}
                strokeWidth={0.8}
                strokeOpacity={isDarkMode ? 0.6 : 0.9}
              />
              <motion.circle
                cx="15"
                cy="63"
                r="1.5"
                fill="white"
                fillOpacity={0.8}
              />
            </motion.g>

            {/* Ending marker (enhanced flag) */}
            <motion.g
              variants={markerVariants}
              initial="hidden"
              animate={['visible', 'pulse']}
              custom={1.4}
              filter="url(#markerShadow)"
            >
              <motion.path
                d="M85,20 L85,10"
                stroke={isDarkMode ? 'white' : colorStyles.markerGradient2End}
                strokeWidth={1.2}
                strokeOpacity={isDarkMode ? 0.8 : 0.9}
              />
              <motion.path
                d="M85,10 L95,12 L85,14 L85,10"
                fill="url(#endMarkerGradient)"
                stroke={isDarkMode ? 'white' : colorStyles.markerGradient2End}
                strokeWidth={0.8}
                strokeOpacity={isDarkMode ? 0.6 : 0.9}
              />
              <motion.circle
                cx="85"
                cy="10"
                r="1.2"
                fill="white"
                fillOpacity={0.9}
              />
            </motion.g>

            {/* Optional decorative elements */}
            {showDecorations && (
              <>
                <motion.path
                  d="M35,60 C36,57 39,57 40,60 C40.5,61.5 38,64 37.5,64.5 C37,64 34.5,61.5 35,60 Z"
                  fill={colorStyles.markerGradient1Start}
                  stroke="white"
                  strokeWidth={0.5}
                  strokeOpacity={0.6}
                  variants={decorationVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  filter="url(#markerShadow)"
                />
                <motion.path
                  d="M55,40 C57,37 60,37 62,40 C63,42 63,45 62,47 C60,50 57,50 55,47 C54,45 54,42 55,40 Z"
                  fill={colorStyles.markerGradient1End}
                  stroke="white"
                  strokeWidth={0.5}
                  strokeOpacity={0.6}
                  variants={decorationVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  filter="url(#markerShadow)"
                />
                <motion.path
                  d="M70,30 L72,25 C72.5,24 74,24 74.5,25 L77,28 C77.5,29 76,30 75,30 L70,30 Z"
                  fill={colorStyles.markerGradient2Start}
                  stroke="white"
                  strokeWidth={0.5}
                  strokeOpacity={0.6}
                  variants={decorationVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  filter="url(#markerShadow)"
                />
              </>
            )}
          </>
        )}
      </svg>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type JourneyPathAnimationProps = {
  className?: string;
  color?: 'indigo' | 'violet' | 'purple' | 'forest' | 'ocean' | 'sunset';
  size?: 'sm' | 'md' | 'lg';
};

export const JourneyPathAnimation: React.FC<JourneyPathAnimationProps> = ({
  className,
  color = 'indigo',
  size = 'md',
}) => {
  // Color styles based on the color prop
  const colorStyles = {
    indigo: {
      path: 'stroke-indigo-500/40',
      dot: 'fill-indigo-500',
      glow: 'from-indigo-500/30 to-indigo-500/0',
    },
    violet: {
      path: 'stroke-violet-500/40',
      dot: 'fill-violet-500',
      glow: 'from-violet-500/30 to-violet-500/0',
    },
    purple: {
      path: 'stroke-purple-500/40',
      dot: 'fill-purple-500',
      glow: 'from-purple-500/30 to-purple-500/0',
    },
    forest: {
      path: 'stroke-emerald-500/40',
      dot: 'fill-emerald-500',
      glow: 'from-emerald-500/30 to-emerald-500/0',
    },
    ocean: {
      path: 'stroke-sky-500/40',
      dot: 'fill-sky-500',
      glow: 'from-sky-500/30 to-sky-500/0',
    },
    sunset: {
      path: 'stroke-orange-500/40',
      dot: 'fill-orange-500',
      glow: 'from-orange-500/30 to-orange-500/0',
    },
  };

  // Size styles based on the size prop
  const sizeStyles = {
    sm: {
      width: 'w-32 md:w-40',
      height: 'h-32 md:h-40',
      strokeWidth: 'stroke-[3]',
      dotSize: 'w-2 h-2',
      glowSize: 'w-4 h-4',
    },
    md: {
      width: 'w-40 md:w-48',
      height: 'h-40 md:h-48',
      strokeWidth: 'stroke-[4]',
      dotSize: 'w-2.5 h-2.5',
      glowSize: 'w-6 h-6',
    },
    lg: {
      width: 'w-48 md:w-56',
      height: 'h-48 md:h-56',
      strokeWidth: 'stroke-[5]',
      dotSize: 'w-3 h-3',
      glowSize: 'w-8 h-8',
    },
  };

  // Animation variants for the path
  const pathVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop" as const,
        repeatDelay: 1
      }
    }
  };

  // Animation variants for the moving dot
  const dotVariants = {
    hidden: { offsetDistance: "0%" },
    visible: {
      offsetDistance: "100%",
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop" as const,
        repeatDelay: 1
      }
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "absolute inset-0",
          sizeStyles[size].width,
          sizeStyles[size].height
        )}
      >
        <motion.path
          d="M40,100 C40,60 60,40 100,40 C140,40 160,60 160,100 C160,140 140,160 100,160 C60,160 40,140 40,100 Z"
          className={cn(
            "fill-none",
            colorStyles[color].path,
            sizeStyles[size].strokeWidth
          )}
          variants={pathVariants}
          initial="hidden"
          animate="visible"
        />
      </svg>

      <motion.div
        className={cn(
          "absolute rounded-full",
          colorStyles[color].dot,
          sizeStyles[size].dotSize
        )}
        style={{
          offsetPath: "path('M40,100 C40,60 60,40 100,40 C140,40 160,60 160,100 C160,140 140,160 100,160 C60,160 40,140 40,100 Z')",
        }}
        variants={dotVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Glow effect for the dot */}
        <div
          className={cn(
            "absolute -inset-1/2 rounded-full blur-sm bg-gradient-radial",
            colorStyles[color].glow,
            sizeStyles[size].glowSize
          )}
        />
      </motion.div>
    </div>
  );
};

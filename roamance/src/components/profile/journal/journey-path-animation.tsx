import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import React from 'react';

interface JourneyPathAnimationProps {
  color?: 'indigo' | 'violet' | 'purple' | 'blue' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const JourneyPathAnimation: React.FC<JourneyPathAnimationProps> = ({
  color = 'indigo',
  size = 'md',
  className,
}) => {
  // Get size classes
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12';
      case 'md':
        return 'w-16 h-16';
      case 'lg':
        return 'w-20 h-20';
      default:
        return 'w-16 h-16';
    }
  };

  // Get color classes
  const getPathColor = () => {
    switch (color) {
      case 'indigo':
        return 'stroke-indigo-500';
      case 'violet':
        return 'stroke-violet-500';
      case 'purple':
        return 'stroke-purple-500';
      case 'blue':
        return 'stroke-blue-500';
      case 'emerald':
        return 'stroke-emerald-500';
      default:
        return 'stroke-indigo-500';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'indigo':
        return 'text-indigo-500 dark:text-indigo-400';
      case 'violet':
        return 'text-violet-500 dark:text-violet-400';
      case 'purple':
        return 'text-purple-500 dark:text-purple-400';
      case 'blue':
        return 'text-blue-500 dark:text-blue-400';
      case 'emerald':
        return 'text-emerald-500 dark:text-emerald-400';
      default:
        return 'text-indigo-500 dark:text-indigo-400';
    }
  };

  // Path animation
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: 'spring', duration: 2, bounce: 0 },
        opacity: { duration: 0.5 },
      },
    },
  };

  // Point animation
  const pointVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: custom * 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 10,
      },
    }),
  };

  return (
    <div className={cn('relative', getSizeClass(), className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Journey Path */}
        <motion.path
          d="M20,80 Q30,60 40,70 Q50,80 60,50 Q70,20 80,30"
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          className={cn('stroke-2 sm:stroke-3 fill-transparent', getPathColor())}
          strokeLinecap="round"
          strokeDasharray="0 1"
        />

        {/* Animation points */}
        {[
          { cx: 20, cy: 80, delay: 0 },
          { cx: 40, cy: 70, delay: 1 },
          { cx: 60, cy: 50, delay: 2 },
          { cx: 80, cy: 30, delay: 3 },
        ].map((point, index) => (
          <motion.g
            key={index}
            custom={point.delay}
            variants={pointVariants}
            initial="hidden"
            animate="visible"
          >
            <circle
              cx={point.cx}
              cy={point.cy}
              r="4"
              className={cn('fill-white stroke-1', getPathColor())}
            />
            {index === 0 || index === 3 ? (
              <foreignObject
                x={point.cx - 10}
                y={point.cy - 10}
                width="20"
                height="20"
                className="overflow-visible"
              >
                <div className={cn('flex items-center justify-center', getColorClass())}>
                  <MapPin className="h-5 w-5" />
                </div>
              </foreignObject>
            ) : null}
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

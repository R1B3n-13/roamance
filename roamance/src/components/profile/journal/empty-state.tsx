import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  BookMarked,
  BookOpenText,
  Map,
  MapPin,
  PlusCircle,
  Route,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { JourneyPathAnimation } from './journey-path-animation';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  suggestedAction?: string;
  actionLink?: string;
  actionText?: string;
  secondaryActionLink?: string;
  secondaryActionText?: string;
  icon?: 'journal' | 'place' | 'trip' | 'route' | 'map' | 'custom';
  customIcon?: React.ReactNode;
  type?: 'subsection' | 'entry' | 'generic' | 'journal';
  className?: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  suggestedAction,
  actionLink,
  actionText = 'Create New',
  secondaryActionLink,
  secondaryActionText = 'Browse Examples',
  icon = 'journal',
  customIcon,
  type = 'generic',
  className,
  onAction,
  onSecondaryAction,
}) => {
  // Default content based on type
  const defaultTitles = {
    journal: '✨ Your Journey Awaits',
    subsection: '📝 A Blank Canvas',
    entry: '🌱 Ready for Your Stories',
    generic: '✨ Create Something Beautiful',
  };

  const defaultDescriptions = {
    journal:
      'Capture the magic of your adventures with a beautifully crafted travel journal. Every journey deserves to be remembered.',
    subsection:
      'Paint your travel memories with words and images. Each entry is a brushstroke in the masterpiece of your journey.',
    entry: 'Fill this space with the colors, sounds, and feelings of your experiences. Your story deserves to be told.',
    generic:
      'This space is waiting for your creative touch. The first step of every adventure is simply beginning.',
  };

  const defaultSuggestedActions = {
    journal: '✈️ Ready to immortalize your travel stories?',
    subsection: '🌟 Inspired to capture a moment in time?',
    entry: '📸 Got memories worth preserving forever?',
    generic: '',
  };

  // Use provided content or defaults
  const displayTitle = title || defaultTitles[type];
  const displayDescription = description || defaultDescriptions[type];
  const displaySuggestedAction =
    suggestedAction || defaultSuggestedActions[type];

  // Animation variants with enhanced effects
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.15,
        delayChildren: 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 12, stiffness: 100 },
    },
  };

  // Enhanced visual effects for buttons
  const buttonHoverEffect = {
    scale: 1.03,
    transition: { duration: 0.2 },
  };

  // Enhanced floating animation for the icon
  const floatingAnimation = {
    y: [0, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  // Get color and icon based on type with enhanced visuals
  const getIconConfig = () => {
    switch (icon) {
      case 'journal':
        return {
          component: (
            <BookOpenText className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
          ),
          color: 'indigo',
          bgColor: 'bg-indigo-100/70 dark:bg-indigo-950/40',
          gradientFrom: 'from-indigo-500/20 dark:from-indigo-500/30',
          gradientTo: 'to-indigo-300/10 dark:to-indigo-400/5',
          shadowColor: 'shadow-indigo-500/20 dark:shadow-indigo-400/20',
          buttonGradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
          buttonShadow:
            'shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/30',
          borderGlow: 'ring-1 ring-indigo-500/20 dark:ring-indigo-400/30',
        };
      case 'place':
        return {
          component: (
            <MapPin className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
          ),
          color: 'emerald',
          bgColor: 'bg-emerald-100/70 dark:bg-emerald-950/40',
          gradientFrom: 'from-emerald-500/20 dark:from-emerald-500/30',
          gradientTo: 'to-emerald-300/10 dark:to-emerald-400/5',
          shadowColor: 'shadow-emerald-500/20 dark:shadow-emerald-400/20',
          buttonGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
          buttonShadow:
            'shadow-md shadow-emerald-500/20 dark:shadow-emerald-500/30',
          borderGlow: 'ring-1 ring-emerald-500/20 dark:ring-emerald-400/30',
        };
      case 'trip':
        return {
          component: (
            <BookMarked className="h-7 w-7 text-amber-500 dark:text-amber-400" />
          ),
          color: 'amber',
          bgColor: 'bg-amber-100/70 dark:bg-amber-950/40',
          gradientFrom: 'from-amber-500/20 dark:from-amber-500/30',
          gradientTo: 'to-amber-300/10 dark:to-amber-400/5',
          shadowColor: 'shadow-amber-500/20 dark:shadow-amber-400/20',
          buttonGradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
          buttonShadow:
            'shadow-md shadow-amber-500/20 dark:shadow-amber-500/30',
          borderGlow: 'ring-1 ring-amber-500/20 dark:ring-amber-400/30',
        };
      case 'route':
        return {
          component: (
            <Route className="h-7 w-7 text-rose-500 dark:text-rose-400" />
          ),
          color: 'rose',
          bgColor: 'bg-rose-100/70 dark:bg-rose-950/40',
          gradientFrom: 'from-rose-500/20 dark:from-rose-500/30',
          gradientTo: 'to-rose-300/10 dark:to-rose-400/5',
          shadowColor: 'shadow-rose-500/20 dark:shadow-rose-400/20',
          buttonGradient: 'bg-gradient-to-r from-rose-500 to-rose-600',
          buttonShadow: 'shadow-md shadow-rose-500/20 dark:shadow-rose-500/30',
          borderGlow: 'ring-1 ring-rose-500/20 dark:ring-rose-400/30',
        };
      case 'map':
        return {
          component: (
            <Map className="h-7 w-7 text-blue-500 dark:text-blue-400" />
          ),
          color: 'blue',
          bgColor: 'bg-blue-100/70 dark:bg-blue-950/40',
          gradientFrom: 'from-blue-500/20 dark:from-blue-500/30',
          gradientTo: 'to-blue-300/10 dark:to-blue-400/5',
          shadowColor: 'shadow-blue-500/20 dark:shadow-blue-400/20',
          buttonGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
          buttonShadow: 'shadow-md shadow-blue-500/20 dark:shadow-blue-500/30',
          borderGlow: 'ring-1 ring-blue-500/20 dark:ring-blue-400/30',
        };
      default:
        return {
          component: customIcon || (
            <BookOpenText className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
          ),
          color: 'indigo',
          bgColor: 'bg-indigo-100/70 dark:bg-indigo-950/40',
          gradientFrom: 'from-indigo-500/20 dark:from-indigo-500/30',
          gradientTo: 'to-indigo-300/10 dark:to-indigo-400/5',
          shadowColor: 'shadow-indigo-500/20 dark:shadow-indigo-400/20',
          buttonGradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
          buttonShadow:
            'shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/30',
          borderGlow: 'ring-1 ring-indigo-500/20 dark:ring-indigo-400/30',
        };
    }
  };

  const iconConfig = getIconConfig();

  // Determine button action
  const handlePrimaryAction = () => {
    if (onAction) {
      onAction();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
  };

  // Render primary action button with glassmorphism
  const renderPrimaryButton = () => {
    const buttonContent = (
      <>
        <PlusCircle className="h-4 w-4 mr-2" />
        {actionText}
      </>
    );

    if (actionLink) {
      return (
        <motion.div whileHover={buttonHoverEffect}>
          <Button
            asChild
            className={cn(
              'text-white font-medium backdrop-blur-sm relative overflow-hidden',
              iconConfig.buttonGradient,
              iconConfig.buttonShadow
            )}
          >
            <Link href={actionLink}>
              <span className="relative z-10 flex items-center">
                {buttonContent}
              </span>
              <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-300"></span>
            </Link>
          </Button>
        </motion.div>
      );
    }

    return (
      <motion.div whileHover={buttonHoverEffect}>
        <Button
          onClick={handlePrimaryAction}
          className={cn(
            'text-white font-medium backdrop-blur-sm relative overflow-hidden',
            iconConfig.buttonGradient,
            iconConfig.buttonShadow
          )}
        >
          <span className="relative z-10 flex items-center">
            {buttonContent}
          </span>
          <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-20 transition-opacity duration-300"></span>
        </Button>
      </motion.div>
    );
  };

  // Render secondary action button with glassmorphism
  const renderSecondaryButton = () => {
    if (secondaryActionLink) {
      return (
        <motion.div whileHover={buttonHoverEffect}>
          <Button
            asChild
            variant="outline"
            className={cn(
              'backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 border-white/30 dark:border-slate-700/30',
              'hover:bg-white/30 dark:hover:bg-slate-700/30 shadow-sm',
              iconConfig.borderGlow
            )}
          >
            <Link href={secondaryActionLink}>
              <span className="text-slate-700 dark:text-slate-300">
                {secondaryActionText}
              </span>
            </Link>
          </Button>
        </motion.div>
      );
    }

    if (onSecondaryAction) {
      return (
        <motion.div whileHover={buttonHoverEffect}>
          <Button
            variant="outline"
            onClick={handleSecondaryAction}
            className={cn(
              'backdrop-blur-sm bg-white/20 dark:bg-slate-800/20 border-white/30 dark:border-slate-700/30',
              'hover:bg-white/30 dark:hover:bg-slate-700/30 shadow-sm',
              iconConfig.borderGlow
            )}
          >
            <span className="text-slate-700 dark:text-slate-300">
              {secondaryActionText}
            </span>
          </Button>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center px-6 py-14 text-center rounded-xl',
        'bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/80 dark:to-slate-900/40',
        'backdrop-blur-md border border-white/30 dark:border-slate-800/30',
        'shadow-xl shadow-slate-200/20 dark:shadow-slate-900/30',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Glassmorphic decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-sky-500/10 to-indigo-500/5 rounded-full blur-xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-purple-500/5 rounded-full blur-xl"></div>

      {/* Subtle animated gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-tr opacity-20',
          iconConfig.gradientFrom,
          iconConfig.gradientTo
        )}
      ></div>

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none">
        <div
          className={cn('absolute inset-0 rounded-xl', iconConfig.borderGlow)}
        ></div>
      </div>

      <motion.div
        variants={itemVariants}
        className="mb-8 relative"
        animate={floatingAnimation}
      >
        {/* Icon container with enhanced glassmorphic background */}
        <div
          className={cn(
            'p-5 rounded-full relative z-10',
            'border border-white/50 dark:border-slate-700/50',
            'bg-gradient-to-br from-white/80 to-white/30 dark:from-slate-800/80 dark:to-slate-800/30',
            'backdrop-blur-lg shadow-lg',
            iconConfig.shadowColor
          )}
        >
          <div className="relative">
            {iconConfig.component}

            {/* Subtle sparkle effect */}
            <motion.div
              className="absolute -top-1.5 -right-1.5"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8],
                rotate: [0, 15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Sparkles className="h-4 w-4 text-violet-400/70 dark:text-violet-300/70" />
            </motion.div>
          </div>
        </div>

        {/* Position journey animation behind the icon */}
        <div className="absolute -bottom-4 -right-6 z-0">
          <JourneyPathAnimation
            size="lg"
            className="opacity-60 dark:opacity-40"
            showDecorations={true}
          />
        </div>
      </motion.div>

      <motion.h3
        variants={itemVariants}
        className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-3"
      >
        {displayTitle}
      </motion.h3>

      <motion.p
        variants={itemVariants}
        className="text-slate-600 text-[15px] dark:text-slate-300 max-w-md mb-8 leading-relaxed"
      >
        {displayDescription}
      </motion.p>

      {displaySuggestedAction && displaySuggestedAction.length > 0 && (
        <motion.p
          variants={itemVariants}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-5"
        >
          {displaySuggestedAction}
        </motion.p>
      )}

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3 z-10"
      >
        {(actionLink || onAction) && renderPrimaryButton()}
        {(secondaryActionLink || onSecondaryAction) && renderSecondaryButton()}
      </motion.div>
    </motion.div>
  );
};

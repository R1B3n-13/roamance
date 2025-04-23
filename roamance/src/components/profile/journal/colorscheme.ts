import { SubsectionType } from '@/types';

export const getSubsectionTypeColors = (type: SubsectionType) => {
  switch (type) {
    case 'SIGHTSEEING':
      return {
        bg: 'bg-violet-light/30 dark:bg-violet-dark/20',
        bgSolid: 'bg-violet-light dark:bg-violet-dark/40',
        icon: 'text-violet dark:text-violet-light',
        border: 'border-violet-light/50 dark:border-violet-dark/50',
        badge:
          'bg-violet-light/20 text-violet-dark dark:bg-violet-dark/30 dark:text-violet-light',
        gradient: 'from-violet to-lavender',
      };
    case 'ACTIVITY':
      return {
        bg: 'bg-sunset-light/30 dark:bg-sunset-dark/20',
        bgSolid: 'bg-sunset-light dark:bg-sunset-dark/40',
        icon: 'text-sunset dark:text-sunset-light',
        border: 'border-sunset-light/50 dark:border-sunset-dark/50',
        badge:
          'bg-sunset-light/20 text-sunset-dark dark:bg-sunset-dark/30 dark:text-sunset-light',
        gradient: 'from-sunset to-sand',
      };
    case 'ROUTE':
      return {
        bg: 'bg-forest-light/30 dark:bg-forest-dark/20',
        bgSolid: 'bg-forest-light dark:bg-forest-dark/40',
        icon: 'text-forest dark:text-forest-light',
        border: 'border-forest-light/50 dark:border-forest-dark/50',
        badge:
          'bg-forest-light/20 text-forest-dark dark:bg-forest-dark/30 dark:text-forest-light',
        gradient: 'from-forest to-ocean',
      };
    default:
      return {
        bg: 'bg-mountain-light/30 dark:bg-mountain-dark/20',
        bgSolid: 'bg-mountain-light dark:bg-mountain-dark/40',
        icon: 'text-mountain dark:text-mountain-light',
        border: 'border-mountain-light/50 dark:border-mountain-dark/50',
        badge:
          'bg-mountain-light/20 text-mountain-dark dark:bg-mountain-dark/30 dark:text-mountain-light',
        gradient: 'from-mountain to-ocean',
      };
  }
};

export const getJournalColorScheme = (seed: string) => {
  // Simple hash function to generate consistent color based on input string
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const schemes = [
    {
      gradient: 'from-violet to-lavender',
      bg: 'bg-violet-light/20',
      bgDark: 'dark:bg-violet-dark/20',
      icon: 'text-violet',
      iconDark: 'dark:text-violet-light',
      border: 'border-violet-light/50',
      borderDark: 'dark:border-violet-dark/50',
      badge: 'bg-violet-light/20 text-violet-dark',
      badgeDark: 'dark:bg-violet-dark/30 dark:text-violet-light',
    },
    {
      gradient: 'from-ocean to-violet',
      bg: 'bg-ocean-light/20',
      bgDark: 'dark:bg-ocean-dark/20',
      icon: 'text-ocean',
      iconDark: 'dark:text-ocean-light',
      border: 'border-ocean-light/50',
      borderDark: 'dark:border-ocean-dark/50',
      badge: 'bg-ocean-light/20 text-ocean-dark',
      badgeDark: 'dark:bg-ocean-dark/30 dark:text-ocean-light',
    },
    {
      gradient: 'from-lavender to-violet',
      bg: 'bg-lavender-light/20',
      bgDark: 'dark:bg-lavender-dark/20',
      icon: 'text-lavender',
      iconDark: 'dark:text-lavender-light',
      border: 'border-lavender-light/50',
      borderDark: 'dark:border-lavender-dark/50',
      badge: 'bg-lavender-light/20 text-lavender-dark',
      badgeDark: 'dark:bg-lavender-dark/30 dark:text-lavender-light',
    },
    {
      gradient: 'from-forest to-ocean',
      bg: 'bg-forest-light/20',
      bgDark: 'dark:bg-forest-dark/20',
      icon: 'text-forest',
      iconDark: 'dark:text-forest-light',
      border: 'border-forest-light/50',
      borderDark: 'dark:border-forest-dark/50',
      badge: 'bg-forest-light/20 text-forest-dark',
      badgeDark: 'dark:bg-forest-dark/30 dark:text-forest-light',
    },
    {
      gradient: 'from-sunset to-sand',
      bg: 'bg-sunset-light/20',
      bgDark: 'dark:bg-sunset-dark/20',
      icon: 'text-sunset',
      iconDark: 'dark:text-sunset-light',
      border: 'border-sunset-light/50',
      borderDark: 'dark:border-sunset-dark/50',
      badge: 'bg-sunset-light/20 text-sunset-dark',
      badgeDark: 'dark:bg-sunset-dark/30 dark:text-sunset-light',
    },
  ];

  return schemes[Math.abs(hash) % schemes.length];
};

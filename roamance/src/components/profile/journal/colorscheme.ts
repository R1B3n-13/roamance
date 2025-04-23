import { SubsectionType } from '@/types';
import { stringToHashNum } from '@/utils';

// Define color scheme types
type ColorSchemeType = 'ocean' | 'sunset' | 'forest' | 'violet' | 'lavender';

// Interface for journal color scheme
export interface JournalColorScheme {
  type: ColorSchemeType;
  mainColor: string;
  accentColor: string;
  lightVariant: string;
  darkVariant: string;
}

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

/**
 * This function consistently maps a journal title to a specific color scheme
 * so that the same journal always gets the same colors.
 */
export function getJournalColorScheme(title: string): JournalColorScheme {
  // Generate a consistent hash number from the title
  const hashNum = stringToHashNum(title);

  // Map the hash to one of the color schemes (ensures consistent assignment)
  const colorTypes: ColorSchemeType[] = ['ocean', 'sunset', 'forest', 'violet', 'lavender'];
  const typeIndex = hashNum % colorTypes.length;
  const colorType = colorTypes[typeIndex];

  // Return the appropriate color scheme
  switch (colorType) {
    case 'ocean':
      return {
        type: 'ocean',
        mainColor: 'var(--color-ocean)',
        accentColor: 'var(--color-ocean-light)',
        lightVariant: 'var(--color-ocean-light)',
        darkVariant: 'var(--color-ocean-dark)',
      };
    case 'sunset':
      return {
        type: 'sunset',
        mainColor: 'var(--color-sunset)',
        accentColor: 'var(--color-sand)',
        lightVariant: 'var(--color-sunset-light)',
        darkVariant: 'var(--color-sunset-dark)',
      };
    case 'forest':
      return {
        type: 'forest',
        mainColor: 'var(--color-forest)',
        accentColor: 'var(--color-forest-light)',
        lightVariant: 'var(--color-forest-light)',
        darkVariant: 'var(--color-forest-dark)',
      };
    case 'violet':
      return {
        type: 'violet',
        mainColor: 'var(--color-violet)',
        accentColor: 'var(--color-violet-light)',
        lightVariant: 'var(--color-violet-light)',
        darkVariant: 'var(--color-violet-dark)',
      };
    case 'lavender':
      return {
        type: 'lavender',
        mainColor: 'var(--color-lavender)',
        accentColor: 'var(--color-lavender-light)',
        lightVariant: 'var(--color-lavender-light)',
        darkVariant: 'var(--color-lavender-dark)',
      };
    default:
      // Default to ocean theme
      return {
        type: 'ocean',
        mainColor: 'var(--color-ocean)',
        accentColor: 'var(--color-ocean-light)',
        lightVariant: 'var(--color-ocean-light)',
        darkVariant: 'var(--color-ocean-dark)',
      };
  }
}

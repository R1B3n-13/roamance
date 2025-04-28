'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

interface CollapsibleTriggerProps
  extends React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger> {
  colorScheme?:
    | 'ocean'
    | 'sunset'
    | 'forest'
    | 'sand'
    | 'mountain'
    | 'violet'
    | 'lavender'
    | 'primary'
    | 'secondary'
    | 'accent';
  showArrow?: boolean;
  arrowSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hoverEffect?:
    | 'glow'
    | 'scale'
    | 'pulse'
    | 'slide'
    | 'fade'
    | 'none'
    | 'fluid'
    | 'bubble';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CollapsibleTrigger({
  className,
  children,
  colorScheme = 'primary',
  showArrow = true,
  arrowSize = 'lg',
  hoverEffect = 'bubble',
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: CollapsibleTriggerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || false);
  const [darkMode, setDarkMode] = useState(false);

  // Sync with controlled open state from parent
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    // Check for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    // Update dark mode on change
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Get color based on colorScheme
  const getColorClass = () => {
    const colorMap = {
      ocean: darkMode ? 'text-[var(--chart-1)]' : 'text-[var(--ocean)]',
      sunset: darkMode ? 'text-[var(--chart-2)]' : 'text-[var(--sunset)]',
      forest: darkMode ? 'text-[var(--chart-3)]' : 'text-[var(--forest)]',
      violet: darkMode ? 'text-[var(--chart-4)]' : 'text-[var(--violet)]',
      sand: darkMode ? 'text-[var(--chart-5)]' : 'text-[var(--sand)]',
      mountain: darkMode ? 'text-[var(--mountain)]' : 'text-[var(--mountain)]',
      lavender: darkMode ? 'text-[var(--lavender)]' : 'text-[var(--lavender)]',
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent',
    };

    return colorMap[colorScheme] || 'text-primary';
  };

  // Get background color based on colorScheme (for fluid effect)
  const getBgColor = () => {
    const bgMap = {
      ocean: darkMode ? 'var(--chart-1)' : 'var(--ocean-light)',
      sunset: darkMode ? 'var(--chart-2)' : 'var(--sunset-light)',
      forest: darkMode ? 'var(--chart-3)' : 'var(--forest-light)',
      violet: darkMode ? 'var(--chart-4)' : 'var(--violet-light)',
      sand: darkMode ? 'var(--chart-5)' : 'var(--sand-light)',
      mountain: darkMode ? 'var(--mountain)' : 'var(--mountain-light)',
      lavender: darkMode ? 'var(--lavender)' : 'var(--lavender-light)',
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      accent: 'var(--accent)',
    };

    return bgMap[colorScheme] || 'var(--primary)';
  };

  // Get shadow color for glow effect
  const getShadowColor = () => {
    const shadowMap = {
      ocean: darkMode ? 'var(--chart-1)' : 'var(--ocean)',
      sunset: darkMode ? 'var(--chart-2)' : 'var(--sunset)',
      forest: darkMode ? 'var(--chart-3)' : 'var(--forest)',
      violet: darkMode ? 'var(--chart-4)' : 'var(--violet)',
      sand: darkMode ? 'var(--chart-5)' : 'var(--sand)',
      mountain: darkMode ? 'var(--mountain)' : 'var(--mountain)',
      lavender: darkMode ? 'var(--lavender)' : 'var(--lavender)',
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      accent: 'var(--accent)',
    };

    return shadowMap[colorScheme] || 'var(--primary)';
  };

  // Get size class
  const getSizeClass = () => {
    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10',
    };

    return sizeMap[arrowSize] || 'w-5 h-5';
  };

  // Get hover effect class
  const getHoverEffectClass = () => {
    if (hoverEffect === 'none') return '';
    const effectMap = {
      glow: `hover:shadow-[0_0_8px_var(--shadow-color)] hover:-translate-y-[2px] transition-all duration-300`,
      scale: 'hover:scale-110 hover:opacity-90 transition-all duration-300',
      pulse: 'hover:animate-pulse-slow',
      slide: 'hover:translate-x-1 transition-transform duration-300',
      fade: 'hover:opacity-70 transition-opacity duration-300',
      fluid:
        'group-hover:bg-[var(--bg-color)] group-hover:text-background group-hover:rounded-full p-1 -m-1 transition-all duration-300 ease-in-out',
      bubble:
        "before:absolute before:content-[''] before:inset-0 before:rounded-full before:bg-[var(--bg-color)] before:scale-0 group-hover:before:scale-110 before:opacity-0 group-hover:before:opacity-15 before:transition-all before:duration-300 before:-z-10 relative z-0 group-hover:text-current",
    };
    return effectMap[hoverEffect] || effectMap.fluid;
  };

  const arrowClasses = cn(
    getSizeClass(),
    getColorClass(),
    'transition-all duration-300 ease-in-out',
    isOpen ? 'rotate-180' : 'rotate-0'
  );

  const arrowStyle = {
    '--shadow-color': getShadowColor(),
    '--bg-color': getBgColor(),
  } as React.CSSProperties;

  // Create a single wrapper for either children or default arrow
  const contentWithArrows = (
    <div className="flex items-center gap-2 w-auto">
      {children || (showArrow && (
        <span
          className={cn(
            'inline-flex items-center justify-center',
            getHoverEffectClass()
          )}
          style={arrowStyle}
          data-hover-effect={hoverEffect}
        >
          <ChevronDown
            className={arrowClasses}
            strokeWidth={2.5}
          />
        </span>
      ))}
    </div>
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newOpenState = !isOpen;
    if (open === undefined) {
      // Only set local state if this is an uncontrolled component
      setIsOpen(newOpenState);
    }

    // Notify parent about state change
    onOpenChange?.(newOpenState);

    // Call original onClick if provided
    props.onClick?.(e);
  };

  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      className={cn(
        'group flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded cursor-pointer',
        className
      )}
      data-slot="collapsible-trigger"
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
      onClick={handleClick}
    >
      {contentWithArrows}
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
}

function CollapsibleContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      className={cn('overflow-hidden transition-all', className)}
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

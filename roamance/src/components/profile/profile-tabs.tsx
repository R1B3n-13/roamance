'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { User, Settings, Compass, Bookmark } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  const tabs = [
    {
      id: 'info',
      label: 'Information',
      icon: User,
      color: 'ocean',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Settings,
      color: 'sunset',
    },
    {
      id: 'trips',
      label: 'My Trips',
      icon: Compass,
      color: 'forest',
    },
    {
      id: 'saved',
      label: 'Saved Places',
      icon: Bookmark,
      color: 'sand',
    },
  ];

  // Function to get the correct color class for each tab
  const getColorClass = (tabColor: string, type: 'text' | 'bg' | 'border') => {
    const colorMap: Record<string, Record<string, string>> = {
      ocean: { text: 'text-ocean', bg: 'bg-ocean', border: 'border-ocean' },
      sunset: { text: 'text-sunset', bg: 'bg-sunset', border: 'border-sunset' },
      forest: { text: 'text-forest', bg: 'bg-forest', border: 'border-forest' },
      sand: { text: 'text-sand', bg: 'bg-sand', border: 'border-sand' },
    };

    return colorMap[tabColor]?.[type] || '';
  };

  return (
    <div className="relative mt-8">
      <div className="flex overflow-x-auto scrollbar-hide backdrop-blur-sm">
        <div className="flex mx-auto md:mx-0 gap-1 pb-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
              className={cn(
                'relative flex items-center gap-2 px-5 py-3.5',
                'rounded-t-lg text-sm font-medium transition-all duration-300',
                'border-b-2 border-transparent cursor-pointer',
                activeTab === tab.id
                  ? `${getColorClass(tab.color, 'text')} border-b-2 ${getColorClass(tab.color, 'border')}`
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center p-1.5 rounded-full',
                  activeTab === tab.id
                    ? `${getColorClass(tab.color, 'bg')}/10`
                    : 'bg-muted/20'
                )}
              >
                <tab.icon
                  className={cn(
                    'h-4 w-4',
                    activeTab === tab.id
                      ? getColorClass(tab.color, 'text')
                      : 'text-muted-foreground'
                  )}
                />
              </div>
              <span>{tab.label}</span>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={cn(
                    'absolute left-0 right-0 h-0.5 bottom-[-1px] rounded-full',
                    getColorClass(tab.color, 'bg')
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-2xl -z-10" />
      <div className="absolute -left-5 -bottom-5 w-48 h-48 bg-gradient-radial from-sunset/5 to-transparent rounded-full blur-3xl -z-10" />
    </div>
  );
}

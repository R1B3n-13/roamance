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

  return (
    <div className="relative mt-8 overflow-x-auto">
      <div className="flex border-b scrollbar-hide min-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              'flex-1 justify-center md:justify-start md:flex-initial',
              activeTab === tab.id
                ? `text-${tab.color}`
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon
              className={cn(
                'h-4 w-4',
                activeTab === tab.id && `text-${tab.color}`
              )}
            />
            <span>{tab.label}</span>

            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={cn(
                  'absolute bottom-0 left-0 right-0 h-0.5',
                  `bg-${tab.color}`
                )}
                style={{ borderRadius: 999 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

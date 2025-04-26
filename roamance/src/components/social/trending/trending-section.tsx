'use client';

import { cn } from '@/lib/utils';
import { User } from '@/types';
import { TrendingUp, Users } from 'lucide-react';
import { TrendingItemSkeleton } from '../ui/shared-components';
import { TrendingItem, TrendingItemProps } from './trending-item';
import { TrendingUser } from './trending-user';

export interface TrendingSectionProps {
  trendingItems: TrendingItemProps[];
  trendingUsers?: User[];
  loading?: boolean;
  onItemClick?: (item: TrendingItemProps) => void;
  onUserClick?: (user: User) => void;
}

export const TrendingSection = ({
  trendingItems,
  trendingUsers = [],
  loading = false,
  onItemClick,
  onUserClick
}: TrendingSectionProps) => {
  if (loading) {
    return <TrendingSectionSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700/50">
      <TrendingSectionHeader title="Trending Now" icon={<TrendingUp className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />} />

      <div className="divide-y divide-gray-50 dark:divide-gray-700/30">
        {trendingItems.map(item => (
          <TrendingItem
            key={item.id}
            {...item}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>

      {trendingUsers && trendingUsers.length > 0 && (
        <>
          <TrendingSectionHeader
            title="Travelers to Follow"
            icon={<Users className="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400" />}
            className="mt-2"
            bordered
          />

          <div className="p-3 flex flex-wrap gap-2">
            {trendingUsers.slice(0, 6).map(user => (
              <TrendingUser
                key={user.id}
                user={user}
                onClick={() => onUserClick?.(user)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface TrendingSectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  className?: string;
  bordered?: boolean;
}

const TrendingSectionHeader = ({ title, icon, className, bordered = false }: TrendingSectionHeaderProps) => (
  <div className={cn(
    "p-4",
    bordered && "border-t border-b border-gray-100 dark:border-gray-700/30",
    className
  )}>
    <h3 className="font-semibold text-base text-gray-900 dark:text-white flex items-center">
      {icon}
      {title}
    </h3>
  </div>
);

const TrendingSectionSkeleton = () => (
  <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700/50">
    <div className="p-4 border-b border-gray-100 dark:border-gray-700/30">
      <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>

    <div className="divide-y divide-gray-50 dark:divide-gray-700/30">
      {Array(4).fill(0).map((_, i) => (
        <TrendingItemSkeleton key={i} />
      ))}
    </div>
  </div>
);

'use client';

import { cn } from '@/lib/utils';
import { User } from '@/types';
import { motion } from 'framer-motion';
import { Flame, Sparkles, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/* -------------------------------- User Avatar ------------------------------- */

export interface UserAvatarProps {
  user?: User;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  imageUrl?: string;
  alt?: string;
  showBorder?: boolean;
}

export const UserAvatar = ({
  user,
  size = 'md',
  href,
  className,
  imageUrl,
  alt,
  showBorder = true,
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const avatarImage = (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0 transition-transform duration-500 group-hover:scale-110',
        showBorder &&
          'ring-2 ring-purple-200 dark:ring-purple-700 ring-offset-2 ring-offset-white dark:ring-offset-gray-800',
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={
          imageUrl || user?.profile_image || '/images/roamance-logo-no-text.png'
        }
        alt={alt || user?.name || 'User'}
        layout="fill"
        style={{ objectFit: 'cover' }}
        className="rounded-full"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-black/0 group-hover:from-purple-500/20 group-hover:to-blue-500/10 transition-colors duration-500 rounded-full"></div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group">
        {avatarImage}
      </Link>
    );
  }

  return avatarImage;
};

/* ----------------------------- Trending Icons ------------------------------ */

export interface TrendingIconProps {
  type: 'topic' | 'hashtag' | 'location' | 'user';
  className?: string;
}

export const TrendingIcon = ({ type, className }: TrendingIconProps) => {
  switch (type) {
    case 'topic':
      return <Sparkles className={cn('h-4 w-4 text-purple-500', className)} />;
    case 'hashtag':
      return <TrendingUp className={cn('h-4 w-4 text-blue-500', className)} />;
    case 'location':
      return <Flame className={cn('h-4 w-4 text-amber-500', className)} />;
    case 'user':
      return <Users className={cn('h-4 w-4 text-green-500', className)} />;
    default:
      return null;
  }
};

/* ---------------------------- Media Indicators ---------------------------- */

export interface MediaIndicatorProps {
  count: number;
  type: 'image' | 'video';
}

export const MediaIndicator = ({ count, type }: MediaIndicatorProps) => {
  const Icon =
    type === 'image'
      ? ({ className }: { className?: string }) => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        )
      : ({ className }: { className?: string }) => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m22 8-6 4 6 4V8Z" />
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
          </svg>
        );

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg text-white text-xs font-medium flex items-center shadow-lg"
    >
      <Icon className="h-3.5 w-3.5 mr-1.5" />
      <span>{count}</span>
    </motion.div>
  );
};

/* ----------------------------- Action Button ------------------------------ */

export interface ActionButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  activeColor?: string;
  count?: number;
  onClick?: () => void;
  label?: string;
}

export const ActionButton = ({
  icon,
  active = false,
  activeColor = 'pink',
  count,
  onClick,
  label,
}: ActionButtonProps) => {
  const colorClasses = {
    pink: 'text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400',
    blue: 'text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400',
    purple:
      'text-purple-500 dark:text-purple-400 fill-purple-500 dark:fill-purple-400',
    amber:
      'text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400',
  };

  const hoverColor = {
    pink: 'group-hover:text-pink-500 dark:group-hover:text-pink-400',
    blue: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
    purple: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
    amber: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group flex items-center relative"
    >
      <div
        className={cn(
          'relative transition-all duration-300',
          active
            ? colorClasses[activeColor as keyof typeof colorClasses]
            : 'text-gray-400 dark:text-gray-500',
          !active && hoverColor[activeColor as keyof typeof hoverColor]
        )}
      >
        {icon}
      </div>

      {count !== undefined && (
        <span
          className={cn(
            'text-sm font-medium ml-2 transition-colors',
            active
              ? colorClasses[activeColor as keyof typeof colorClasses]
              : 'text-gray-500 dark:text-gray-400',
            !active && hoverColor[activeColor as keyof typeof hoverColor]
          )}
        >
          {count}
        </span>
      )}

      {label && (
        <span
          className={cn(
            'text-sm font-medium ml-2 transition-colors',
            active
              ? colorClasses[activeColor as keyof typeof colorClasses]
              : 'text-gray-500 dark:text-gray-400',
            !active && hoverColor[activeColor as keyof typeof hoverColor]
          )}
        >
          {label}
        </span>
      )}
    </motion.button>
  );
};

/* ----------------------------- Loading States ----------------------------- */

export const PostCardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm border border-gray-100/80 dark:border-gray-700/30 p-5">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-1/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
      <div className="flex justify-between">
        <div className="h-5 w-1/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-5 w-1/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export const TrendingItemSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

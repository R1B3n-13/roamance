'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingIcon } from '../ui/shared-components';

export interface TrendingItemProps {
  id: string;
  title: string;
  imageSrc?: string;
  count: number;
  type: 'topic' | 'hashtag' | 'location' | 'user';
  onClick?: () => void;
}

export const TrendingItem = ({
  title,
  imageSrc,
  count,
  type,
  onClick
}: TrendingItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {imageSrc ? (
        <div className="relative h-10 w-10 rounded-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-100 dark:border-purple-800/30">
          <TrendingIcon type={type} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {count.toLocaleString()} {type === 'user' ? 'travelers' : 'posts'}
        </p>
      </div>
    </motion.div>
  );
};

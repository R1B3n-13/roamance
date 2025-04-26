'use client';

import { User } from '@/types';
import { motion } from 'framer-motion';
import { UserAvatar } from '../ui/shared-components';

export interface TrendingUserProps {
  user: User;
  onClick?: () => void;
}

export const TrendingUser = ({ user, onClick }: TrendingUserProps) => {
  return (
    <div
      className="flex flex-col items-center gap-1 p-2 cursor-pointer group"
      onClick={onClick}
    >
      <motion.div whileHover={{ scale: 1.05 }} className="relative">
        <UserAvatar
          user={user}
          size="md"
          showBorder
          className="h-14 w-14 group-hover:border-purple-300 dark:group-hover:border-purple-700 transition-colors"
        />
      </motion.div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-center truncate max-w-[60px]">
        {user.name || user.email}
      </span>
    </div>
  );
};

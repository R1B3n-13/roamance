'use client';

import { User } from '@/types';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { UserAvatar } from '../ui/shared-components';
import { formatTimestamp } from '@/utils';

export interface PostHeaderProps {
  user: User;
  timestamp: string;
  location?: { latitude: number; longitude: number; name?: string };
}

export const PostHeader = ({ user, timestamp, location }: PostHeaderProps) => {
  return (
    <div className="flex items-center space-x-4">
      <UserAvatar user={user} size="lg" href={`/profile/${user.id}`} />

      <div>
        <Link
          href={`/profile/${user.id}`}
          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          {user.name || user.email}
        </Link>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {location && (
            <motion.div
              whileHover={{ y: -2 }}
              className="flex items-center mr-3 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 mr-1 text-pink-500 dark:text-pink-400" />
              <span className="truncate max-w-[150px]">
                {location.name ||
                  `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
              </span>
            </motion.div>
          )}
          <span className="text-xs bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

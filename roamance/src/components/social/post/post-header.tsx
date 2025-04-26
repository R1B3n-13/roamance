'use client';

import { formatTimestamp } from '@/utils';
import { User } from '@/types';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface PostHeaderProps {
  user: User;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

export const PostHeader = ({ user, timestamp, location }: PostHeaderProps) => {
  return (
    <div className="flex items-center space-x-3">
      <Link href={`/profile/${user.id}`} className="group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-700 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 shadow-sm"
        >
          <Image
            src={user.profile_image || '/images/roamance-logo-no-text.png'}
            alt={user.name || 'User'}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-black/0 group-hover:from-purple-500/20 group-hover:to-blue-500/10 transition-colors duration-500 rounded-full"></div>
        </motion.div>
      </Link>

      <div>
        <Link
          href={`/profile/${user.id}`}
          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors group inline-flex items-center gap-1"
        >
          <span>{user.name}</span>
          {/* {user.is_verified && (
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7 }}
              className="bg-blue-100 dark:bg-blue-900/30 p-0.5 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 dark:text-blue-400"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </motion.div>
          )} */}
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
          <span className="text-xs bg-gray-100/70 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

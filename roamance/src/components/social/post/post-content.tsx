'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User } from '@/types';
import { formatTimestamp } from '@/utils';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface PostContentProps {
  text: string;
  tidbits?: string;
  user: User;
  timestamp: string;
}

export const PostContent = ({
  text,
  tidbits,
  user,
  timestamp
}: PostContentProps) => {
  const [showAll, setShowAll] = useState(false);
  const EMPTY_TIDBITS = 'Nothing to show';

  return (
    <div className="px-5 py-3 flex-grow">
      {/* Post text content with improved typography */}
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-[15px] tracking-wide">
        {showAll
          ? text
          : text.length > 150
            ? `${text.substring(0, 150)}...`
            : text}
        {text.length > 150 && !showAll && (
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => setShowAll(true)}
            className="ml-1 text-purple-600 dark:text-purple-400 font-medium hover:underline focus:outline-none"
          >
            Read more
          </motion.button>
        )}
      </p>

      {/* Tidbits Preview with enhanced animation and styling */}
      {tidbits && tidbits.length > 0 && tidbits !== EMPTY_TIDBITS && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center">
            <span className="relative mr-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'reverse',
                  duration: 2,
                }}
                className="absolute -inset-1 bg-gradient-to-r from-violet-400/20 to-purple-500/20 rounded-full blur-sm"
              />
              <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 relative" />
            </span>
            Travel Tidbits
          </h4>
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <motion.span
                  whileHover={{
                    y: -2,
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)',
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 text-violet-600 dark:text-violet-400 text-sm font-medium border border-violet-100/40 dark:border-violet-800/30 transition-all cursor-pointer shadow-sm"
                >
                  {tidbits.length > 50
                    ? `${tidbits.substring(0, 50)}...`
                    : tidbits}
                </motion.span>
              </PopoverTrigger>
              <PopoverContent className="w-full max-w-lg p-5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl border border-purple-100 dark:border-purple-800/30 rounded-xl">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                    <Sparkles className="h-4 w-4 mr-2 text-violet-500 dark:text-violet-400" />
                    Travel Tidbits
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {tidbits}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center">
                    <Image
                      src={user.profile_image || '/images/roamance-logo-no-text.png'}
                      alt={user.name || 'User'}
                      width={24}
                      height={24}
                      className="rounded-full mr-2 border border-white dark:border-gray-800"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(timestamp)}
                    </span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};

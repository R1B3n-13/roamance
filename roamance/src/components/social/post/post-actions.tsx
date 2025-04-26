'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ActionButton } from '../ui/shared-components';

export interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
}

export const PostActions = ({
  likesCount,
  commentsCount,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onSave,
  onShare
}: PostActionsProps) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike();
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  const handleShareClick = () => {
    onShare();
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2000);
  };

  return (
    <div className="px-5 py-4 border-t border-gray-100/80 dark:border-gray-700/30 flex items-center justify-between mt-auto">
      <div className="flex items-center space-x-8">
        {/* Like button with animation */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLikeClick}
          className="group flex items-center relative"
        >
          <div className="relative">
            <Heart
              className={cn(
                'h-6 w-6 mr-2 transition-all duration-300',
                isLiked
                  ? 'fill-pink-500 text-pink-500 dark:fill-pink-400 dark:text-pink-400'
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-pink-500 dark:group-hover:text-pink-400'
              )}
            />
            {isLikeAnimating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.8, opacity: [0, 1, 0] }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Heart className="h-6 w-6 fill-pink-500 text-pink-500" />
              </motion.div>
            )}
          </div>
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              isLiked
                ? 'text-pink-500 dark:text-pink-400'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-pink-500 dark:group-hover:text-pink-400'
            )}
          >
            {likesCount}
          </span>
        </motion.button>

        {/* Comment button */}
        <ActionButton
          icon={<MessageCircle className="h-6 w-6 mr-2" />}
          count={commentsCount}
          onClick={onComment}
          activeColor="blue"
        />
      </div>

      <div className="flex items-center space-x-5">
        {/* Save button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="group flex items-center relative"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'h-5 w-5 transition-all duration-300',
                isSaved
                  ? 'text-purple-500 dark:text-purple-400'
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400'
              )}
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </div>
        </motion.button>

        {/* Share button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShareClick}
          className="group relative"
        >
          <Share2 className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />

          {/* Share tooltip */}
          {shareTooltip && (
            <div className="absolute -top-12 right-0 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm animate-fade-in-out z-10">
              Link copied to clipboard!
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
};

'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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
    <div className="px-5 py-4 border-t border-gray-100/50 dark:border-gray-700/30 flex items-center justify-between mt-auto">
      <div className="flex items-center space-x-8">
        {/* Like button with improved animation */}
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
            {likesCount > 0 ? likesCount.toLocaleString() : ''}
          </span>
        </motion.button>

        {/* Comment button with subtle hover effect */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComment}
          className="group flex items-center relative"
        >
          <MessageCircle className={cn(
            'h-6 w-6 mr-2 transition-colors',
            'text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
          )} />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            {commentsCount > 0 ? commentsCount.toLocaleString() : ''}
          </span>
        </motion.button>
      </div>

      <div className="flex items-center space-x-5">
        {/* Save button with animation */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="group relative"
        >
          <Bookmark
            className={cn(
              'h-5 w-5 transition-all duration-300',
              isSaved
                ? 'fill-purple-500 text-purple-500 dark:fill-purple-400 dark:text-purple-400'
                : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400'
            )}
          />
        </motion.button>

        {/* Share button with tooltip */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShareClick}
          className="group relative"
        >
          <Share2 className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />

          {/* Enhanced share tooltip */}
          {shareTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -top-12 right-0 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm z-10 shadow-md"
            >
              Link copied to clipboard!
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
};

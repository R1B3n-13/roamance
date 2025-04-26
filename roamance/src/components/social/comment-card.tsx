import { Comment, User } from '@/types';
import { MoreHorizontal, ThumbsUp, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CommentCardProps {
  comment: Comment;
  currentUser?: User;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

export const CommentCard = ({ comment, onLike, onReply }: CommentCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(comment.id);
  };

  const handleReply = () => {
    setShowReplyInput(!showReplyInput);
    if (onReply) onReply(comment.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 group animate-in fade-in"
    >
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="h-8 w-8 rounded-full overflow-hidden ring-1 ring-purple-200/50 dark:ring-purple-700/50 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 shadow-sm"
        >
          <Image
            src={
              comment.user.profile_image ||
              '/images/roamance-logo-no-text.png'
            }
            alt={comment.user.name || 'User'}
            fill
            style={{ objectFit: 'cover' }}
            className="rounded-full"
          />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-2xl rounded-tl-none shadow-sm backdrop-blur-sm border border-gray-100/40 dark:border-gray-700/40">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-1">
              {comment.user.name}
              {/* {comment.user.is_verified && (
                <span className="inline-flex text-blue-500 dark:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </span>
              )} */}
            </h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </motion.button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words">
            {comment.text}
          </p>

          {comment.image_path && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-2 rounded-lg overflow-hidden shadow-sm"
            >
              <Image
                src={comment.image_path}
                alt="Comment attachment"
                width={200}
                height={150}
                className="object-cover rounded-lg"
              />
            </motion.div>
          )}

          {comment.video_path && (
            <div className="mt-2 rounded-lg overflow-hidden shadow-sm">
              <video
                src={comment.video_path}
                controls
                preload="metadata"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-2 mt-1.5 text-xs">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1 transition-colors',
              isLiked
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
            )}
          >
            <ThumbsUp
              className={cn(
                'h-3.5 w-3.5',
                isLiked ? 'fill-purple-600 dark:fill-purple-400' : ''
              )}
            />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleReply}
            className={cn(
              'flex items-center gap-1 transition-colors',
              showReplyInput
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Reply</span>
          </motion.button>

          <span className="text-gray-400 dark:text-gray-500">
            {new Date(comment.audit.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Reply input (conditional) */}
        {showReplyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pl-2"
          >
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/images/roamance-logo-no-text.png"
                  alt="Your profile"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-500 dark:text-purple-400 text-xs font-medium">
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

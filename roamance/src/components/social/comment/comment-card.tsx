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

export const CommentCard = ({
  comment,
  currentUser,
  onLike,
  onReply,
}: CommentCardProps) => {
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
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-3 group animate-fade-up"
    >
      <div className="relative flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="h-9 w-9 rounded-full overflow-hidden border-2 border-ocean-light dark:border-ocean shadow-soft-xl"
        >
          <Image
            src={
              comment.user.profile_image || '/images/roamance-logo-no-text.png'
            }
            alt={comment.user.name || 'User'}
            height={0}
            width={0}
            sizes="full"
            className="rounded-full h-full w-full object-cover"
          />
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="glass-card border-gradient border-gradient-light dark:border-gradient-dark p-3.5 rounded-2xl shadow-glass dark:shadow-glass-dark">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              {comment.user.name}
              {/* {comment.user.is_verified && (
                <span className="inline-flex text-ocean">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <MoreHorizontal className="h-4 w-4" />
            </motion.button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5 break-words leading-relaxed">
            {comment.text}
          </p>

          {comment.image_path && (
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="mt-3 rounded-xl overflow-hidden shadow-sm"
            >
              <Image
                src={comment.image_path}
                alt="Comment attachment"
                width={200}
                height={150}
                className="object-cover rounded-xl w-full"
              />
            </motion.div>
          )}

          {comment.video_path && (
            <div className="mt-3 rounded-xl overflow-hidden shadow-md">
              <video
                src={comment.video_path}
                controls
                preload="metadata"
                className="max-w-full h-auto rounded-xl"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 px-3 mt-2 text-xs">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 transition-all duration-200',
              isLiked
                ? 'text-sunset dark:text-sunset-light font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-sunset dark:hover:text-sunset-light'
            )}
          >
            <ThumbsUp
              className={cn(
                'h-3.5 w-3.5',
                isLiked ? 'fill-sunset dark:fill-sunset-light' : ''
              )}
            />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            onClick={handleReply}
            className={cn(
              'flex items-center gap-1.5 transition-all duration-200',
              showReplyInput
                ? 'text-ocean dark:text-ocean-light font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-ocean dark:hover:text-ocean-light'
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

        {/* Reply input (consistent with CommentForm) */}
        {showReplyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mt-3"
          >
            <div className="glass-card border-gradient border-gradient-light dark:border-gradient-dark rounded-xl overflow-hidden shadow-sm p-2.5">
              <div className="flex gap-2.5">
                <div className="relative h-7 w-7 rounded-full overflow-hidden flex-shrink-0 border-2 border-ocean-light dark:border-ocean shadow-sm">
                  <Image
                    src={
                      currentUser?.profile_image ||
                      '/images/roamance-logo-no-text.png'
                    }
                    alt={currentUser?.name || 'User'}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-full"
                  />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    className="w-full p-2 rounded-xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100/80 dark:border-gray-700/50 text-xs focus:outline-none focus:ring-2 focus:ring-ocean/40 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-ocean hover:bg-ocean-dark dark:bg-ocean dark:hover:bg-ocean-dark text-white transition-colors text-xs font-medium rounded-lg px-3 py-1 shadow-sm"
                  >
                    Reply
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

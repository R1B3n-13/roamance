'use client';

import { Post, User } from '@/types';
import { motion } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Star, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PostHeader } from './post-header';
import { PostMedia } from './post-media';
import { PostContent } from './post-content';
import { PostActions } from './post-actions';
import { PostMenu } from './post-menu';
import { PostCardSkeleton } from '../feed/feed-skeleton';

export interface PostCardProps {
  post: Post;
  currentUser?: User;
  loading?: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onFollow?: (userId: string) => void;
  onReport?: (postId: string) => void;
}

export const PostCard = ({
  post,
  currentUser,
  loading = false,
  onLike,
  onComment,
  onSave,
  onShare,
  onDelete,
  onEdit,
  onFollow,
  onReport,
}: PostCardProps) => {
  const [showTidbitPopover, setShowTidbitPopover] = useState(false);

  if (loading) {
    return <PostCardSkeleton />;
  }

  const isLiked = post.liked_by?.some((user) => user.id === currentUser?.id);
  const isSaved = post.saved_by?.some((user) => user.id === currentUser?.id);
  const isOwnPost = post.user.id === currentUser?.id;
  const hasMedia = post.image_paths?.length > 0 || post.video_paths?.length > 0;

  // Determine if this is a featured post (more than 10 likes)
  const isFeatured = (post.likes_count || 0) > 10;

  return (
    <motion.div
      layout
      className={`
        bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl
        rounded-2xl overflow-hidden shadow-sm hover:shadow-md
        transition-all duration-300 border
        ${
          isFeatured
            ? 'border-purple-200/80 dark:border-purple-700/40'
            : 'border-gray-100/80 dark:border-gray-700/30'
        }
        flex flex-col
      `}
    >
      {/* Featured Post Badge */}
      {isFeatured && (
        <div className="w-full px-4 py-1.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 dark:from-purple-500/20 dark:via-indigo-500/20 dark:to-pink-500/20 border-b border-purple-200/60 dark:border-purple-700/30">
          <p className="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center">
            <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
            Featured Moment
          </p>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <PostHeader
          user={post.user}
          timestamp={post.audit?.created_at}
          location={post.location}
        />

        <PostMenu
          isOwnPost={isOwnPost}
          onEdit={onEdit ? () => onEdit(post.id) : undefined}
          onDelete={() => onDelete(post.id)}
          onShare={() => onShare(post.id)}
          onReport={onReport ? () => onReport(post.id) : undefined}
          onFollow={
            onFollow && !isOwnPost ? () => onFollow(post.user.id) : undefined
          }
        />
      </div>

      {/* Post Content */}
      <PostContent
        text={post.text}
        tidbits={post.tidbits}
        user={post.user}
        timestamp={post.audit?.created_at}
      />

      {/* Post Media */}
      {hasMedia && (
        <PostMedia
          imagePaths={post.image_paths || []}
          videoPaths={post.video_paths || []}
        />
      )}

      {/* Post Actions */}
      <PostActions
        likesCount={post.likes_count || 0}
        commentsCount={post.comments_count || 0}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={() => onLike(post.id)}
        onComment={() => onComment(post.id)}
        onSave={() => onSave(post.id)}
        onShare={() => onShare(post.id)}
      />

      {/* Tidbit button with Popover for small screens */}
      {post.tidbits && post.tidbits.length > 0 && (
        <div className="px-4 pb-4 pt-1">
          <Popover open={showTidbitPopover} onOpenChange={setShowTidbitPopover}>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTidbitPopover(true)}
                className="py-2 px-3 w-full rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-600 dark:text-amber-400 text-sm flex items-center justify-center gap-2 font-medium border border-amber-100/50 dark:border-amber-800/30 hover:shadow-sm transition-all"
              >
                <Star className="h-4 w-4" />
                View Travel Tips
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl border border-amber-100 dark:border-amber-800/30 rounded-xl">
              <div>
                <h3 className="text-base font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent flex items-center mb-2">
                  <Star
                    className="h-4 w-4 mr-2 text-amber-500"
                    fill="currentColor"
                  />
                  Travel Tips & Insights
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {post.tidbits}
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </motion.div>
  );
};

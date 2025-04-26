'use client';

import { Post, User } from '@/types';
import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { PostHeader } from './post-header';
import { PostMedia } from './post-media';
import { PostContent } from './post-content';
import { PostActions } from './post-actions';
import { PostMenu } from './post-menu';
import { PostCardSkeleton } from '../ui/shared-components';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100/80 dark:border-gray-700/30 flex flex-col md:flex-row"
    >
      {/* Post Media - Left Side (only shown if media exists) */}
      {hasMedia && (
        <PostMedia
          imagePaths={post.image_paths || []}
          videoPaths={post.video_paths || []}
        />
      )}

      {/* Right Side Content Container - Full width when no media */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Post Header */}
        <div className="flex items-center justify-between p-5">
          <PostHeader
            user={post.user}
            timestamp={post.audit.created_at}
            location={post.location}
          />

          <PostMenu
            isOwnPost={isOwnPost}
            onEdit={onEdit ? () => onEdit(post.id) : undefined}
            onDelete={() => onDelete(post.id)}
            onShare={() => onShare(post.id)}
            onReport={onReport ? () => onReport(post.id) : undefined}
            onFollow={onFollow && !isOwnPost ? () => onFollow(post.user.id) : undefined}
          />
        </div>

        {/* Post Content */}
        <PostContent
          text={post.text}
          tidbits={post.tidbits}
          user={post.user}
          timestamp={post.audit.created_at}
        />

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
          <div className="md:hidden pb-2 px-5">
            <Popover open={showTidbitPopover} onOpenChange={setShowTidbitPopover}>
              <PopoverTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowTidbitPopover(true)}
                  className="py-2 px-3 w-full rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm flex items-center justify-center gap-2 font-medium"
                >
                  <Star className="h-4 w-4" />
                  View Travel Tidbits
                </motion.button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl border border-purple-100 dark:border-purple-800/30">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                    <Star className="h-4 w-4 mr-2 text-amber-500" fill="currentColor" />
                    Travel Tidbits
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {post.tidbits}
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </motion.div>
  );
};

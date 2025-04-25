'use client';

import { Post, User } from '@/types/social';
import { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  UserPlus,
  MapPin,
  ImageIcon,
  Video,
  Trash2,
  Edit,
  Flag,
  X,
  CheckCheck,
} from 'lucide-react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onSave,
  onShare,
  onDelete,
}: PostCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  const isLiked = post.liked_by?.some((user) => user.id === currentUser?.id);
  const isSaved = post.saved_by?.some((user) => user.id === currentUser?.id);
  const isOwnPost = post.user.id === currentUser?.id;

  const hasMedia = post.image_paths.length > 0 || post.video_paths.length > 0;
  const totalMedia = post.image_paths.length + post.video_paths.length;

  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (currentImageIndex < totalMedia - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    } else {
      setCurrentImageIndex(totalMedia - 1);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Close the menu when clicking outside of it
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowMenu(false);
    }
  };

  // Add event listener for outside clicks when menu is open
  useEffect(() => {
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike(post.id);
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  const handleShareClick = () => {
    onShare(post.id);
    setShareTooltip(true);

    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }

    tooltipTimeout.current = setTimeout(() => {
      setShareTooltip(false);
    }, 2000);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) {
      return 'just now';
    } else if (diffInMins < 60) {
      return `${diffInMins}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Link
            href={`/profile/${post.user.id}`}
            className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-700 group"
          >
            <Image
              src={
                post.user.profile_image_url ||
                '/images/roamance-logo-no-text.png'
              }
              alt={post.user.full_name || 'User'}
              layout="fill"
              objectFit="cover"
              className="rounded-full transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-full"></div>
          </Link>
          <div>
            <Link
              href={`/profile/${post.user.id}`}
              className="font-medium text-gray-900 dark:text-white hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            >
              {post.user.full_name}
              {post.user.is_verified && (
                <span className="inline-flex ml-1 text-blue-500 dark:text-blue-400">
                  <CheckCheck className="h-4 w-4" />
                </span>
              )}
            </Link>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {post.location && (
                <div className="flex items-center mr-2 hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[120px]">
                    {post.location.name ||
                      `${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`}
                  </span>
                </div>
              )}
              <span>{formatTimestamp(post.audit.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 relative">
          {!isOwnPost && (
            <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <UserPlus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <button
            onClick={toggleMenu}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Post Actions Menu */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-8 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 min-w-[160px]"
            >
              <div className="py-1">
                {isOwnPost && (
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        // TODO: Implement edit functionality
                        console.log('Edit post:', post.id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit post
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(post.id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete post
                    </button>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleShareClick();
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share post
                </button>
                {!isOwnPost && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: Implement report functionality
                      console.log('Report post:', post.id);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Media */}
      {hasMedia && (
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-900/70 group">
          {currentImageIndex < post.image_paths.length ? (
            <Image
              src={post.image_paths[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <video
              src={
                post.video_paths[currentImageIndex - post.image_paths.length]
              }
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          )}

          {/* Image navigation - more subtle and elegant */}
          {totalMedia > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePrev}
                className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg transform transition-transform hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg transform transition-transform hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}

          {/* Media indicators - more elegant dots */}
          {totalMedia > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 bg-black/30 backdrop-blur-md rounded-full px-2 py-1.5">
              {Array.from({ length: totalMedia }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    currentImageIndex === index
                      ? 'w-2 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Media type indicators - more subtle */}
          <div className="absolute top-3 right-3 flex space-x-1.5">
            {post.image_paths.length > 0 && (
              <div className="px-2 py-1 bg-black/30 backdrop-blur-md rounded-lg text-white text-xs flex items-center">
                <ImageIcon className="h-3 w-3 mr-1" />
                <span>{post.image_paths.length}</span>
              </div>
            )}
            {post.video_paths.length > 0 && (
              <div className="px-2 py-1 bg-black/30 backdrop-blur-md rounded-lg text-white text-xs flex items-center">
                <Video className="h-3 w-3 mr-1" />
                <span>{post.video_paths.length}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 py-3">
        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
          {showAll
            ? post.text
            : post.text.length > 150
              ? `${post.text.substring(0, 150)}...`
              : post.text}
          {post.text.length > 150 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="ml-1 text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Read more
            </button>
          )}
        </p>

        {/* Tidbits - more modern styling */}
        {post.tidbits && post.tidbits.length > 0 && (
          <div className="mt-3">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Travel Tidbits
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-600 dark:text-purple-400 text-xs border border-purple-100 dark:border-purple-800/30 hover:shadow-sm transition-all">
                {post.tidbits}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Post Actions - More elegant styling */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLikeClick}
            className="group flex items-center relative"
          >
            <div className="relative">
              <Heart
                className={cn(
                  'h-5 w-5 mr-1.5 transition-all duration-300',
                  isLiked
                    ? 'fill-pink-500 text-pink-500 dark:fill-pink-400 dark:text-pink-400'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-pink-500 dark:group-hover:text-pink-400'
                )}
              />
              {isLikeAnimating && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
                </motion.div>
              )}
            </div>
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                isLiked
                  ? 'text-pink-500 dark:text-pink-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-pink-500 dark:group-hover:text-pink-400'
              )}
            >
              {post.likes_count}
            </span>
          </button>

          <button
            onClick={() => onComment(post.id)}
            className="group flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle className="h-5 w-5 mr-1.5 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400" />
            <span className="text-xs font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
              {post.comments_count}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => onSave(post.id)}
            className={cn(
              'p-1.5 rounded-full transition-all duration-300',
              isSaved
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400'
            )}
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
          >
            <Bookmark
              className={cn(
                'h-5 w-5 transition-all duration-300',
                isSaved
                  ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
                  : 'hover:fill-amber-500/20'
              )}
            />
          </button>

          <div className="relative">
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
              aria-label="Share post"
            >
              <Share2 className="h-5 w-5 transition-all hover:scale-110" />
            </button>

            {/* Share tooltip */}
            <AnimatePresence>
              {shareTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 -top-10 bg-black/80 text-white text-xs rounded-lg px-3 py-1 whitespace-nowrap"
                >
                  Link copied!
                  <div className="absolute -bottom-1 right-2 w-2 h-2 bg-black/80 rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

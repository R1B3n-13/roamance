'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Post, User } from '@/types';
import { motion } from 'framer-motion';
import {
  Edit,
  Flag,
  Heart,
  ImageIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const EMPTY_TIDBITS = 'Nothing to show';

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
  const [showUnsafeContent, setShowUnsafeContent] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  const isLiked = post.liked_by?.some((user) => user.id === currentUser?.id);
  const isSaved = post.saved_by?.some((user) => user.id === currentUser?.id);
  const isOwnPost = post.user.id === currentUser?.id;
  const isUnsafe = post.is_safe === false;

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

  const handleSaveClick = () => {
    onSave(post.id);
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
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100/80 dark:border-gray-700/30 flex flex-col md:flex-row relative"
    >
      {/* Safety Overlay */}
      {isUnsafe && !showUnsafeContent && (
        <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-xl backdrop-filter z-50 flex flex-col items-center justify-center p-5 text-center">
          <div className="bg-red-500/20 p-2 rounded-full mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">Sensitive Content</h3>
          <p className="text-xs text-gray-300 mb-3 max-w-sm">
            This post has been flagged for potentially sensitive content.
            It has been blurred for your protection.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUnsafeContent(true)}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full backdrop-blur-sm border border-white/20 font-medium transition-all"
          >
            View Content Anyway
          </motion.button>
        </div>
      )}

      {/* Post Media - Left Side (only shown if media exists) */}
      {hasMedia && (
        <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/80 group md:w-2/5 flex-shrink-0">
          <div className="aspect-[16/10] md:aspect-square h-full">
            {currentImageIndex < post.image_paths.length ? (
              <Image
                src={post.image_paths[currentImageIndex]}
                alt={`Post image ${currentImageIndex + 1}`}
                layout="fill"
                objectFit="cover"
                className="transition-all duration-700 group-hover:scale-[1.03]"
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
          </div>

          {/* Image navigation - Redesigned */}
          {totalMedia > 1 && (
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-lg transform transition-transform"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 shadow-lg transform transition-transform"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </motion.button>
            </div>
          )}

          {/* Media indicators - Redesigned */}
          {totalMedia > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/40 backdrop-blur-xl rounded-full px-3 py-2 transition-opacity duration-300">
              {Array.from({ length: totalMedia }).map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    currentImageIndex === index
                      ? 'w-2.5 h-2.5 bg-white shadow-glow'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Media type indicators - Redesigned */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {post.image_paths.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg text-white text-xs font-medium flex items-center shadow-lg"
              >
                <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                <span>{post.image_paths.length}</span>
              </motion.div>
            )}
            {post.video_paths.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-lg text-white text-xs font-medium flex items-center shadow-lg"
              >
                <Video className="h-3.5 w-3.5 mr-1.5" />
                <span>{post.video_paths.length}</span>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Right Side Content Container - Full width when no media */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Post Header */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center space-x-4">
            <Link
              href={`/profile/${post.user.id}`}
              className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-700 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 group"
            >
              <Image
                src={
                  post.user.profile_image || '/images/roamance-logo-no-text.png'
                }
                alt={post.user.name || 'User'}
                layout="fill"
                objectFit="cover"
                className="rounded-full transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-black/0 group-hover:from-purple-500/20 group-hover:to-blue-500/10 transition-colors duration-500 rounded-full"></div>
            </Link>
            <div>
              <Link
                href={`/profile/${post.user.id}`}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {post.user.name}
                {/* {post.user.is_verified && (
                  <span className="inline-flex ml-1.5 text-blue-500 dark:text-blue-400">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.7 }}
                      className="bg-blue-100 dark:bg-blue-900/30 p-0.5 rounded-full"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </motion.div>
                  </span>
                )} */}
              </Link>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {post.location && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center mr-3 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1 text-pink-500 dark:text-pink-400" />
                    <span className="truncate max-w-[150px]">
                      {`${post.location.latitude.toFixed(2)}, ${post.location.longitude.toFixed(2)}`}
                    </span>
                  </motion.div>
                )}
                <span className="text-xs bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                  {formatTimestamp(post.audit.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 relative">
            {!isOwnPost && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <UserPlus className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </motion.button>

            {/* Post Actions Menu - Redesigned */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-12 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 min-w-[180px] transform origin-top-right transition-all"
              >
                <div className="py-1.5">
                  {isOwnPost && (
                    <>
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          setShowMenu(false);
                          // TODO: Implement edit functionality
                          console.log('Edit post:', post.id);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <Edit className="h-4 w-4 mr-3" />
                        Edit post
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(post.id);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-3" />
                        Delete post
                      </motion.button>
                      <div className="border-t border-gray-100 dark:border-gray-700/50 my-1.5"></div>
                    </>
                  )}
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      setShowMenu(false);
                      handleShareClick();
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Share2 className="h-4 w-4 mr-3" />
                    Share post
                  </motion.button>
                  {!isOwnPost && (
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        setShowMenu(false);
                        // TODO: Implement report functionality
                        console.log('Report post:', post.id);
                      }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Flag className="h-4 w-4 mr-3" />
                      Report post
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="px-5 py-3 flex-grow">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
            {showAll
              ? post.text
              : post.text.length > 150
                ? `${post.text.substring(0, 150)}...`
                : post.text}
            {post.text.length > 150 && !showAll && (
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => setShowAll(true)}
                className="ml-1 text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Read more
              </motion.button>
            )}
          </p>

          {/* Tidbits Preview */}
          {post.tidbits &&
            post.tidbits.length > 0 &&
            post.tidbits != EMPTY_TIDBITS && (
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
                        className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 text-violet-600 dark:text-violet-400 text-sm font-medium border border-violet-100 dark:border-violet-800/30 transition-all cursor-pointer"
                      >
                        {post.tidbits.length > 50
                          ? `${post.tidbits.substring(0, 50)}...`
                          : post.tidbits}
                      </motion.span>
                    </PopoverTrigger>
                    <PopoverContent className="w-full max-w-lg p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl border border-purple-100 dark:border-purple-800/30">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                          <Sparkles className="h-4 w-4 mr-2 text-violet-500 dark:text-violet-400 " />
                          Travel Tidbits
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                          {post.tidbits}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center">
                          <Image
                            src={
                              post.user.profile_image ||
                              '/images/roamance-logo-no-text.png'
                            }
                            alt={post.user.name || 'User'}
                            width={24}
                            height={24}
                            className="rounded-full mr-2 border border-white dark:border-gray-800"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimestamp(post.audit.created_at)}
                          </span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
        </div>

        {/* Post Actions */}
        <div className="px-5 py-4 border-t border-gray-100/80 dark:border-gray-700/30 flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-8">
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
                {post.likes_count}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onComment(post.id)}
              className="group flex items-center text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="h-6 w-6 mr-2 transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400" />
              <span className="text-sm font-medium transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">
                {post.comments_count}
              </span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-5">
            {/* Save button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveClick}
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

            {/* Share tooltip */}
            {shareTooltip && (
              <div className="absolute -top-12 right-0 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm animate-fade-in-out">
                Link copied to clipboard!
              </div>
            )}

            {/* Tidbits button with Popover */}
            {post.tidbits && post.tidbits.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    aria-label="View travel tidbits"
                  >
                    <Star className="h-5 w-5 transition-all" />
                  </motion.button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-xl border border-purple-100 dark:border-purple-800/30">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                      <Star
                        className="h-4 w-4 mr-2 text-amber-500"
                        fill="currentColor"
                      />
                      Travel Tidbits
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                      {post.tidbits}
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center">
                      <Image
                        src={
                          post.user.profile_image ||
                          '/images/roamance-logo-no-text.png'
                        }
                        alt={post.user.name || 'User'}
                        width={24}
                        height={24}
                        className="rounded-full mr-2 border border-white dark:border-gray-800"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(post.audit.created_at)}
                      </span>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

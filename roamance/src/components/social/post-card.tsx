'use client';

import { Post, User } from '@/types/social';
import { useState } from 'react';
import {
  Heart, MessageCircle, Bookmark, Share2,
  MoreHorizontal, UserPlus, MapPin, ImageIcon, Video
} from 'lucide-react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  currentUser?: User;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  onSave,
  onShare
}: PostCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isLiked = post.liked_by?.some(user => user.id === currentUser?.id);
  const isSaved = post.saved_by?.some(user => user.id === currentUser?.id);

  const hasMedia = post.image_paths.length > 0 || post.video_paths.length > 0;
  const totalMedia = post.image_paths.length + post.video_paths.length;

  const handleNext = () => {
    if (currentImageIndex < totalMedia - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setCurrentImageIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else {
      setCurrentImageIndex(totalMedia - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-700">
            <Image
              src={post.user.profile_image_url || '/images/roamance-logo-no-text.png'}
              alt={post.user.full_name || 'User'}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{post.user.full_name}</h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {post.location && (
                <div className="flex items-center mr-2">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate max-w-[120px]">
                    {post.location.name || `${post.location.latitude}, ${post.location.longitude}`}
                  </span>
                </div>
              )}
              <span>{new Date(post.audit.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <UserPlus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Post Media */}
      {hasMedia && (
        <div className="relative overflow-hidden aspect-[4/3]">
          {currentImageIndex < post.image_paths.length ? (
            <Image
              src={post.image_paths[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="transition-all duration-500"
            />
          ) : (
            <video
              src={post.video_paths[currentImageIndex - post.image_paths.length]}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          )}

          {/* Image navigation */}
          {totalMedia > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2">
              <button
                onClick={handlePrev}
                className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                onClick={handleNext}
                className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10 opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          )}

          {/* Media indicators */}
          {totalMedia > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
              {Array.from({ length: totalMedia }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentImageIndex === index
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* Media type indicators */}
          <div className="absolute top-2 right-2 flex space-x-1.5">
            {post.image_paths.length > 0 && (
              <span className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-white text-xs flex items-center">
                <ImageIcon className="h-3.5 w-3.5 mr-1" />
                <span>{post.image_paths.length}</span>
              </span>
            )}
            {post.video_paths.length > 0 && (
              <span className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md text-white text-xs flex items-center">
                <Video className="h-3.5 w-3.5 mr-1" />
                <span>{post.video_paths.length}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 py-3">
        <p className="text-gray-800 dark:text-gray-200 text-sm">
          {showAll ? post.text : post.text.length > 150 ? `${post.text.substring(0, 150)}...` : post.text}
          {post.text.length > 150 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="ml-1 text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Read more
            </button>
          )}
        </p>

        {/* Tidbits */}
        {post.tidbits && post.tidbits.length > 0 && (
          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Travel Tidbits:</h4>
            <div className="flex flex-wrap gap-2">
              {post.tidbits.map((tidbit, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs border border-purple-100 dark:border-purple-800/30"
                >
                  {tidbit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
          >
            <Heart
              className={cn(
                "h-5 w-5 mr-1.5",
                isLiked ? "fill-pink-500 text-pink-500 dark:fill-pink-400 dark:text-pink-400" : ""
              )}
            />
            <span className="text-xs font-medium">{post.likes_count}</span>
          </button>

          <button
            onClick={() => onComment(post.id)}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle className="h-5 w-5 mr-1.5" />
            <span className="text-xs font-medium">{post.comments_count}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSave(post.id)}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              isSaved
                ? "text-amber-500 dark:text-amber-400"
                : "text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400"
            )}
          >
            <Bookmark className={cn("h-5 w-5", isSaved ? "fill-amber-500 dark:fill-amber-400" : "")} />
          </button>

          <button
            onClick={() => onShare(post.id)}
            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

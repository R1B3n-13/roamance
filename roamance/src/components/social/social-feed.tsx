'use client';

import { PostCard } from './post-card';
import { useState, useEffect } from 'react';
import { Post, User } from '@/types/social';
import { AnimatePresence, motion } from 'framer-motion';
import { PostService } from '@/service/social-service';

interface SocialFeedProps {
  currentUser?: User;
  initialPosts?: Post[];
}

export const SocialFeed = ({ currentUser, initialPosts = [] }: SocialFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);

  // For masonry layout, split posts into columns
  const leftPosts = posts.filter((_, i) => i % 3 === 0);
  const middlePosts = posts.filter((_, i) => i % 3 === 1);
  const rightPosts = posts.filter((_, i) => i % 3 === 2);

  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts();
    }
  }, [initialPosts]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await PostService.getAllPosts();
      if (response.success) {
        // @ts-ignore - Types mismatch, but we know the data structure
        setPosts(response.data);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('An error occurred while fetching posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await PostService.likePost(postId);
      // Optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                likes_count: post.likes_count + 1,
                liked_by: [...(post.liked_by || []), currentUser!]
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      await PostService.savePost(postId);
      // Optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                saved_by: [...(post.saved_by || []), currentUser!]
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleComment = (postId: string) => {
    // In a real app, this would open a comment modal or scroll to comment form
    console.log('Open comment for post:', postId);
  };

  const handleShare = (postId: string) => {
    // In a real app, this would open a share dialog
    console.log('Share post:', postId);
  };

  return (
    <div className="w-full">
      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 text-center">
          {error}
          <button
            onClick={fetchPosts}
            className="ml-2 underline hover:text-red-700 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-2xl h-[360px] w-full"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <AnimatePresence>
              {leftPosts.map(post => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Middle column */}
          <div className="flex flex-col gap-5">
            <AnimatePresence>
              {middlePosts.map(post => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <AnimatePresence>
              {rightPosts.map(post => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

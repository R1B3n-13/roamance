'use client';

import { PostCard } from './post-card';
import { useState, useEffect } from 'react';
import { Post, User } from '@/types/social';
import { AnimatePresence, motion } from 'framer-motion';
import { PostService } from '@/service/social-service';
import { toast } from 'sonner';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface SocialFeedProps {
  currentUser?: User;
  initialPosts?: Post[];
}

export const SocialFeed = ({ currentUser, initialPosts = [] }: SocialFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use a single column layout on mobile, and a three-column masonry layout on desktop
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
      setError(null);
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

  const refreshFeed = async () => {
    try {
      setRefreshing(true);
      const response = await PostService.getAllPosts();
      if (response.success) {
        // @ts-ignore - Types mismatch, but we know the data structure
        setPosts(response.data);
        toast.success('Feed refreshed!');
      } else {
        toast.error('Failed to refresh feed');
      }
    } catch (err) {
      console.error('Error refreshing feed:', err);
      toast.error('Failed to refresh feed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Check if user already liked the post
      const post = posts.find(p => p.id === postId);
      const isLiked = post?.liked_by?.some(user => user.id === currentUser?.id);

      await PostService.likePost(postId);

      // Optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
                liked_by: isLiked
                  ? post.liked_by.filter(user => user.id !== currentUser?.id)
                  : [...(post.liked_by || []), currentUser!]
              }
            : post
        )
      );

      toast.success(isLiked ? 'Post unliked!' : 'Post liked!');
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to like post. Please try again.');
    }
  };

  const handleSave = async (postId: string) => {
    try {
      // Check if user already saved the post
      const post = posts.find(p => p.id === postId);
      const isSaved = post?.saved_by?.some(user => user.id === currentUser?.id);

      await PostService.savePost(postId);

      // Optimistic update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                saved_by: isSaved
                  ? post.saved_by.filter(user => user.id !== currentUser?.id)
                  : [...(post.saved_by || []), currentUser!]
              }
            : post
        )
      );

      toast.success(isSaved ? 'Post removed from saved!' : 'Post saved!');
    } catch (err) {
      console.error('Error saving post:', err);
      toast.error('Failed to save post. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // Show confirmation toast before deleting
      if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
      }

      const response = await PostService.deletePost(postId);

      if (response.success) {
        // Remove post from state
        setPosts(prev => prev.filter(post => post.id !== postId));
        toast.success('Post deleted successfully!');
      } else {
        toast.error('Failed to delete post. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  const handleComment = (postId: string) => {
    // In a real app, this would open a comment modal or scroll to comment form
    console.log('Open comment for post:', postId);
  };

  const handleShare = (postId: string) => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success('Post link copied to clipboard!');
  };

  return (
    <div className="w-full">
      {/* Feed header with refresh button */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
          Explore Moments
        </h2>
        <button
          onClick={refreshFeed}
          disabled={refreshing || isLoading}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:shadow-md transition-all flex items-center disabled:opacity-70"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-6 mb-8 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-100 dark:border-red-800/30 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2 font-medium">{error}</p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-red-600 dark:text-red-400 shadow-sm hover:shadow-md transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 w-1/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
              <div className="flex justify-between">
                <div className="h-5 w-1/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-5 w-1/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border border-purple-100 dark:border-purple-800/30 shadow-sm">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-md mb-6">
            <Sparkles className="h-10 w-10 text-purple-500 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Share Your Journey</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            Be the first to share your travel moments and inspire fellow adventurers around the world.
          </p>
          <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all">
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-10">
          {/* Left column - Fade in animations staggered by column */}
          <div className="flex flex-col space-y-10">
            <AnimatePresence>
              {leftPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: index * 0.1
                  }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                    onDelete={handleDeletePost}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Middle column */}
          <div className="flex flex-col space-y-10">
            <AnimatePresence>
              {middlePosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.05 + index * 0.1
                  }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                    onDelete={handleDeletePost}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right column */}
          <div className="flex flex-col space-y-10">
            <AnimatePresence>
              {rightPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.1 + index * 0.1
                  }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onLike={handleLike}
                    onComment={handleComment}
                    onSave={handleSave}
                    onShare={handleShare}
                    onDelete={handleDeletePost}
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

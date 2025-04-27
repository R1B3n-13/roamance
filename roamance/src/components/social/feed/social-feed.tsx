'use client';

import { useSocialContext } from '@/context/SocialContext';
import { PostService } from '@/service/social-service';
import { Post, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpDown,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PostCard } from '../post/post-card';
import { EmptyFeed } from './empty-feed';
import { FeedSkeleton } from './feed-skeleton';

export interface SocialFeedProps {
  currentUser?: User;
  initialPosts?: Post[];
}

export const SocialFeed = ({
  currentUser,
  initialPosts = [],
}: SocialFeedProps) => {
  const { postCreated } = useSocialContext();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<'latest' | 'popular'>('latest');

  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts();
    }
  }, [initialPosts]);

  useEffect(() => {
    if (postCreated) {
      fetchPosts();
    }
  }, [postCreated]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await PostService.getAllPosts();
      if (response.success) {
        // Transform PostResponseDto[] to Post[] by adding the missing properties
        const transformedPosts: Post[] = response.data.map((post) => ({
          ...post,
          liked_by: [], // Initialize with empty arrays since they're not in the API response
          saved_by: [],
          comments: [],
        }));
        setPosts(transformedPosts);
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
        // Transform PostResponseDto[] to Post[] by adding the missing properties
        const transformedPosts: Post[] = response.data.map((post) => ({
          ...post,
          liked_by: [], // Initialize with empty arrays since they're not in the API response
          saved_by: [],
          comments: [],
        }));
        setPosts(transformedPosts);
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
      const post = posts.find((p) => p.id === postId);
      const isLiked = post?.liked_by?.some(
        (user) => user.id === currentUser?.id
      );

      await PostService.likePost(postId);

      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes_count: isLiked
                  ? post.likes_count - 1
                  : post.likes_count + 1,
                liked_by: isLiked
                  ? post.liked_by.filter((user) => user.id !== currentUser?.id)
                  : [...(post.liked_by || []), currentUser!],
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
      const post = posts.find((p) => p.id === postId);
      const isSaved = post?.saved_by?.some(
        (user) => user.id === currentUser?.id
      );

      await PostService.savePost(postId);

      // Optimistic update
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                saved_by: isSaved
                  ? post.saved_by.filter((user) => user.id !== currentUser?.id)
                  : [...(post.saved_by || []), currentUser!],
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
      if (
        !confirm(
          'Are you sure you want to delete this post? This action cannot be undone.'
        )
      ) {
        return;
      }

      const response = await PostService.deletePost(postId);

      if (response.success) {
        // Remove post from state
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        toast.success('Post deleted successfully!');
      } else {
        toast.error('Failed to delete post. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  const handleEdit = (postId: string) => {
    // This would open an edit modal or navigate to edit page in a real app
    console.log(`Editing post: ${postId}`);
    toast.info('Edit functionality not implemented yet');
  };

  const handleComment = (postId: string) => {
    // In a real app, this would open a comment modal or scroll to comment form
    console.log(`Commenting on post: ${postId}`);
    toast.info('Comment functionality not fully implemented yet');
  };

  const handleShare = (postId: string) => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success('Post link copied to clipboard!');
  };

  const handleFollow = (userId: string) => {
    // This would follow a user in a real app
    console.log(`Following user: ${userId}`);
    toast.info('Follow functionality not implemented yet');
  };

  const handleReport = (postId: string) => {
    // This would report a post in a real app
    console.log(`Reporting post: ${postId}`);
    toast.info('Report functionality not implemented yet');
  };

  const toggleSortOption = () => {
    setSortOption((prev) => (prev === 'latest' ? 'popular' : 'latest'));
    // For demo purposes, we're just changing the state but not actually sorting
    toast.success(
      `Sorted by ${sortOption === 'latest' ? 'popularity' : 'latest posts'}`
    );
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOption === 'popular') {
      return (b.likes_count || 0) - (a.likes_count || 0);
    }
    // Sort by created_at for latest (default sorting)
    return (
      new Date(b.audit.created_at).getTime() -
      new Date(a.audit.created_at).getTime()
    );
  });

  return (
    <div className="w-full">
      {/* Feed header with refresh button and controls */}
      <FeedHeader
        onRefresh={refreshFeed}
        isRefreshing={refreshing}
        isLoading={isLoading}
        sortOption={sortOption}
        onToggleSort={toggleSortOption}
      />

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 mb-8 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-100 dark:border-red-800/30 text-center backdrop-blur-sm shadow-sm"
        >
          <p className="text-red-600 dark:text-red-400 mb-2 font-medium">
            {error}
          </p>
          <button
            onClick={fetchPosts}
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-red-600 dark:text-red-400 shadow-sm hover:shadow-md transition-all"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          <AnimatePresence mode="popLayout">
            {sortedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  delay: Math.min(index * 0.08, 0.4), // Cap the delay at 0.4s
                }}
                className="backdrop-blur-sm"
              >
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onComment={handleComment}
                  onSave={handleSave}
                  onShare={handleShare}
                  onDelete={handleDeletePost}
                  onEdit={handleEdit}
                  onFollow={handleFollow}
                  onReport={handleReport}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface FeedHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isLoading: boolean;
  sortOption: 'latest' | 'popular';
  onToggleSort: () => void;
}

const FeedHeader = ({
  onRefresh,
  isRefreshing,
  isLoading,
  sortOption,
  onToggleSort,
}: FeedHeaderProps) => (
  <div className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 p-4 rounded-2xl mb-8 shadow-sm border border-gray-100 dark:border-gray-800/40">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center">
        <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
        Explore Moments
      </h2>
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSort}
          disabled={isLoading}
          className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-sm font-medium shadow-sm hover:shadow-md transition-all flex items-center disabled:opacity-70 border border-gray-100 dark:border-gray-700"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {sortOption === 'latest' ? 'Latest' : 'Popular'}
        </button>
        <button
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:shadow-md transition-all flex items-center disabled:opacity-70 border border-indigo-100 dark:border-indigo-800/30"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </button>
      </div>
    </div>
  </div>
);

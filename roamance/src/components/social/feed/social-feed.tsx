'use client';

import { useState, useEffect } from 'react';
import { Post, User } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { PostService } from '@/service/social-service';
import { toast } from 'sonner';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { PostCard } from '../post/post-card';
import { EmptyFeed } from './empty-feed';
import { FeedSkeleton } from './feed-skeleton';
import { useFeedContext } from '@/context/FeedContext';

export interface SocialFeedProps {
  currentUser?: User;
  initialPosts?: Post[];
}

export const SocialFeed = ({ currentUser, initialPosts = [] }: SocialFeedProps) => {
  const { postCreated } = useFeedContext();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
        const transformedPosts: Post[] = response.data.map(post => ({
          ...post,
          liked_by: [], // Initialize with empty arrays since they're not in the API response
          saved_by: [],
          comments: []
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
        const transformedPosts: Post[] = response.data.map(post => ({
          ...post,
          liked_by: [], // Initialize with empty arrays since they're not in the API response
          saved_by: [],
          comments: []
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

  return (
    <div className="w-full">
      {/* Feed header with refresh button */}
      <FeedHeader
        onRefresh={refreshFeed}
        isRefreshing={refreshing}
        isLoading={isLoading}
      />

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
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="max-w-2xl mx-auto space-y-10">
          <AnimatePresence>
            {posts.map((post, index) => (
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
}

const FeedHeader = ({ onRefresh, isRefreshing, isLoading }: FeedHeaderProps) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent inline-flex items-center">
      <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
      Explore Moments
    </h2>
    <button
      onClick={onRefresh}
      disabled={isRefreshing || isLoading}
      className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:shadow-md transition-all flex items-center disabled:opacity-70"
    >
      {isRefreshing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-2" />
      )}
      Refresh
    </button>
  </div>
);

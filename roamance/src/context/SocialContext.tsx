'use client';

import { CommentService, PostService } from '@/service/social-service';
import { userService } from '@/service/user-service';
import {
  Comment,
  Post,
  PostRequestDto,
  PostResponse,
  PostResponseDto,
  User,
} from '@/types';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

interface SocialContextValue {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  savedPosts: Post[];
  setSavedPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  fetchPosts: () => Promise<void>;
  fetchSavedPosts: () => Promise<void>;
  createPost: (postData: PostRequestDto) => Promise<PostResponse>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleSavePost: (post: Post) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  isLoading: boolean;
  isPostsLoading: boolean;
  isSavedPostsLoading: boolean;
  isCreatingPost: boolean;
  error: string | null;
}

const SocialContext = createContext<SocialContextValue>({
  user: {} as User,
  setUser: () => {},
  posts: [],
  setPosts: () => {},
  savedPosts: [],
  setSavedPosts: () => {},
  fetchPosts: async () => {},
  fetchSavedPosts: async () => {},
  createPost: async (postData: PostRequestDto) => {
    return {
      success: true,
      data: postData as PostResponseDto,
      message: '',
      status: 200,
    };
  },
  toggleLikePost: async () => {},
  toggleSavePost: async () => {},
  deletePost: async () => {},
  isLoading: false,
  isPostsLoading: false,
  isSavedPostsLoading: false,
  isCreatingPost: false,
  error: null,
});

interface SocialProviderProps {
  children: ReactNode;
  initialPosts?: Post[];
}

export const SocialProvider = ({
  children,
  initialPosts = [],
}: SocialProviderProps) => {
  const [user, setUser] = useState<User>({} as User);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(!initialPosts.length);
  const [isSavedPostsLoading, setIsSavedPostsLoading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsUserLoading(true);
      const userData = await userService.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsUserLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setIsPostsLoading(true);
      setError(null);
      const postListResponse = await PostService.getAllPosts();

      if (postListResponse.success) {
        setPosts(
          await Promise.all(
            postListResponse.data.map(async (dto) => ({
              ...dto,
              liked_by: await PostService.getLikedByPost(dto?.id || '').then(
                (res) => res.data
              ),
              comments: await CommentService.getCommentsByPostId(
                dto?.id || ''
              ).then((res) =>
                res.data.map(
                  (comment) => ({ ...comment, post: dto }) as Comment
                )
              ),
              saved_by: [],
            }))
          )
        );
      } else {
        setError('Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('An error occurred while fetching posts');
    } finally {
      setIsPostsLoading(false);
    }
  }, []);

  const createPost = useCallback(
    async (postData: PostRequestDto): Promise<PostResponse> => {
      try {
        setIsCreatingPost(true);

        const response = await PostService.createPost({
          text: postData.text,
          image_paths: postData.image_paths,
          video_paths: postData.video_paths,
          location: postData.location || { latitude: 0, longitude: 0 },
        });

        if (response.success) {
          // Add optimistic update - add the new post to the top of the feed
          if (response.data) {
            const newPost: Post = {
              ...response.data,
              liked_by: [],
              comments: [],
              saved_by: [],
            };

            setPosts((prevPosts) => [newPost, ...prevPosts]);
          }

          toast.success('Post shared successfully!');
          fetchPosts(); // Refresh posts after creating a new one
          return response;
        } else {
          toast.error('Failed to create post');
          return {
            success: false,
            data: {} as PostResponseDto,
            message: 'Failed to create post',
            status: 400,
          };
        }
      } catch (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post. Please try again.');
        return {
          success: false,
          data: {} as PostResponseDto,
          message: 'Failed to create post',
          status: 500,
        };
      } finally {
        setIsCreatingPost(false);
      }
    },
    [fetchPosts]
  );

  const fetchSavedPosts = useCallback(async () => {
    try {
      setIsSavedPostsLoading(true);
      setError(null);
      const postListResponse = await PostService.getSavedPosts();

      if (postListResponse.success) {
        setSavedPosts(
          await Promise.all(
            postListResponse.data.map(async (dto) => ({
              ...dto,
              liked_by: await PostService.getLikedByPost(dto?.id || '').then(
                (res) => res.data
              ),
              comments: await CommentService.getCommentsByPostId(
                dto?.id || ''
              ).then((res) =>
                res.data.map(
                  (comment) => ({ ...comment, post: dto }) as Comment
                )
              ),
              saved_by: [user],
            }))
          )
        );
      } else {
        setError('Failed to fetch saved posts');
      }
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setError('An error occurred while fetching saved posts');
    } finally {
      setIsSavedPostsLoading(false);
    }
  }, [user]);

  const toggleLikePost = useCallback(
    async (postId: string) => {
      const post = posts.find((p) => p.id === postId);
      const isLiked = post?.liked_by?.some((u) => u.id === user.id);
      try {
        const response = await PostService.likePost(postId);
        if (response.success && post) {
          // Optimistically update like state
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    likes_count: isLiked
                      ? Math.max((p.likes_count || 0) - 1, 0)
                      : (p.likes_count || 0) + 1,
                    liked_by: isLiked
                      ? p.liked_by.filter((u) => u.id !== user.id)
                      : [...p.liked_by, user!],
                  }
                : p
            )
          );
          setSavedPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    likes_count: isLiked
                      ? Math.max((p.likes_count || 0) - 1, 0)
                      : (p.likes_count || 0) + 1,
                    liked_by: isLiked
                      ? p.liked_by.filter((u) => u.id !== user.id)
                      : [...p.liked_by, user!],
                  }
                : p
            )
          );
          toast.success(isLiked ? 'Post unliked!' : 'Post liked!');
        }
      } catch (err) {
        console.error('Error liking post:', err);
        toast.error('Failed to like post. Please try again.');
      }
    },
    [posts, user]
  );

  const toggleSavePost = useCallback(
    async (post: Post) => {
      const savedPost = savedPosts.find((p) => p.id === post.id);

      console.log('toggleSavePost', savedPosts, post);

      try {
        const response = await PostService.savePost(post.id);
        if (response.success) {
          setSavedPosts((prev) =>
            savedPost ? prev.filter((p) => p.id !== post.id) : [post, ...prev]
          );
          toast.success(savedPost ? 'Post unsaved!' : 'Post saved!');
        }
      } catch (err) {
        console.error('Error saving post:', err);
        toast.error('Failed to save post. Please try again.');
      }
    },
    [savedPosts]
  );

  const deletePost = useCallback(async (postId: string) => {
    try {
      if (!confirm('Are you sure you want to delete this post?')) return;
      const response = await PostService.deletePost(postId);
      if (response.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
        toast.success('Post deleted successfully!');
      } else {
        toast.error('Failed to delete post. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return (
    <SocialContext.Provider
      value={{
        user,
        setUser,
        posts,
        setPosts,
        savedPosts,
        setSavedPosts,
        fetchPosts,
        fetchSavedPosts,
        createPost,
        toggleLikePost,
        toggleSavePost,
        deletePost,
        isLoading: isUserLoading,
        isPostsLoading,
        isSavedPostsLoading,
        isCreatingPost,
        error,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocialContext = () => useContext(SocialContext);

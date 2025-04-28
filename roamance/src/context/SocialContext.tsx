'use client';

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
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { userService } from '@/service/user-service';
import { CommentService, PostService } from '@/service/social-service';
import { toast } from 'sonner';

interface SocialContextValue {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  savedPosts: Post[];
  setSavedPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  postCreated: boolean;
  triggerRefresh: () => void;
  fetchPosts: () => Promise<void>;
  fetchSavedPosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  createPost: (postData: PostRequestDto) => Promise<PostResponse>;
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
  postCreated: false,
  triggerRefresh: () => {},
  fetchPosts: async () => {},
  fetchSavedPosts: async () => {},
  refreshFeed: async () => {},
  createPost: async (postData: PostRequestDto) => {
    return {
      success: true,
      data: postData as PostResponseDto,
      message: '',
      status: 200,
    };
  },
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
  const [postCreated, setPostCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(!initialPosts.length);
  const [isSavedPostsLoading, setIsSavedPostsLoading] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerRefresh = () => {
    setPostCreated((prev) => !prev);
  };

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

  const refreshFeed = useCallback(async () => {
    try {
      setIsPostsLoading(true);
      const postListResponse = await PostService.getAllPosts();

      if (postListResponse.success) {
        setPosts(
          await Promise.all(
            postListResponse.data.map(async (dto) => ({
              ...dto,
              liked_by: await PostService.getLikedByPost(dto?.id || '').then(
                (data) => data.data
              ),
              comments: await CommentService.getCommentsByPostId(
                dto?.id || ''
              ).then((data) =>
                data.data.map(
                  (comment) => ({ ...comment, post: dto }) as Comment
                )
              ),
              saved_by: [],
            }))
          )
        );

        toast.success('Feed refreshed!');
      } else {
        toast.error('Failed to refresh feed');
      }
    } catch (err) {
      console.error('Error refreshing feed:', err);
      toast.error('Failed to refresh feed');
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

          // Trigger a refresh to get the latest data from the server
          setPostCreated((prev) => !prev);
          toast.success('Post shared successfully!');
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
    []
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
              saved_by: [],
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
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch posts immediately on mount if no initial posts were provided
  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch new posts when a post is created
  useEffect(() => {
    if (postCreated) {
      fetchPosts();
    }
  }, [postCreated, fetchPosts]);

  return (
    <SocialContext.Provider
      value={{
        user,
        setUser,
        posts,
        setPosts,
        savedPosts,
        setSavedPosts,
        postCreated,
        triggerRefresh,
        fetchPosts,
        fetchSavedPosts,
        refreshFeed,
        createPost,
        isLoading,
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

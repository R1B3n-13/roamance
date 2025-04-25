import { COMMENTS_ENDPOINTS, POSTS_ENDPOINTS, CHATS_ENDPOINTS, MESSAGES_ENDPOINTS } from '@/constants/api';
import {
  CommentDtoByEndpoints,
  CommentRequestDto,
  CommentResponse,
  CommentListResponse,
  PostDtoByEndpoints,
  PostRequestDto,
  PostResponse,
  PostListResponse,
  ChatDtoByEndpoints,
  ChatResponse,
  ChatListResponse,
  MessageDtoByEndpoints,
  MessageRequestDto,
  MessageResponse,
  MessageListResponse,
  Post,
  User
} from '@/types/social';
import { BaseResponse } from '@/types';

// Helper function to handle fetch with authentication
const fetchWithAuth = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> => {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  // Get token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Posts
export const PostService = {
  createPost: async (post: PostRequestDto): Promise<PostResponse> => {
    return fetchWithAuth<PostResponse>(
      POSTS_ENDPOINTS.CREATE,
      'POST',
      post
    );
  },

  getPost: async (postId: string): Promise<PostResponse> => {
    return fetchWithAuth<PostResponse>(
      POSTS_ENDPOINTS.GET(postId)
    );
  },

  getAllPosts: async (): Promise<PostListResponse> => {
    return fetchWithAuth<PostListResponse>(
      POSTS_ENDPOINTS.GET_ALL
    );
  },

  updatePost: async (postId: string, post: PostRequestDto): Promise<PostResponse> => {
    return fetchWithAuth<PostResponse>(
      POSTS_ENDPOINTS.UPDATE(postId),
      'PUT',
      post
    );
  },

  getPostsByIds: async (postIds: string[]): Promise<PostListResponse> => {
    return fetchWithAuth<PostListResponse>(
      POSTS_ENDPOINTS.GET_BY_IDS,
      'POST',
      { ids: postIds }
    );
  },

  getPostsByUserId: async (userId: string): Promise<PostListResponse> => {
    return fetchWithAuth<PostListResponse>(
      POSTS_ENDPOINTS.GET_BY_USER_ID(userId)
    );
  },

  savePost: async (postId: string): Promise<BaseResponse<null>> => {
    return fetchWithAuth<BaseResponse<null>>(
      POSTS_ENDPOINTS.SAVE(postId),
      'POST'
    );
  },

  getSavedPosts: async (): Promise<PostListResponse> => {
    return fetchWithAuth<PostListResponse>(
      POSTS_ENDPOINTS.GET_SAVED
    );
  },

  likePost: async (postId: string): Promise<BaseResponse<null>> => {
    return fetchWithAuth<BaseResponse<null>>(
      POSTS_ENDPOINTS.LIKE(postId),
      'POST'
    );
  },

  getLikedByUsers: async (postId: string): Promise<BaseResponse<User[]>> => {
    return fetchWithAuth<BaseResponse<User[]>>(
      POSTS_ENDPOINTS.LIKED_BY(postId)
    );
  },

  deletePost: async (postId: string): Promise<BaseResponse<null>> => {
    return fetchWithAuth<BaseResponse<null>>(
      POSTS_ENDPOINTS.DELETE(postId),
      'DELETE'
    );
  }
};

// Comments
export const CommentService = {
  createComment: async (postId: string, comment: CommentRequestDto): Promise<CommentResponse> => {
    return fetchWithAuth<CommentResponse>(
      COMMENTS_ENDPOINTS.CREATE(postId),
      'POST',
      comment
    );
  },

  getComment: async (commentId: string): Promise<CommentResponse> => {
    return fetchWithAuth<CommentResponse>(
      COMMENTS_ENDPOINTS.GET(commentId)
    );
  },

  getCommentsByPostId: async (postId: string): Promise<CommentListResponse> => {
    return fetchWithAuth<CommentListResponse>(
      COMMENTS_ENDPOINTS.GET_BY_POST_ID(postId)
    );
  }
};

// Chats
export const ChatService = {
  createChat: async (userId: string): Promise<ChatResponse> => {
    return fetchWithAuth<ChatResponse>(
      CHATS_ENDPOINTS.CREATE(userId),
      'POST'
    );
  },

  getChat: async (chatId: string): Promise<ChatResponse> => {
    return fetchWithAuth<ChatResponse>(
      CHATS_ENDPOINTS.GET(chatId)
    );
  },

  getAllChats: async (): Promise<ChatListResponse> => {
    return fetchWithAuth<ChatListResponse>(
      CHATS_ENDPOINTS.GET_ALL
    );
  }
};

// Messages
export const MessageService = {
  createMessage: async (chatId: string, message: MessageRequestDto): Promise<MessageResponse> => {
    return fetchWithAuth<MessageResponse>(
      MESSAGES_ENDPOINTS.CREATE(chatId),
      'POST',
      message
    );
  },

  getMessagesByChatId: async (chatId: string): Promise<MessageListResponse> => {
    return fetchWithAuth<MessageListResponse>(
      MESSAGES_ENDPOINTS.GET_BY_CHAT_ID(chatId)
    );
  }
};

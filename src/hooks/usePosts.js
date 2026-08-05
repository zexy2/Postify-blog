/**
 * usePosts Hook
 * Centralized hook for post operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { postService, userService } from '../services';
import {
  selectUserPosts,
  addLocalPost,
  updateLocalPost,
  deleteLocalPost,
} from '../store/slices/postsSlice';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

// Query keys factory
export const postKeys = {
  all: ['posts'],
  lists: () => [...postKeys.all, 'list'],
  list: (filters) => [...postKeys.lists(), filters],
  details: () => [...postKeys.all, 'detail'],
  detail: (id) => [...postKeys.details(), id],
  comments: (id) => [...postKeys.detail(id), 'comments'],
  user: (userId) => [...postKeys.all, 'user', userId],
};

export const userKeys = {
  all: ['users'],
  detail: (id) => [...userKeys.all, id],
};

export function usePosts() {
  const userPosts = useSelector(selectUserPosts);

  // Fetch all posts with users
  const postsQuery = useQuery({
    queryKey: postKeys.lists(),
    queryFn: async () => {
      const [posts, users] = await Promise.all([
        postService.getAll(),
        userService.getAll(),
      ]);

      const usersMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      return { posts, users, usersMap };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Combined posts (user-created + API posts)
  const allPosts = [...userPosts, ...(postsQuery.data?.posts || [])];

  return {
    posts: allPosts,
    users: postsQuery.data?.users || [],
    usersMap: postsQuery.data?.usersMap || {},
    isLoading: postsQuery.isLoading,
    isError: postsQuery.isError,
    error: postsQuery.error,
    refetch: postsQuery.refetch,
  };
}

export function usePost(id) {
  const userPosts = useSelector(selectUserPosts);
  
  // Check if it's a user-created post first
  const localPost = userPosts.find((p) => p.id === id);

  const postQuery = useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async () => {
      const [post, comments] = await Promise.all([
        postService.getById(id),
        postService.getComments(id),
      ]);
      const author = await userService.getById(post.userId);
      return { post, comments, author };
    },
    enabled: !localPost && !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (localPost) {
    return {
      post: localPost,
      comments: [],
      author: { id: 'local', name: 'Siz', username: 'you' },
      isLoading: false,
      isError: false,
    };
  }

  return {
    post: postQuery.data?.post,
    comments: postQuery.data?.comments || [],
    author: postQuery.data?.author,
    isLoading: postQuery.isLoading,
    isError: postQuery.isError,
    error: postQuery.error,
  };
}

export function useUserPosts(userId) {
  return useQuery({
    queryKey: postKeys.user(userId),
    queryFn: () => postService.getByUserId(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(userId) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (postData) => {
      // Simulate API call
      const response = await postService.create(postData);
      return response;
    },
    onMutate: async (newPost) => {
      // Optimistic update - add post immediately
      const optimisticPost = {
        ...newPost,
        id: `local-${uuidv4()}`,
        createdAt: new Date().toISOString(),
        isLocal: true,
      };
      
      dispatch(addLocalPost(optimisticPost));
      toast.success('Post oluşturuldu!');
      
      return { optimisticPost };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.optimisticPost) {
        dispatch(deleteLocalPost(context.optimisticPost.id));
      }
      toast.error('Post oluşturulamadı');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (String(id).startsWith('local-')) {
        // Local post - just update Redux
        return { id, ...data };
      }
      return postService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      dispatch(updateLocalPost({ id, data }));
      toast.success('Post güncellendi!');
    },
    onError: () => {
      toast.error('Post güncellenemedi');
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (id) => {
      if (String(id).startsWith('local-')) {
        return id;
      }
      await postService.delete(id);
      return id;
    },
    onMutate: async (id) => {
      dispatch(deleteLocalPost(id));
      toast.success('Post silindi!');
    },
    onError: () => {
      toast.error('Post silinemedi');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

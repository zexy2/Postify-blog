/**
 * Supabase-backed post queries and mutations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import postService from '../services/postService';
import { getFallbackPost, getFallbackPosts } from '../content/fallbackPosts';

export const postKeys = {
  all: ['posts'],
  lists: (locale) => [...postKeys.all, 'list', locale],
  details: () => [...postKeys.all, 'detail'],
  detail: (identifier, locale) => [...postKeys.details(), identifier, locale],
  user: (userId, locale) => [...postKeys.all, 'user', userId, locale],
};

export const userKeys = {
  all: ['users'],
  detail: (id, locale) => [...userKeys.all, id, locale],
};

export function usePosts({ enabled = true } = {}) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'tr';
  const postsQuery = useQuery({
    queryKey: postKeys.lists(locale),
    queryFn: () => postService.getAll({ locale }),
    enabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
    initialData: () => getFallbackPosts(locale),
    initialDataUpdatedAt: 0,
  });

  const posts = postsQuery.data || [];
  const usersMap = posts.reduce((map, post) => {
    if (post.author) map[post.author.id] = post.author;
    return map;
  }, {});

  return {
    posts,
    users: Object.values(usersMap),
    usersMap,
    isLoading: postsQuery.isLoading,
    isFetching: postsQuery.isFetching,
    isError: postsQuery.isError,
    error: postsQuery.error,
    isFallback: posts.some((post) => post.isFallback),
    refetch: postsQuery.refetch,
  };
}

export function usePost(identifier) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'tr';
  const postQuery = useQuery({
    queryKey: postKeys.detail(identifier, locale),
    queryFn: () => postService.getById(identifier, locale),
    enabled: Boolean(identifier),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    initialData: () => getFallbackPost(identifier, locale) || undefined,
    initialDataUpdatedAt: 0,
  });

  const commentsQuery = useQuery({
    queryKey: [...postKeys.detail(identifier, locale), 'comments'],
    queryFn: () => postService.getComments(postQuery.data.id),
    enabled: Boolean(postQuery.data?.id) && !postQuery.data?.isFallback,
    staleTime: 1000 * 60 * 2,
    retry: 0,
  });

  return {
    post: postQuery.data,
    comments: commentsQuery.data || [],
    author: postQuery.data?.author,
    isLoading: postQuery.isLoading,
    isError: postQuery.isError,
    error: postQuery.error,
    commentsUnavailable: Boolean(postQuery.data?.isFallback) || commentsQuery.isError,
    refetch: async () => {
      const postResult = await postQuery.refetch();
      if (postResult.data?.isFallback) return [postResult];
      return Promise.all([postResult, commentsQuery.refetch()]);
    },
  };
}

export function useUserPosts(userId) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'tr';
  return useQuery({
    queryKey: postKeys.user(userId, locale),
    queryFn: () => postService.getByUserId(userId, locale),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUser(userId) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'tr';
  return useQuery({
    queryKey: userKeys.detail(userId, locale),
    queryFn: () => import('../services/userService').then(({ default: service }) => service.getById(userId, locale)),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreatePost() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success(t('success.postCreated'));
    },
    onError: (error) => toast.error(error.message || t('auth.registerError')),
  });
}

export function useUpdatePost() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => postService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
    onError: (error) => toast.error(error.message || t('success.postUpdated')),
  });
}

export function useDeletePost() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
    onError: (error) => toast.error(error.message || t('success.postDeleted')),
  });
}

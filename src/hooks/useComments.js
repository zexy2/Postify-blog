/**
 * useComments Hook
 * 
 * Provides comment operations with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { commentService } from '../services/commentService';

// Query key factory
export const commentKeys = {
  all: ['comments'],
  post: (postId) => [...commentKeys.all, 'post', postId],
  count: (postId) => [...commentKeys.all, 'count', postId],
};

export const useComments = (postId) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  /**
   * Fetch comments for a post
   */
  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: commentKeys.post(postId),
    queryFn: () => commentService.getByPostId(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  /**
   * Get comment count
   */
  const { data: count = 0 } = useQuery({
    queryKey: commentKeys.count(postId),
    queryFn: () => commentService.getCount(postId),
    enabled: !!postId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  /**
   * Add a new comment
   */
  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId }) =>
      commentService.create({ postId, content, parentId }),
    onMutate: async ({ content, parentId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: commentKeys.post(postId) });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(commentKeys.post(postId));

      // Optimistically update
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        author: { full_name: t('comments.you'), username: 'you' },
        isOptimistic: true,
      };

      queryClient.setQueryData(commentKeys.post(postId), (old = []) => {
        if (parentId) {
          // Add as reply
          return old.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), optimisticComment],
              };
            }
            return comment;
          });
        }
        return [optimisticComment, ...old];
      });

      return { previousComments };
    },
    onError: (err, _, context) => {
      // Rollback on error
      queryClient.setQueryData(commentKeys.post(postId), context?.previousComments);
      toast.error(err.message || t('comments.addError'));
    },
    onSuccess: () => {
      toast.success(t('comments.added'));
    },
    onSettled: () => {
      // Refetch to get actual data
      queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: commentKeys.count(postId) });
    },
  });

  /**
   * Update a comment
   */
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }) =>
      commentService.update(commentId, content),
    onSuccess: () => {
      toast.success(t('comments.updated'));
      queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
    },
    onError: (err) => {
      toast.error(err.message || t('comments.updateError'));
    },
  });

  /**
   * Delete a comment
   */
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentService.delete(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: commentKeys.post(postId) });
      const previousComments = queryClient.getQueryData(commentKeys.post(postId));

      // Optimistically remove
      queryClient.setQueryData(commentKeys.post(postId), (old = []) =>
        old.filter((comment) => comment.id !== commentId).map((comment) => ({
          ...comment,
          replies: comment.replies?.filter((reply) => reply.id !== commentId),
        }))
      );

      return { previousComments };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(commentKeys.post(postId), context?.previousComments);
      toast.error(err.message || t('comments.deleteError'));
    },
    onSuccess: () => {
      toast.success(t('comments.deleted'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: commentKeys.count(postId) });
    },
  });

  /**
   * Like a comment
   */
  const likeCommentMutation = useMutation({
    mutationFn: (commentId) => commentService.like(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.post(postId) });
    },
  });

  return {
    comments,
    count,
    isLoading,
    error,
    refetch,
    addComment: (content, parentId = null) =>
      addCommentMutation.mutateAsync({ content, parentId }),
    updateComment: (commentId, content) =>
      updateCommentMutation.mutateAsync({ commentId, content }),
    deleteComment: (commentId) => deleteCommentMutation.mutateAsync(commentId),
    likeComment: (commentId) => likeCommentMutation.mutateAsync(commentId),
    isAdding: addCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
};

export default useComments;

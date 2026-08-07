/**
 * Comment Service
 * 
 * Handles all comment operations with Supabase
 */

import { requireSupabase } from '../lib/supabase';

export const commentService = {
  /**
   * Get all comments for a post with nested replies
   */
  getByPostId: async (postId) => {
    const client = requireSupabase();
    const { data, error } = await client
      .from('comments')
      .select(`
        *,
        author:profiles(id, full_name, username, avatar_url),
        likes:comment_likes(user_id),
        replies:comments(
          *,
          author:profiles(id, full_name, username, avatar_url),
          likes:comment_likes(user_id)
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let currentUserId = null;
    try {
      const { data: authData } = await client.auth.getUser();
      currentUserId = authData.user?.id || null;
    } catch {
      // Public comment reading must still work if the auth refresh endpoint is unavailable.
    }

    const addLikeState = (comment) => ({
      ...comment,
      likes_count: comment.likes?.length || 0,
      liked: Boolean(currentUserId && comment.likes?.some((like) => like.user_id === currentUserId)),
      replies: (comment.replies || []).map(addLikeState),
    });

    return (data || []).map(addLikeState);
  },

  /**
   * Create a new comment
   */
  create: async ({ postId, content, parentId = null }) => {
    const { data: { user } } = await requireSupabase().auth.getUser();
    
    if (!user) throw new Error('Must be logged in to comment');

    const { data, error } = await requireSupabase()
      .from('comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content,
        parent_id: parentId,
      })
      .select(`
        *,
        author:profiles(id, full_name, username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a comment
   */
  update: async (commentId, content) => {
    const { data: { user } } = await requireSupabase().auth.getUser();
    
    if (!user) throw new Error('Must be logged in to update comment');

    const { data, error } = await requireSupabase()
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
        is_edited: true,
      })
      .eq('id', commentId)
      .eq('author_id', user.id)
      .select(`
        *,
        author:profiles(id, full_name, username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a comment
   */
  delete: async (commentId) => {
    const { data: { user } } = await requireSupabase().auth.getUser();
    
    if (!user) throw new Error('Must be logged in to delete comment');

    const { error } = await requireSupabase()
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id);

    if (error) throw error;
    return true;
  },

  /**
   * Get comment count for a post
   */
  getCount: async (postId) => {
    const { count, error } = await requireSupabase()
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) throw error;
    return count;
  },

  /**
   * Like a comment
   */
  like: async (commentId) => {
    const { data: { user } } = await requireSupabase().auth.getUser();
    
    if (!user) throw new Error('Must be logged in to like');

    const { data, error } = await requireSupabase()
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Already liked, so unlike
        return commentService.unlike(commentId);
      }
      throw error;
    }
    return { liked: true, data };
  },

  /**
   * Unlike a comment
   */
  unlike: async (commentId) => {
    const { data: { user } } = await requireSupabase().auth.getUser();
    
    if (!user) throw new Error('Must be logged in to unlike');

    const { error } = await requireSupabase()
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { liked: false };
  },
};

export default commentService;

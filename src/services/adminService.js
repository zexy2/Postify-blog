/** Supabase-backed admin operations. Authorization is enforced by RLS too. */

import { requireSupabase } from '../lib/supabase';
import postService from './postService';

export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

const getCurrentProfile = async () => {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Giriş yapmalısınız.');

  const { data, error } = await client
    .from('profiles')
    .select('id, role')
    .eq('id', authData.user.id)
    .single();
  if (error) throw error;
  return data;
};

const checkAdminAuth = async () => {
  const profile = await getCurrentProfile();
  if (profile.role !== USER_ROLES.ADMIN) throw new Error('Admin yetkisi gerekiyor.');
  return true;
};

export const adminService = {
  checkAdminAuth,

  getDashboardStats: async () => {
    await checkAdminAuth();
    const stats = await postService.getStats();
    const { count: users, error } = await requireSupabase()
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return { totalUsers: users || 0, totalPosts: stats.posts, totalComments: stats.comments };
  },

  getAllUsers: async () => {
    await checkAdminAuth();
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('id, email, full_name, username, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  updateUserRole: async (userId, role) => {
    await checkAdminAuth();
    if (!Object.values(USER_ROLES).includes(role)) throw new Error('Geçersiz rol.');
    const { data, error } = await requireSupabase()
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteUser: async () => {
    await checkAdminAuth();
    throw new Error('Kullanıcı silme işlemi yalnızca güvenli server-side Admin API üzerinden yapılabilir.');
  },

  getAllPosts: async () => {
    await checkAdminAuth();
    const { data, error } = await requireSupabase()
      .from('posts')
      .select('id, slug, title, category, author_id, is_published, created_at, published_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((post) => ({
      ...post,
      isPublished: post.is_published,
      createdAt: post.created_at,
    }));
  },

  deletePost: async (postId) => {
    await checkAdminAuth();
    await postService.delete(postId);
    return { success: true };
  },

  updatePost: async (postId, updates) => {
    await checkAdminAuth();
    return postService.update(postId, updates);
  },

  togglePostVisibility: async (postId) => {
    await checkAdminAuth();
    const client = requireSupabase();
    const { data: post, error: readError } = await client
      .from('posts')
      .select('is_published')
      .eq('id', postId)
      .single();
    if (readError) throw readError;

    const { data, error } = await client
      .from('posts')
      .update({ is_published: !post.is_published })
      .eq('id', postId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default adminService;

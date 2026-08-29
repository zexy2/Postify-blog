/** Supabase-backed admin operations. Authorization is enforced by RLS too. */

import { requireSupabase } from '../lib/supabase';
import postService from './postService';

export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

export const buildAdminDashboardStats = (profiles = [], stats = {}) => ({
  totalUsers: profiles.length,
  totalPosts: stats.posts || 0,
  totalComments: stats.comments || 0,
  adminCount: profiles.filter((profile) => profile.role === USER_ROLES.ADMIN).length,
  moderatorCount: profiles.filter((profile) => profile.role === USER_ROLES.MODERATOR).length,
  recentUsers: profiles.slice(0, 5),
});

export const enrichAdminPosts = (rows = [], authorProfiles = []) => {
  const authors = new Map(authorProfiles.map((profile) => [String(profile.id), profile]));
  return rows.map((post) => {
    const author = authors.get(String(post.author_id));
    return {
      ...post,
      isPublished: post.is_published,
      createdAt: post.created_at,
      author: author?.full_name || author?.username || author?.email || 'Anonim',
    };
  });
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
    const [stats, profilesResult] = await Promise.all([
      postService.getStats(),
      requireSupabase()
        .from('profiles')
        .select('id, email, full_name, username, avatar_url, role, created_at')
        .order('created_at', { ascending: false }),
    ]);
    if (profilesResult.error) throw profilesResult.error;
    return buildAdminDashboardStats(profilesResult.data || [], stats);
  },

  getAllUsers: async () => {
    await checkAdminAuth();
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('id, email, full_name, username, avatar_url, role, created_at')
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
    const client = requireSupabase();
    const { data, error } = await client
      .from('posts')
      .select('id, slug, title, category, author_id, is_published, created_at, published_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = data || [];
    const authorIds = [...new Set(rows.map((post) => post.author_id).filter(Boolean))];
    let authorProfiles = [];
    if (authorIds.length) {
      const result = await client
        .from('profiles')
        .select('id, full_name, username, email')
        .in('id', authorIds);
      if (result.error) throw result.error;
      authorProfiles = result.data || [];
    }
    return enrichAdminPosts(rows, authorProfiles);
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

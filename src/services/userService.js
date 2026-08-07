/** Profile service backed by Supabase. */

import { requireSupabase } from '../lib/supabase';

const PROFILE_FIELDS = 'id, full_name, username, email, avatar_url, bio, role, website, location, created_at';

const normalizeProfile = (profile) => profile && ({
  ...profile,
  name: profile.full_name || profile.username || 'Postify Editor',
  fullName: profile.full_name || profile.username || 'Postify Editor',
  avatarUrl: profile.avatar_url || null,
});

export const userService = {
  getAll: async () => {
    const { data, error } = await requireSupabase().from('profiles').select(PROFILE_FIELDS).order('created_at');
    if (error) throw error;
    return (data || []).map(normalizeProfile);
  },

  getById: async (id) => {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return normalizeProfile(data);
  },
};

export default userService;

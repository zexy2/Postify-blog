/** Profile service backed by Supabase. */

import { requireSupabase } from '../lib/supabase';
import { FALLBACK_AUTHOR } from '../content/fallbackPosts';
import { safeHttpUrl } from '../lib/seoUtils';

const PROFILE_FIELDS = 'id, full_name, username, email, avatar_url, bio, role, website, location, created_at';

const normalizeProfile = (profile) => profile && ({
  ...profile,
  name: profile.full_name || profile.username || 'Postify Editör',
  fullName: profile.full_name || profile.username || 'Postify Editör',
  avatarUrl: profile.avatar_url || null,
  website: safeHttpUrl(profile.website),
});

export const userService = {
  getAll: async () => {
    const { data, error } = await requireSupabase().from('profiles').select(PROFILE_FIELDS).order('created_at');
    if (error) throw error;
    return (data || []).map(normalizeProfile);
  },

  getById: async (id) => {
    if (!id || id === FALLBACK_AUTHOR.id || id === 'postify' || id === 'editor' || id === 'fallback-editor') {
      return FALLBACK_AUTHOR;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return FALLBACK_AUTHOR;

    const { data, error } = await requireSupabase()
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return FALLBACK_AUTHOR;
    return normalizeProfile(data);
  },
};

export default userService;

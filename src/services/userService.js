/** Profile service backed by Supabase. */

import { requireSupabase } from '../lib/supabase';
import { getFallbackAuthor, isFallbackAuthorIdentifier } from '../content/fallbackPosts';
import { safeHttpUrl } from '../lib/seoUtils';

const PROFILE_FIELDS = 'id, full_name, username, email, avatar_url, bio, role, website, location, created_at';

const normalizeProfile = (profile, locale = 'tr') => profile && ({
  ...profile,
  name: profile.full_name || profile.username || (locale?.startsWith('en') ? 'Postify Editor' : 'Postify Editör'),
  fullName: profile.full_name || profile.username || (locale?.startsWith('en') ? 'Postify Editor' : 'Postify Editör'),
  avatarUrl: profile.avatar_url || null,
  website: safeHttpUrl(profile.website),
});

export const userService = {
  getAll: async () => {
    const { data, error } = await requireSupabase().from('profiles').select(PROFILE_FIELDS).order('created_at');
    if (error) throw error;
    return (data || []).map(normalizeProfile);
  },

  getById: async (id, locale = 'tr') => {
    if (isFallbackAuthorIdentifier(id)) {
      return getFallbackAuthor(locale);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return null;

    const { data, error } = await requireSupabase()
      .from('profiles')
      .select(PROFILE_FIELDS)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return normalizeProfile(data, locale);
  },
};

export default userService;

/** Supabase-only authentication service. */

import { auth, requireSupabase } from '../lib/supabase';

const profileFor = ({ id, email, fullName, username }) => ({
  id,
  email,
  full_name: fullName,
  username,
});

export const authService = {
  register: async ({ email, password, fullName, username }) => {
    const data = await auth.signUp(email, password, {
      full_name: fullName,
      username,
    });

    // The database trigger creates the profile from auth metadata. When email
    // confirmation is enabled there is no authenticated client session yet,
    // so a client-side profiles upsert would fail with RLS.
    return {
      ...data,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    };
  },

  login: ({ email, password }) => auth.signIn(email, password),
  loginWithOAuth: (provider) => auth.signInWithOAuth(provider),
  logout: () => auth.signOut(),
  getSession: () => auth.getSession(),
  getCurrentUser: () => auth.getUser(),

  getProfile: async (userId) => {
    const client = requireSupabase();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;

    if (!data) {
      const { data: authData, error: authError } = await client.auth.getUser();
      if (authError) throw authError;
      if (authData.user?.id === userId) {
        const metadata = authData.user.user_metadata || {};
        const { data: createdProfile, error: createError } = await client
          .from('profiles')
          .upsert(profileFor({
            id: userId,
            email: authData.user.email || '',
            fullName: metadata.full_name || metadata.name || '',
            username: metadata.username || '',
          }), { onConflict: 'id' })
          .select()
          .single();
        if (createError) throw createError;
        return createdProfile;
      }
    }

    return data;
  },

  updateProfile: async (userId, updates) => {
    await auth.updateProfile(updates);
    const { data, error } = await requireSupabase()
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  resetPassword: (email) => auth.resetPassword(email),
  updatePassword: (password) => auth.updatePassword(password),
  onAuthStateChange: (callback) => auth.onAuthStateChange(callback),
};

export default authService;

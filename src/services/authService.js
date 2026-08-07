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

    if (data.user) {
      const { error } = await requireSupabase()
        .from('profiles')
        .upsert(profileFor({ id: data.user.id, email, fullName, username }), { onConflict: 'id' });
      if (error) throw error;
    }

    return data;
  },

  login: ({ email, password }) => auth.signIn(email, password),
  loginWithOAuth: (provider) => auth.signInWithOAuth(provider),
  logout: () => auth.signOut(),
  getSession: () => auth.getSession(),
  getCurrentUser: () => auth.getUser(),

  getProfile: async (userId) => {
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
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

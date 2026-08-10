/**
 * Supabase client configuration.
 *
 * Supabase remains the production data and auth source. Public post reads have
 * a separate read-only local catalogue in postService so a missing or paused
 * project does not turn the public blog into a blank page.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const hasSupabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const requireSupabase = () => supabase;

export const auth = {
  signUp: async (email, password, metadata = {}) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  signInWithOAuth: async (provider) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const { data, error } = await requireSupabase().auth.getSession();
    if (error) throw error;
    return data.session;
  },

  getUser: async () => {
    const { data, error } = await requireSupabase().auth.getUser();
    if (error) throw error;
    return data.user;
  },

  resetPassword: async (email) => {
    const { data, error } = await requireSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  updatePassword: async (newPassword) => {
    const { data, error } = await requireSupabase().auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },

  updateProfile: async (updates) => {
    const { data, error } = await requireSupabase().auth.updateUser({ data: updates });
    if (error) throw error;
    return data;
  },

  onAuthStateChange: (callback) => requireSupabase().auth.onAuthStateChange(callback),
};

export const storage = {
  upload: async (bucket, path, file, options = {}) => {
    const { data, error } = await requireSupabase().storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      ...options,
    });
    if (error) throw error;
    return data;
  },

  getPublicUrl: (bucket, path) => {
    const { data } = requireSupabase().storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  delete: async (bucket, paths) => {
    const { data, error } = await requireSupabase().storage.from(bucket).remove(paths);
    if (error) throw error;
    return data;
  },

  list: async (bucket, path = '', options = {}) => {
    const { data, error } = await requireSupabase().storage.from(bucket).list(path, options);
    if (error) throw error;
    return data;
  },
};

export const supabaseAuth = supabase?.auth ?? null;
export const supabaseStorage = supabase?.storage ?? null;

export default supabase;

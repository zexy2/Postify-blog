/**
 * Authentication Service
 *
 * Handles all authentication operations
 * Uses Supabase if configured, otherwise falls back to local auth
 */

import { localAuthService } from "./localAuthService";

let supabaseModulePromise;
const getSupabaseModule = () => {
  supabaseModulePromise ||= import("../lib/supabase");
  return supabaseModulePromise;
};

// Check if Supabase is properly configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const isSupabaseConfigured =
  supabaseUrl &&
  !supabaseUrl.includes("your-project") &&
  !supabaseUrl.includes("placeholder");

// Use local auth if Supabase is not configured
const authProvider = isSupabaseConfigured ? "supabase" : "local";

// Log auth provider in development only
if (import.meta.env.DEV) {
  console.log(`🔐 Auth Provider: ${authProvider}`);
}

export const authService = {
  /**
   * Register a new user
   */
  register: async ({ email, password, fullName, username }) => {
    if (authProvider === "local") {
      return localAuthService.register({ email, password, fullName, username });
    }

    const { auth, supabase } = await getSupabaseModule();
    const data = await auth.signUp(email, password, {
      full_name: fullName,
      username,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    // Create profile in profiles table
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
        username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });
    }

    return data;
  },

  /**
   * Sign in with email and password
   */
  login: async ({ email, password }) => {
    if (authProvider === "local") {
      return localAuthService.login({ email, password });
    }
    const { auth } = await getSupabaseModule();
    return auth.signIn(email, password);
  },

  /**
   * Sign in with OAuth provider (Google, GitHub)
   */
  loginWithOAuth: async (provider) => {
    if (authProvider === "local") {
      return localAuthService.loginWithOAuth(provider);
    }
    const { auth } = await getSupabaseModule();
    return auth.signInWithOAuth(provider);
  },

  /**
   * Sign out current user
   */
  logout: async () => {
    if (authProvider === "local") {
      return localAuthService.logout();
    }
    const { auth } = await getSupabaseModule();
    return auth.signOut();
  },

  /**
   * Get current session
   */
  getSession: async () => {
    if (authProvider === "local") {
      return localAuthService.getSession();
    }
    const { auth } = await getSupabaseModule();
    return auth.getSession();
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    if (authProvider === "local") {
      return localAuthService.getCurrentUser();
    }
    const { auth } = await getSupabaseModule();
    return auth.getUser();
  },

  /**
   * Get user profile from profiles table
   */
  getProfile: async (userId) => {
    if (authProvider === "local") {
      return localAuthService.getProfile(userId);
    }

    const { supabase } = await getSupabaseModule();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
    return data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, updates) => {
    if (authProvider === "local") {
      return localAuthService.updateProfile(userId, updates);
    }

    // Update auth metadata
    const { auth, supabase } = await getSupabaseModule();
    await auth.updateProfile(updates);

    // Update profiles table
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Send password reset email
   */
  resetPassword: async (email) => {
    if (authProvider === "local") {
      return localAuthService.resetPassword(email);
    }
    const { auth } = await getSupabaseModule();
    return auth.resetPassword(email);
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword) => {
    if (authProvider === "local") {
      return localAuthService.updatePassword(newPassword);
    }
    const { auth } = await getSupabaseModule();
    return auth.updatePassword(newPassword);
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: async (callback) => {
    if (authProvider === "local") {
      return localAuthService.onAuthStateChange(callback);
    }
    const { auth } = await getSupabaseModule();
    return auth.onAuthStateChange(callback);
  },
};

export default authService;

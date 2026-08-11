/**
 * useAuth Hook
 *
 * Provides authentication state and methods
 */

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { authService } from "../services/authService";
import {
  setUser,
  setSession,
  setLoading,
  setError,
  logout as logoutAction,
} from "../store/slices/userSlice";

const getAuthErrorMessage = (error, fallback, t) => {
  if (error?.code === 'email_not_confirmed' || /email not confirmed/i.test(error?.message || '')) {
    return t('auth.emailNotConfirmed');
  }
  return error?.message || fallback;
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { user, session, isLoading, isAuthenticated, error } = useSelector(
    (state) => state.user,
  );

  /**
   * Catch and clean up OAuth URL error query parameters (e.g. from Google login failure)
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));

    const error = urlParams.get('error') || hashParams.get('error');
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');

    if (error || errorDescription) {
      const cleanDesc = errorDescription
        ? decodeURIComponent(errorDescription).replace(/\+/g, ' ')
        : t('auth.oauthError', 'Google girişinde bir doğrulama hatası oluştu.');

      console.warn('OAuth Auth Error:', error, cleanDesc);
      toast.error(`Giriş Yapılamadı: ${cleanDesc}`, { duration: 6000 });

      // Clean up raw error query and hash params from browser address bar
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [t]);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const currentSession = await authService.getSession();

        if (currentSession && isMounted) {
          dispatch(setSession(currentSession));
          const currentUser = await authService.getCurrentUser();

          if (currentUser && isMounted) {
            const profile = await authService.getProfile(currentUser.id);
            dispatch(setUser({ ...currentUser, profile }));
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) {
          dispatch(setLoading(false));
        }
      }
    };

    let subscription;
    const startAuth = async () => {
      await initAuth();
      if (!isMounted) return;

      const result = await authService.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;

        if (event === "SIGNED_IN" && newSession) {
          dispatch(setSession(newSession));
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            const profile = await authService.getProfile(currentUser.id);
            dispatch(setUser({ ...currentUser, profile }));
          }
          dispatch(setLoading(false));
        } else if (event === "SIGNED_OUT") {
          dispatch(logoutAction());
          dispatch(setLoading(false));
        }
      });
      subscription = result?.data?.subscription;
    };

    const idleId = "requestIdleCallback" in window
      ? window.requestIdleCallback(startAuth, { timeout: 2000 })
      : window.setTimeout(startAuth, 1200);

    return () => {
      isMounted = false;
      if ("cancelIdleCallback" in window && typeof idleId === "number") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  /**
   * Register a new user
   */
  const register = useCallback(
    async ({ email, password, fullName, username }) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const registration = await authService.register({ email, password, fullName, username });

        toast.success(registration.needsEmailConfirmation
          ? t("auth.registerConfirmationRequired")
          : t("auth.registerSuccess"));
        navigate(registration.needsEmailConfirmation ? "/auth/login?registered=1" : "/auth/login");

        return { success: true };
      } catch (err) {
        const message = getAuthErrorMessage(err, t("auth.registerError"), t);
        dispatch(setError(message));
        toast.error(message);
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate, t],
  );

  /**
   * Login with email and password
   */
  const login = useCallback(
    async ({ email, password }) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const { session: newSession, user: newUser } = await authService.login({
          email,
          password,
        });

        dispatch(setSession(newSession));

        if (newUser) {
          const profile = await authService.getProfile(newUser.id);
          dispatch(setUser({ ...newUser, profile }));
        }

        toast.success(t("auth.loginSuccess"));
        navigate("/");

        return { success: true };
      } catch (err) {
        const message = getAuthErrorMessage(err, t("auth.loginError"), t);
        dispatch(setError(message));
        toast.error(message);
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate, t],
  );

  /**
   * Login with OAuth provider
   */
  const loginWithOAuth = useCallback(
    async (provider) => {
      try {
        dispatch(setLoading(true));
        await authService.loginWithOAuth(provider);
        return { success: true };
      } catch (err) {
        const message = err.message || t("auth.oauthError");
        toast.error(message);
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, t],
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(logoutAction());
      toast.success(t("auth.logoutSuccess"));
      navigate("/");
    } catch (err) {
      toast.error(err.message || t("auth.logoutError"));
    }
  }, [dispatch, navigate, t]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates) => {
      try {
        dispatch(setLoading(true));

        if (!user?.id) throw new Error("Not authenticated");

        const updatedProfile = await authService.updateProfile(
          user.id,
          updates,
        );
        dispatch(setUser({ ...user, profile: updatedProfile }));

        toast.success(t("auth.profileUpdated"));
        return { success: true, profile: updatedProfile };
      } catch (err) {
        const message = err.message || t("auth.profileUpdateError");
        toast.error(message);
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, user, t],
  );

  /**
   * Reset password
   */
  const resetPassword = useCallback(
    async (email) => {
      try {
        dispatch(setLoading(true));
        await authService.resetPassword(email);
        toast.success(t("auth.resetPasswordSent"));
        return { success: true };
      } catch (err) {
        const message = err.message || t("auth.resetPasswordError");
        toast.error(message);
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, t],
  );

  /**
   * Update password
   */
  const updatePassword = useCallback(
    async (newPassword) => {
      try {
        dispatch(setLoading(true));
        await authService.updatePassword(newPassword);
        toast.success(t("auth.passwordUpdated"));
        return { success: true };
      } catch (err) {
        const message = err.message || t("auth.passwordUpdateError");
        toast.error(message);
        return { success: false, error: message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, t],
  );

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    register,
    login,
    loginWithOAuth,
    logout,
    updateProfile,
    resetPassword,
    updatePassword,
  };
};

export default useAuth;

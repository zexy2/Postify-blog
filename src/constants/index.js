/**
 * Application Constants
 * Centralized configuration for the entire application
 */

export const STORAGE_KEYS = {
  THEME: 'postify_theme',
  BOOKMARKS: 'postify_bookmarks',
  USER_PREFERENCES: 'postify_preferences',
  DRAFT_POST: 'postify_draft',
  LANGUAGE: 'postify_language',
};

export const CACHE_TIME = {
  STALE: 1000 * 60 * 5, // 5 minutes
  GC: 1000 * 60 * 30, // 30 minutes
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

export const ROUTES = {
  HOME: '/',
  POST_DETAIL: '/posts/:id',
  POST_CREATE: '/posts/create',
  POST_EDIT: '/posts/:id/edit',
  USER_PROFILE: '/users/:id',
  BOOKMARKS: '/bookmarks',
  ABOUT: '/about',
  CONTACT: '/contact',
  ANALYTICS: '/analytics',
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const TOAST_CONFIG = {
  duration: 3000,
  position: 'bottom-right',
};

export const EDITOR_CONFIG = {
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 100,
  MIN_BODY_LENGTH: 50,
  MAX_BODY_LENGTH: 10000,
};

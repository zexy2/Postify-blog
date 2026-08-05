/**
 * RESTful API Service
 *
 * Provides a RESTful API layer for all data operations
 * Abstracts the data source (Supabase/localStorage) behind REST endpoints
 */

import { supabase } from "../lib/supabase";
import { jwtService } from "./jwtService";

// API Configuration
const API_VERSION = "v1";
const BASE_URL = "/api";

// Check if Supabase is configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const isSupabaseConfigured =
  supabaseUrl &&
  !supabaseUrl.includes("your-project") &&
  !supabaseUrl.includes("placeholder");

// Storage keys for localStorage fallback
const STORAGE_KEYS = {
  POSTS: "postify_posts",
  USERS: "postify_users",
  COMMENTS: "postify_comments",
};

/**
 * HTTP Response helper
 */
const createResponse = (data, status = 200, message = "Success") => ({
  data,
  status,
  message,
  timestamp: new Date().toISOString(),
  api_version: API_VERSION,
});

const createErrorResponse = (message, status = 400) => ({
  data: null,
  status,
  message,
  error: true,
  timestamp: new Date().toISOString(),
  api_version: API_VERSION,
});

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = () => {
  const session = JSON.parse(localStorage.getItem("postify_session") || "null");
  const token = session?.access_token;

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    "X-API-Version": API_VERSION,
  };
};

/**
 * Verify JWT token from request
 */
const verifyAuth = () => {
  const session = JSON.parse(localStorage.getItem("postify_session") || "null");
  if (!session?.access_token) {
    return { authenticated: false, user: null };
  }

  const decoded = jwtService.verifyToken(session.access_token);
  return {
    authenticated: !!decoded,
    user: decoded,
  };
};

// ============================================
// POSTS API - /api/v1/posts
// ============================================

const postsApi = {
  /**
   * GET /api/v1/posts
   * Fetch all posts with optional filters
   */
  getAll: async (params = {}) => {
    try {
      const { page = 1, limit = 10, category, search, author_id } = params;

      if (isSupabaseConfigured) {
        let query = supabase
          .from("posts")
          .select("*, author:profiles(id, full_name, username, avatar_url)", {
            count: "exact",
          })
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (category) query = query.eq("category", category);
        if (author_id) query = query.eq("author_id", author_id);
        if (search) query = query.ilike("title", `%${search}%`);

        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        return createResponse({
          posts: data,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
          },
        });
      } else {
        // localStorage fallback
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        let filtered = posts.filter((p) => p.is_published !== false);

        if (category)
          filtered = filtered.filter((p) => p.category === category);
        if (author_id)
          filtered = filtered.filter((p) => p.author_id === author_id);
        if (search)
          filtered = filtered.filter((p) =>
            p.title.toLowerCase().includes(search.toLowerCase()),
          );

        const total = filtered.length;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        return createResponse({
          posts: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        });
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * GET /api/v1/posts/:id
   * Fetch single post by ID
   */
  getById: async (id) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("posts")
          .select("*, author:profiles(id, full_name, username, avatar_url)")
          .eq("id", id)
          .single();

        if (error) throw error;
        return createResponse(data);
      } else {
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        const post = posts.find((p) => p.id === id);

        if (!post) {
          return createErrorResponse("Post not found", 404);
        }
        return createResponse(post);
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * POST /api/v1/posts
   * Create new post (requires auth)
   */
  create: async (postData) => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated) {
        return createErrorResponse("Unauthorized", 401);
      }

      const newPost = {
        ...postData,
        id: isSupabaseConfigured ? undefined : `post_${Date.now()}`,
        author_id: auth.user.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        is_published: true,
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("posts")
          .insert(newPost)
          .select()
          .single();

        if (error) throw error;
        return createResponse(data, 201, "Post created successfully");
      } else {
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        posts.unshift(newPost);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        return createResponse(newPost, 201, "Post created successfully");
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * PUT /api/v1/posts/:id
   * Update existing post (requires auth + ownership)
   */
  update: async (id, updates) => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated) {
        return createErrorResponse("Unauthorized", 401);
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("posts")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("author_id", auth.user.userId)
          .select()
          .single();

        if (error) throw error;
        return createResponse(data, 200, "Post updated successfully");
      } else {
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        const index = posts.findIndex((p) => p.id === id);

        if (index === -1) {
          return createErrorResponse("Post not found", 404);
        }

        if (posts[index].author_id !== auth.user.userId) {
          return createErrorResponse("Forbidden", 403);
        }

        posts[index] = {
          ...posts[index],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        return createResponse(posts[index], 200, "Post updated successfully");
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * DELETE /api/v1/posts/:id
   * Delete post (requires auth + ownership)
   */
  delete: async (id) => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated) {
        return createErrorResponse("Unauthorized", 401);
      }

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", id)
          .eq("author_id", auth.user.userId);

        if (error) throw error;
        return createResponse(null, 200, "Post deleted successfully");
      } else {
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        const index = posts.findIndex((p) => p.id === id);

        if (index === -1) {
          return createErrorResponse("Post not found", 404);
        }

        posts.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        return createResponse(null, 200, "Post deleted successfully");
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * PATCH /api/v1/posts/:id/views
   * Increment post views
   */
  incrementViews: async (id) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.rpc("increment_views", {
          post_id: id,
        });
        if (error) {
          // Fallback if RPC doesn't exist
          const { data: post } = await supabase
            .from("posts")
            .select("views")
            .eq("id", id)
            .single();

          await supabase
            .from("posts")
            .update({ views: (post?.views || 0) + 1 })
            .eq("id", id);
        }
        return createResponse({ success: true });
      } else {
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        const index = posts.findIndex((p) => p.id === id);
        if (index !== -1) {
          posts[index].views = (posts[index].views || 0) + 1;
          localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        }
        return createResponse({ success: true });
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },
};

// ============================================
// USERS API - /api/v1/users
// ============================================

const usersApi = {
  /**
   * GET /api/v1/users/:id
   * Get user profile
   */
  getById: async (id) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return createResponse(data);
      } else {
        const users = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.USERS) || "[]",
        );
        const user = users.find((u) => u.id === id);

        if (!user) {
          return createErrorResponse("User not found", 404);
        }

        const safeUser = { ...user };
        delete safeUser.password;
        return createResponse(safeUser);
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * GET /api/v1/users/:id/posts
   * Get posts by user
   */
  getPosts: async (userId, params = {}) => {
    return postsApi.getAll({ ...params, author_id: userId });
  },

  /**
   * PUT /api/v1/users/:id
   * Update user profile (requires auth)
   */
  update: async (id, updates) => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated || auth.user.userId !== id) {
        return createErrorResponse("Unauthorized", 401);
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("profiles")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return createResponse(data, 200, "Profile updated successfully");
      } else {
        const users = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.USERS) || "[]",
        );
        const index = users.findIndex((u) => u.id === id);

        if (index === -1) {
          return createErrorResponse("User not found", 404);
        }

        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        const safeUser = { ...users[index] };
        delete safeUser.password;
        return createResponse(safeUser, 200, "Profile updated successfully");
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },
};

// ============================================
// COMMENTS API - /api/v1/comments
// ============================================

const commentsApi = {
  /**
   * GET /api/v1/posts/:postId/comments
   * Get comments for a post
   */
  getByPostId: async (postId) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("comments")
          .select("*, author:profiles(id, full_name, username, avatar_url)")
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return createResponse(data);
      } else {
        const comments = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.COMMENTS) || "[]",
        );
        const postComments = comments.filter((c) => c.post_id === postId);
        return createResponse(postComments);
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * POST /api/v1/posts/:postId/comments
   * Add comment to post (requires auth)
   */
  create: async (postId, content) => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated) {
        return createErrorResponse("Unauthorized", 401);
      }

      const newComment = {
        id: isSupabaseConfigured ? undefined : `comment_${Date.now()}`,
        post_id: postId,
        author_id: auth.user.userId,
        content,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("comments")
          .insert(newComment)
          .select("*, author:profiles(id, full_name, username, avatar_url)")
          .single();

        if (error) throw error;
        return createResponse(data, 201, "Comment added successfully");
      } else {
        const comments = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.COMMENTS) || "[]",
        );
        comments.push(newComment);
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
        return createResponse(newComment, 201, "Comment added successfully");
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },

  /**
   * DELETE /api/v1/comments/:id
   * Delete comment (requires auth + ownership)
   */
  delete: async (id) => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated) {
        return createErrorResponse("Unauthorized", 401);
      }

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", id)
          .eq("author_id", auth.user.userId);

        if (error) throw error;
        return createResponse(null, 200, "Comment deleted successfully");
      } else {
        const comments = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.COMMENTS) || "[]",
        );
        const index = comments.findIndex(
          (c) => c.id === id && c.author_id === auth.user.userId,
        );

        if (index === -1) {
          return createErrorResponse("Comment not found or unauthorized", 404);
        }

        comments.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
        return createResponse(null, 200, "Comment deleted successfully");
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },
};

// ============================================
// ANALYTICS API - /api/v1/analytics
// ============================================

const analyticsApi = {
  /**
   * GET /api/v1/analytics/dashboard
   * Get dashboard statistics (admin only)
   */
  getDashboard: async () => {
    try {
      const auth = verifyAuth();
      if (!auth.authenticated || auth.user.role !== "admin") {
        return createErrorResponse("Forbidden", 403);
      }

      if (isSupabaseConfigured) {
        const [postsRes, usersRes] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);

        return createResponse({
          totalPosts: postsRes.count || 0,
          totalUsers: usersRes.count || 0,
          timestamp: new Date().toISOString(),
        });
      } else {
        const posts = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.POSTS) || "[]",
        );
        const users = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.USERS) || "[]",
        );

        return createResponse({
          totalPosts: posts.length,
          totalUsers: users.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      return createErrorResponse(error.message, 500);
    }
  },
};

// ============================================
// MAIN API EXPORT
// ============================================

export const api = {
  // Version info
  version: API_VERSION,
  baseUrl: BASE_URL,

  // Endpoints
  posts: postsApi,
  users: usersApi,
  comments: commentsApi,
  analytics: analyticsApi,

  // Utilities
  getAuthHeaders,
  verifyAuth,

  // Health check
  health: () =>
    createResponse({
      status: "healthy",
      version: API_VERSION,
      provider: isSupabaseConfigured ? "supabase" : "localStorage",
      timestamp: new Date().toISOString(),
    }),
};

export default api;

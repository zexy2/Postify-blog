/**
 * Posts Slice
 * Manages posts state with optimistic updates
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postService } from '../../services/postService';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await postService.getAll();
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const [post, comments] = await Promise.all([
        postService.getById(id),
        postService.getComments(id),
      ]);
      return { post, comments };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      return await postService.create(postData);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await postService.update(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await postService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete post');
    }
  }
);

const initialState = {
  items: [],
  currentPost: null,
  currentComments: [],
  userPosts: [], // Custom posts created by user
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastFetched: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.currentComments = [];
    },
    addLocalPost: (state, action) => {
      // Add user-created post to the beginning
      state.userPosts.unshift(action.payload);
    },
    updateLocalPost: (state, action) => {
      const { id, data } = action.payload;
      const index = state.userPosts.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.userPosts[index] = { ...state.userPosts[index], ...data };
      }
    },
    deleteLocalPost: (state, action) => {
      state.userPosts = state.userPosts.filter((p) => p.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all posts
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch single post
      .addCase(fetchPostById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPost = action.payload.post;
        state.currentComments = action.payload.comments;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      });
  },
});

export const {
  clearCurrentPost,
  addLocalPost,
  updateLocalPost,
  deleteLocalPost,
  clearError,
} = postsSlice.actions;

// Selectors
export const selectAllPosts = (state) => state.posts.items;
export const selectUserPosts = (state) => state.posts.userPosts;
export const selectAllPostsCombined = (state) => [
  ...state.posts.userPosts,
  ...state.posts.items,
];
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectCurrentComments = (state) => state.posts.currentComments;
export const selectPostsStatus = (state) => state.posts.status;
export const selectPostsError = (state) => state.posts.error;

export default postsSlice.reducer;

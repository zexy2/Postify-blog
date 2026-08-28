/**
 * Redux Store Configuration
 * Configured with persistence and dev tools
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import uiReducer from './slices/uiSlice';
import postsReducer from './slices/postsSlice';
import bookmarksReducer from './slices/bookmarksSlice';
import userReducer from './slices/userSlice';
import aiReducer from '../features/ai-assistant/store/aiSlice';

// Combine all reducers
const rootReducer = combineReducers({
  ui: uiReducer,
  posts: postsReducer,
  bookmarks: bookmarksReducer,
  user: userReducer,
  ai: aiReducer,
});

// Persist configuration
const persistConfig = {
  key: 'postify_root',
  version: 1,
  storage,
  whitelist: ['ui', 'bookmarks'], // Only persist these reducers
  blacklist: ['posts'], // Don't persist posts (fetched from API)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// Export types for use in components
export const getState = store.getState;
export const dispatch = store.dispatch;

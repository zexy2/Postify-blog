/**
 * useBookmarks Hook
 * Manage bookmarked posts with Redux
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  toggleBookmark,
  addBookmark,
  removeBookmark,
  clearAllBookmarks,
  selectBookmarkedIds,
  selectBookmarkedPosts,
} from '../store/slices/bookmarksSlice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useBookmarks() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const bookmarkedIds = useSelector(selectBookmarkedIds);
  const bookmarkedPosts = useSelector(selectBookmarkedPosts);

  const isBookmarked = useCallback(
    (postId) => bookmarkedIds.includes(postId),
    [bookmarkedIds]
  );

  const toggle = useCallback(
    (postId, postData = null) => {
      const wasBookmarked = bookmarkedIds.includes(postId);
      dispatch(toggleBookmark({ id: postId, postData }));
      
      if (wasBookmarked) {
        toast.success(t('success.bookmarkRemoved'));
      } else {
        toast.success(t('success.bookmarkAdded'));
      }
    },
    [dispatch, bookmarkedIds, t]
  );

  const add = useCallback(
    (postId, postData = null) => {
      if (!bookmarkedIds.includes(postId)) {
        dispatch(addBookmark({ id: postId, postData }));
        toast.success(t('success.bookmarkAdded'));
      }
    },
    [dispatch, bookmarkedIds, t]
  );

  const remove = useCallback(
    (postId) => {
      dispatch(removeBookmark(postId));
      toast.success(t('success.bookmarkRemoved'));
    },
    [dispatch, t]
  );

  const clearAll = useCallback(() => {
    dispatch(clearAllBookmarks());
    toast.success(t('bookmarks.clearAll'));
  }, [dispatch, t]);

  // Get bookmarked posts as array
  const bookmarkedPostsList = useMemo(() => {
    return bookmarkedIds
      .map((id) => bookmarkedPosts[id])
      .filter(Boolean);
  }, [bookmarkedIds, bookmarkedPosts]);

  return {
    bookmarkedIds,
    bookmarkedPosts: bookmarkedPostsList,
    bookmarksCount: bookmarkedIds.length,
    isBookmarked,
    toggle,
    add,
    remove,
    clearAll,
  };
}

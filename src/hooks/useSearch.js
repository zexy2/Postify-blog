/**
 * useSearch Hook
 * Debounced search with Redux
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { setSearchQuery, clearSearch, selectSearchQuery } from '../store/slices/uiSlice';
import { useDebounce } from './useDebounce';

export function useSearch() {
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const debouncedQuery = useDebounce(searchQuery, 300);

  const setQuery = useCallback(
    (query) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearSearch());
  }, [dispatch]);

  // Normalize text for search (remove diacritics, lowercase)
  const normalizeText = useCallback((text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }, []);

  // Search filter function
  const filterBySearch = useCallback(
    (items, searchFields) => {
      if (!debouncedQuery.trim()) return items;

      const normalizedQuery = normalizeText(debouncedQuery);

      return items.filter((item) => {
        return searchFields.some((field) => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return normalizeText(String(value || '')).includes(normalizedQuery);
        });
      });
    },
    [debouncedQuery, normalizeText]
  );

  return {
    query: searchQuery,
    debouncedQuery,
    setQuery,
    clear,
    filterBySearch,
    hasQuery: searchQuery.trim().length > 0,
  };
}

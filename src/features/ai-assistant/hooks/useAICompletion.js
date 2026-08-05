/**
 * useAICompletion Hook
 * Ghost text completion için debounce ve state yönetimi
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCompletion } from '../services/aiService';
import {
  selectAIEnabled,
  selectGhostCompletionEnabled,
  selectAdaptiveDelay,
  selectLanguage,
  selectIsCooldown,
  setSuggestion,
  clearSuggestion,
  setLoading,
  acceptSuggestion as acceptAction,
  rejectSuggestion as rejectAction,
} from '../store/aiSlice';
import { AI_CONFIG } from '../../../constants/ai';

/**
 * Custom debounce hook with cleanup
 */
const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, cancel];
};

/**
 * Hook for AI ghost text completion
 * @param {Object} editor - TipTap editor instance
 * @returns {Object} - { suggestion, isLoading, acceptSuggestion, dismissSuggestion, requestCompletion }
 */
export const useAICompletion = (editor) => {
  const dispatch = useDispatch();

  // Redux selectors
  const aiEnabled = useSelector(selectAIEnabled);
  const ghostEnabled = useSelector(selectGhostCompletionEnabled);
  const adaptiveDelay = useSelector(selectAdaptiveDelay);
  const language = useSelector(selectLanguage);
  const isCooldown = useSelector(selectIsCooldown);

  // Local state for suggestion (for faster UI updates)
  const [localSuggestion, setLocalSuggestion] = useState(null);
  const [isLoading, setIsLocalLoading] = useState(false);

  // Refs
  const abortControllerRef = useRef(null);
  const lastTextRef = useRef('');

  /**
   * Check if we should trigger completion
   */
  const shouldTriggerCompletion = useCallback(
    (text, cursorPosition) => {
      // Feature checks
      if (!aiEnabled || !ghostEnabled) return false;
      if (isCooldown) return false;

      // Minimum text length
      if (text.length < AI_CONFIG.LIMITS.MIN_TRIGGER_CHARS) return false;

      // Cursor must be at end or after a space/punctuation
      if (cursorPosition < text.length) {
        const charAfterCursor = text[cursorPosition];
        if (charAfterCursor && !/[\s.,!?;:\n]/.test(charAfterCursor)) {
          return false;
        }
      }

      // Check if cursor is at end of a word/sentence
      const textBeforeCursor = text.slice(0, cursorPosition);
      // Trigger after space, punctuation, or at end of line
      if (/[\s.,!?;:\n]$/.test(textBeforeCursor) || cursorPosition === text.length) {
        return true;
      }

      return false;
    },
    [aiEnabled, ghostEnabled, isCooldown]
  );

  /**
   * Request completion from AI
   */
  const requestCompletionInternal = useCallback(
    async (text, cursorPosition) => {
      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Validate
      if (!shouldTriggerCompletion(text, cursorPosition)) {
        return;
      }

      // Skip if text hasn't changed significantly
      if (text === lastTextRef.current) {
        return;
      }
      lastTextRef.current = text;

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsLocalLoading(true);
      dispatch(setLoading(true));

      try {
        const result = await getCompletion({
          text,
          cursorPosition,
          language,
          signal: abortControllerRef.current.signal,
        });

        if (result.completion && result.completion.length > 0) {
          const suggestion = {
            text: result.completion,
            position: cursorPosition,
            confidence: result.confidence,
          };
          setLocalSuggestion(suggestion);
          dispatch(setSuggestion(suggestion));
        } else {
          setLocalSuggestion(null);
          dispatch(clearSuggestion());
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Completion request failed:', error);
        }
        setLocalSuggestion(null);
        dispatch(clearSuggestion());
      } finally {
        setIsLocalLoading(false);
        dispatch(setLoading(false));
      }
    },
    [dispatch, language, shouldTriggerCompletion]
  );

  // Debounced completion request
  const [requestCompletion, cancelRequest] = useDebouncedCallback(
    requestCompletionInternal,
    adaptiveDelay
  );

  /**
   * Accept the current suggestion (Tab key)
   */
  const acceptSuggestion = useCallback(() => {
    if (!localSuggestion || !editor) return false;

    // Insert the suggestion text
    editor.chain().focus().insertContent(localSuggestion.text).run();

    // Clear and dispatch
    setLocalSuggestion(null);
    dispatch(acceptAction());

    return true;
  }, [localSuggestion, editor, dispatch]);

  /**
   * Dismiss the current suggestion (Esc key or different typing)
   */
  const dismissSuggestion = useCallback(() => {
    if (!localSuggestion) return;

    cancelRequest();
    setLocalSuggestion(null);
    dispatch(rejectAction());
  }, [localSuggestion, cancelRequest, dispatch]);

  /**
   * Accept word by word (Arrow Right)
   */
  const acceptWord = useCallback(() => {
    if (!localSuggestion || !editor) return false;

    const words = localSuggestion.text.split(/(\s+)/);
    if (words.length === 0) return false;

    // Get first word (including following space)
    const firstWord = words[0] + (words[1] || '');
    const remainingText = localSuggestion.text.slice(firstWord.length);

    // Insert first word
    editor.chain().focus().insertContent(firstWord).run();

    if (remainingText.trim()) {
      // Update suggestion with remaining text
      const newSuggestion = {
        ...localSuggestion,
        text: remainingText,
        position: localSuggestion.position + firstWord.length,
      };
      setLocalSuggestion(newSuggestion);
      dispatch(setSuggestion(newSuggestion));
    } else {
      // All words accepted
      setLocalSuggestion(null);
      dispatch(acceptAction());
    }

    return true;
  }, [localSuggestion, editor, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      cancelRequest();
    };
  }, [cancelRequest]);

  return {
    suggestion: localSuggestion,
    isLoading,
    requestCompletion,
    acceptSuggestion,
    dismissSuggestion,
    acceptWord,
    cancelRequest,
  };
};

export default useAICompletion;

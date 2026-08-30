/**
 * AI Assistant Feature Exports
 */

// Services
export { default as aiService } from './services/aiService';
export {
  isAIAvailable,
  getCompletion,
  checkGrammar,
  getVariations,
  continueWriting,
  setApiKey,
  clearApiKey,
} from './services/aiService';

// Hooks
export { useAICompletion } from './hooks/useAICompletion';

// Store
export { default as aiReducer } from './store/aiSlice';
export {
  toggleAI,
  toggleGhostCompletion,
  setLanguage,
  setSuggestion,
  clearSuggestion,
  acceptSuggestion,
  rejectSuggestion,
  updatePreferences,
  resetAnalytics,
  selectAIEnabled,
  selectGhostCompletionEnabled,
  selectCurrentSuggestion,
  selectIsLoading,
  selectAdaptiveDelay,
  selectLanguage,
  selectAcceptanceRate,
  selectIsCooldown,
} from './store/aiSlice';

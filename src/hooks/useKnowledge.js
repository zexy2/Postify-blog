import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getKnowledgeBackendStatus } from '../lib/knowledgeBackendStatus';

const loadKnowledgeService = () => import('../services/knowledgeService').then((module) => module.default);

export const knowledgeKeys = {
  all: ['knowledge'],
  backend: ['knowledge', 'backend-status'],
  summary: (id) => ['knowledge', 'summary', id],
  mine: (id) => ['knowledge', 'mine', id],
  failures: (id) => ['knowledge', 'failures', id],
  authorFailures: (id) => ['knowledge', 'author-failures', id],
  revisions: (id) => ['knowledge', 'revisions', id],
  shelf: ['knowledge', 'shelf'],
  gaps: ['knowledge', 'gaps'],
  dashboard: ['knowledge', 'dashboard'],
};

export function useKnowledgeBackendStatus() {
  return useQuery({
    queryKey: knowledgeKeys.backend,
    queryFn: () => getKnowledgeBackendStatus(),
    staleTime: 60_000,
    retry: 0,
  });
}

const useBackendReady = () => useKnowledgeBackendStatus().data?.ready === true;
const pendingError = () => Object.assign(new Error('Verified Knowledge backend upgrade is pending.'), { code: 'KNOWLEDGE_SCHEMA_PENDING' });

export function useEvidenceSummary(postId, { enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.summary(postId), queryFn: async () => (await loadKnowledgeService()).getSummary(postId), enabled: Boolean(postId) && enabled && ready, staleTime: 60_000, retry: 0 });
}
export function useMyConfirmation(postId, { enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.mine(postId), queryFn: async () => (await loadKnowledgeService()).getMyConfirmation(postId), enabled: Boolean(postId) && enabled && ready, staleTime: 30_000, retry: 0 });
}
export function useFailures(postId, { enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.failures(postId), queryFn: async () => (await loadKnowledgeService()).getFailures(postId), enabled: Boolean(postId) && enabled && ready, staleTime: 60_000, retry: 0 });
}
export function useAuthorFailureDetails(postId, { enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.authorFailures(postId), queryFn: async () => (await loadKnowledgeService()).getAuthorFailureDetails(postId), enabled: Boolean(postId) && enabled && ready, staleTime: 30_000, retry: 0 });
}
export function useRevisions(postId, { enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.revisions(postId), queryFn: async () => (await loadKnowledgeService()).getRevisions(postId), enabled: Boolean(postId) && enabled && ready, staleTime: 60_000, retry: 0 });
}
export function useSetConfirmation(postId) {
  const ready = useBackendReady();
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload) => ready ? (await loadKnowledgeService()).setConfirmation(postId, payload) : Promise.reject(pendingError()), onSuccess: () => { qc.invalidateQueries({ queryKey: knowledgeKeys.mine(postId) }); qc.invalidateQueries({ queryKey: knowledgeKeys.summary(postId) }); qc.invalidateQueries({ queryKey: knowledgeKeys.failures(postId) }); } });
}
export function useShelf({ enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.shelf, queryFn: async () => (await loadKnowledgeService()).getShelf(), enabled: enabled && ready, staleTime: 30_000, retry: 0 });
}
export function useSetShelf() {
  const ready = useBackendReady();
  const qc = useQueryClient();
  return useMutation({ mutationFn: async ({ postId, state }) => ready ? (await loadKnowledgeService()).setShelf(postId, state) : Promise.reject(pendingError()), onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.shelf }) });
}
export function useRequestGap() {
  const ready = useBackendReady();
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (query) => ready ? (await loadKnowledgeService()).requestGap(query) : Promise.reject(pendingError()), onSuccess: () => qc.invalidateQueries({ queryKey: knowledgeKeys.gaps }) });
}
export function useTopGaps({ enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.gaps, queryFn: async () => (await loadKnowledgeService()).getTopGaps(), enabled: enabled && ready, staleTime: 60_000, retry: 0 });
}
export function useAuthorDashboard({ enabled = true } = {}) {
  const ready = useBackendReady();
  return useQuery({ queryKey: knowledgeKeys.dashboard, queryFn: async () => (await loadKnowledgeService()).getAuthorDashboard(), enabled: enabled && ready, staleTime: 30_000, retry: 0 });
}
export function useReverifyPost() {
  const ready = useBackendReady();
  const qc = useQueryClient();
  return useMutation({ mutationFn: async ({ postId, reason }) => ready ? (await loadKnowledgeService()).reverifyPost(postId, reason) : Promise.reject(pendingError()), onSuccess: () => { qc.invalidateQueries({ queryKey: knowledgeKeys.dashboard }); qc.invalidateQueries({ queryKey: ['posts'] }); } });
}

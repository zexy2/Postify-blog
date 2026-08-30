import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import KnowledgeDashboardPage from './KnowledgeDashboardPage';

vi.mock('../../hooks/useKnowledge', () => ({
  useKnowledgeBackendStatus: () => ({ isLoading: true, data: undefined }),
  useAuthorDashboard: () => ({ isLoading: false, data: undefined }),
  useReverifyPost: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock('../../lib/domainCredibility', () => ({ getDomainCredibility: () => [] }));

describe('KnowledgeDashboardPage loading', () => {
  it('uses the shared busy status surface while account knowledge is loading', () => {
    render(<MemoryRouter><KnowledgeDashboardPage /></MemoryRouter>);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('heading', { name: /Bilgi sağlığı yükleniyor|Loading knowledge health/i })).toBeVisible();
  });
});

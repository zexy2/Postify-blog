import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LocalEvidenceActions from './LocalEvidenceActions';

vi.mock('react-redux', () => ({
  useSelector: (selector) => selector({ user: { isAuthenticated: false } }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'en' } }),
}));
vi.mock('../hooks/useKnowledge', () => ({
  useEvidenceSummary: () => ({ data: undefined }),
  useMyConfirmation: () => ({ data: null }),
  useSetConfirmation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useShelf: () => ({ data: [] }),
  useSetShelf: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useKnowledgeBackendStatus: () => ({ data: { ready: false } }),
}));

const post = { id: 'fallback-post-1', isFallback: true };

describe('LocalEvidenceActions', () => {
  beforeEach(() => window.localStorage.clear());

  it('collects evidence context inline without browser prompts', () => {
    const promptSpy = vi.spyOn(window, 'prompt');
    render(<LocalEvidenceActions post={post} />);

    const worked = screen.getByRole('button', { name: 'Worked' });
    expect(worked).toHaveAttribute('aria-pressed', 'false');
    expect(worked).not.toHaveAttribute('aria-controls');

    fireEvent.click(worked);
    expect(promptSpy).not.toHaveBeenCalled();
    expect(worked).toHaveAttribute('aria-expanded', 'true');
    expect(worked).toHaveAttribute('aria-controls', 'evidence-context-form');
    expect(screen.getByRole('button', { name: 'Save evidence' })).toBeVisible();

    fireEvent.change(screen.getByLabelText('Environment / version (optional)'), { target: { value: 'Node.js 22 · macOS 15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save evidence' }));

    expect(screen.getByRole('status')).toHaveTextContent('Evidence saved.');
    expect(screen.getByRole('button', { name: 'Worked' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Your environment: Node\.js 22 · macOS 15/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Save evidence' })).not.toBeInTheDocument();
    promptSpy.mockRestore();
  });

  it('shows failure-note context and exposes shelf selection as pressed state', () => {
    render(<LocalEvidenceActions post={post} />);

    fireEvent.click(screen.getByRole('button', { name: "Didn't work" }));
    expect(screen.getByLabelText('What failed? (optional)')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByLabelText('What failed? (optional)')).not.toBeInTheDocument();

    const shelf = screen.getByRole('button', { name: 'Try later' });
    expect(shelf).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(shelf);
    expect(shelf).toHaveAttribute('aria-pressed', 'true');
  });
});

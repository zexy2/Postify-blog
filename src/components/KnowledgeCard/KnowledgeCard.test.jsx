import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../test/utils';
import { getFallbackPosts } from '../../content/fallbackPosts';
import EditorialFeed from '../EditorialFeed';

const posts = getFallbackPosts('tr').slice(0, 6);

describe('KnowledgeCard system', () => {
  it('renders one featured, three standard, and remaining compact records', () => {
    const { container } = render(<EditorialFeed posts={posts} bookmarkedIds={[]} onBookmarkToggle={vi.fn()} />);

    expect(container.querySelectorAll('[data-card-variant="featured"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-card-variant="standard"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-card-variant="compact"]')).toHaveLength(2);
  });

  it('keeps outcome, evidence, freshness, and bookmark actions visible in the live feed', () => {
    render(<EditorialFeed posts={posts.slice(0, 2)} bookmarkedIds={[posts[0].id]} onBookmarkToggle={vi.fn()} />);

    expect(screen.getAllByText('Sonuç')).toHaveLength(2);
    expect(screen.getAllByText('Kanıt').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Güncellik').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/favorilerden kaldır|remove from bookmarks/i)).toBeInTheDocument();
  });
});

/**
 * PostCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test/utils';
import PostCard from './PostCard/PostCard';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  },
}));

const mockPost = {
  id: 1,
  userId: 1,
  title: 'Test Post Title',
  body: 'This is a test post body with some content that should be displayed in the card preview.',
};

const mockAuthor = {
  id: 1,
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
};

describe('PostCard', () => {
  it('should render post title', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('should render author name', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render post snippet', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);

    expect(screen.getByText(/This is a test post body/)).toBeInTheDocument();
  });

  it('should render author avatar with initial', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render read more button', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);

    expect(screen.getByText('Devamını Oku')).toBeInTheDocument();
  });

  it('should render bookmark button', () => {
    render(<PostCard post={mockPost} author={mockAuthor} />);

    expect(screen.getByRole('button', { name: /favorilere ekle/i })).toBeInTheDocument();
  });

  it('should handle missing author', () => {
    render(<PostCard post={mockPost} author={null} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('should show local badge for local posts', () => {
    const localPost = { ...mockPost, id: 'local-123', createdBy: 'test-user' };
    render(<PostCard post={localPost} author={mockAuthor} />, {
      preloadedState: {
        user: {
          user: { id: 'test-user' },
          session: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'user',
        },
      },
    });

    expect(screen.getByText('Yazılarım')).toBeInTheDocument();
  });

  it('should return null for missing post', () => {
    const { container } = render(<PostCard post={null} author={mockAuthor} />);

    expect(container.firstChild).toBeNull();
  });
});

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import postService from '../services/postService';
import { useCreatePost, useDeletePost, useUpdatePost } from './usePosts';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({
      'errors.postCreateFailed': 'Post could not be created',
      'errors.postUpdateFailed': 'Post could not be updated',
      'errors.postDeleteFailed': 'Post could not be deleted',
    }[key] || key),
    i18n: { language: 'en' },
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../services/postService', () => ({
  default: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const wrapper = ({ children }) => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

describe('post mutation feedback', () => {
  beforeEach(() => vi.clearAllMocks());


  it('uses a post error fallback when create fails without a message', async () => {
    postService.create.mockRejectedValueOnce(new Error(''));
    const { result } = renderHook(() => useCreatePost(), { wrapper });

    await expect(result.current.mutateAsync({ title: 'Draft' })).rejects.toThrow();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Post could not be created'));
  });

  it('uses an error fallback when update fails without a message', async () => {
    postService.update.mockRejectedValueOnce(new Error(''));
    const { result } = renderHook(() => useUpdatePost(), { wrapper });

    await expect(result.current.mutateAsync({ id: 'post-1', data: {} })).rejects.toThrow();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Post could not be updated'));
  });

  it('uses an error fallback when delete fails without a message', async () => {
    postService.delete.mockRejectedValueOnce(new Error(''));
    const { result } = renderHook(() => useDeletePost(), { wrapper });

    await expect(result.current.mutateAsync('post-1')).rejects.toThrow();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Post could not be deleted'));
  });
});

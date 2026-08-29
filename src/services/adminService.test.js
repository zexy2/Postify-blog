import { describe, expect, it } from 'vitest';
import { buildAdminDashboardStats, enrichAdminPosts } from './adminService';

describe('adminService presentation contracts', () => {
  it('builds complete dashboard metrics and keeps the newest five profiles', () => {
    const profiles = [
      { id: '1', role: 'admin' },
      { id: '2', role: 'moderator' },
      { id: '3', role: 'user' },
      { id: '4', role: 'user' },
      { id: '5', role: 'admin' },
      { id: '6', role: 'user' },
    ];

    expect(buildAdminDashboardStats(profiles, { posts: 8, comments: 13 })).toEqual({
      totalUsers: 6,
      totalPosts: 8,
      totalComments: 13,
      adminCount: 2,
      moderatorCount: 1,
      recentUsers: profiles.slice(0, 5),
    });
  });

  it('enriches moderation rows with a readable author instead of falling back to Anonim', () => {
    const [post] = enrichAdminPosts([
      { id: 'p1', author_id: 'u1', is_published: true, created_at: '2026-08-29T10:00:00Z' },
    ], [
      { id: 'u1', full_name: 'Semanur', username: 'semanur', email: 's@example.com' },
    ]);

    expect(post.author).toBe('Semanur');
    expect(post.isPublished).toBe(true);
    expect(post.createdAt).toBe('2026-08-29T10:00:00Z');
  });
});

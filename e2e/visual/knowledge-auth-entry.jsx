import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeDashboardPage from '../../src/pages/KnowledgeDashboardPage/KnowledgeDashboardPage';
import '../../src/lib/i18n';
import '../../src/index.css';

const data = {
  posts: [
    {
      id: 'k1', slug: 'node-json-dogrulama', title: 'Node.js doğrulama akışını tekrar üretilebilir hale getir', category: 'Backend',
      evidence_status: 'author-tested', tested_at: '2026-08-20T10:00:00Z', stale_after_days: 60,
      environment: ['Node 24', 'Ubuntu 22.04'], verification_steps: ['Run the parser and verify the expected assertion output.'],
      summary: { worked_count: 8, failed_count: 0 },
    },
    {
      id: 'k2', slug: 'frontend-performansi', title: 'Frontend performans kararlarını ölçülebilir kaydet', category: 'Frontend',
      evidence_status: 'author-tested', tested_at: '2026-05-15T10:00:00Z', stale_after_days: 90,
      environment: ['Chromium 151', 'React 19'], verification_steps: ['Capture the bundle budget and compare the production route timings.'],
      summary: { worked_count: 5, failed_count: 0 },
    },
    {
      id: 'k3', slug: 'urun-telemetrisi', title: 'Ürün telemetrisinde gereksiz sinyalleri ayıkla', category: 'Product',
      evidence_status: 'unverified', tested_at: null, stale_after_days: 120,
      environment: [], verification_steps: [], summary: { worked_count: 0, failed_count: 0 },
    },
  ],
  gaps: [
    { id: 'g1', display_query: 'Supabase RLS migration kontrol listesi', request_count: 14, last_requested_at: '2026-08-29T08:00:00Z' },
    { id: 'g2', display_query: 'Vite production bundle bütçesi', request_count: 9, last_requested_at: '2026-08-28T08:00:00Z' },
    { id: 'g3', display_query: 'Playwright visual regression düzeni', request_count: 6, last_requested_at: '2026-08-27T08:00:00Z' },
  ],
};

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const reverify = { isPending: false, mutate: () => {} };

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/knowledge']}>
      <KnowledgeDashboardPage dataOverride={data} backendReadyOverride reverifyOverride={reverify} />
    </MemoryRouter>
  </QueryClientProvider>,
);

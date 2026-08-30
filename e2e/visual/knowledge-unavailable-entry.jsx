import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeDashboardPage from '../../src/pages/KnowledgeDashboardPage/KnowledgeDashboardPage';
import '../../src/lib/i18n';
import '../../src/index.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/knowledge']}>
      <KnowledgeDashboardPage dataOverride={{ posts: [], gaps: [] }} backendReadyOverride={false} />
    </MemoryRouter>
  </QueryClientProvider>,
);

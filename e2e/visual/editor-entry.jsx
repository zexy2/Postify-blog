import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreatePostPage from '../../src/pages/CreatePostPage';
import { store } from '../../src/store';
import '../../src/lib/i18n';
import '../../src/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/posts/create']}>
        <CreatePostPage />
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>,
);

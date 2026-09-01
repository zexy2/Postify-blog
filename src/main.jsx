/**
 * Application Entry Point
 * Configured with all providers
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import App from './App';
import SystemStatus from './components/SystemStatus';
import { store, persistor } from './store';
import { queryClient } from './lib/queryClient';
import SmoothScrollProvider from './providers/SmoothScrollProvider';
import './lib/i18n'; // Initialize i18n
import './index.css';

// Keep bootstrap hydration in the same editorial system-state language as route transitions.
const LoadingScreen = () => <SystemStatus eyebrow="POSTIFY / LOADING" loading fullPage />;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <SmoothScrollProvider>
                <App />
              </SmoothScrollProvider>
              <Toaster
                position="bottom-right"
                containerStyle={{ bottom: 'var(--toast-bottom-offset, 1rem)' }}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: 'white',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: 'white',
                    },
                  },
                }}
              />
            </BrowserRouter>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

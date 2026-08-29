import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from '../../src/components/ErrorBoundary/ErrorBoundary';
import '../../src/lib/i18n';
import '../../src/index.css';

const BrokenSurface = () => {
  throw new Error('Deterministic visual boundary failure');
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrokenSurface />
  </ErrorBoundary>,
);

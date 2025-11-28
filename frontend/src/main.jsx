import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const page = rootElement.dataset.page || window.__PCWL_PAGE__ || 'home';
  const root = createRoot(rootElement);
  root.render(<App page={page} />);
} else {
  console.error('PCWL: #root element not found; React app not mounted.');
}

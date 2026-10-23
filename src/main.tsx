import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';
import { getAccessToken, getRefreshToken, setAuthTokens } from './api/client';

async function bootstrap() {
  if (import.meta.env.VITE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  // Seed a default session token in browser preview if none exists so the preview loads ready-to-explore
  if (typeof window !== 'undefined' && !getAccessToken() && !getRefreshToken()) {
    setAuthTokens('preview-demo-access-token', 'preview-demo-refresh-token');
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();

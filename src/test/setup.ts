import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';
import { clearAuthState } from '../api/client';
import { resetRefreshCallCount, resetMockDraftAnswers } from '../mocks/handlers';
import '../i18n';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  clearAuthState();
  resetRefreshCallCount();
  resetMockDraftAnswers();
});

afterAll(() => {
  server.close();
});

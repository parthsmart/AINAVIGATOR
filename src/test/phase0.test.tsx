import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { server } from '../mocks/server';
import { getRefreshCallCount } from '../mocks/handlers';
import {
  apiRequest,
  setAuthTokens,
  getAccessToken,
  getRefreshToken,
} from '../api/client';
import { usePollAiStatus } from '../hooks/usePollAiStatus';
import { isSafeHttpUrl } from '../utils/security';
import { PreferencesProvider } from '../context/PreferencesContext';
import { AuthProvider } from '../context/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import {
  Chip,
  EmptyState,
  ErrorState,
  HonestFactDisplay,
  OfflineBanner,
  ScoreRing,
  Skeleton,
} from '../components/ui/primitives';

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <PreferencesProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </PreferencesProvider>
  );
}

describe('Phase 0 Foundation & Security Invariants', () => {
  it('1. Single-flight token refresh: 5 parallel 401 requests trigger exactly 1 refresh call and succeed on single retry', async () => {
    setAuthTokens('expired-access-token', 'valid-refresh-token');

    let protectedCallCount = 0;
    server.use(
      http.get('*/v1/profile', ({ request }) => {
        protectedCallCount += 1;
        const auth = request.headers.get('Authorization');
        if (auth === 'Bearer expired-access-token') {
          return HttpResponse.json(
            { error: { code: 'TOKEN_EXPIRED', message: 'Access token expired' } },
            { status: 401 }
          );
        }
        return HttpResponse.json({
          user_id: 'u1',
          full_name: 'Alex Chen',
          grade_level: 'College',
          budget_level: 'medium',
          hours_per_week: 15,
          timezone: 'Asia/Kolkata',
        });
      })
    );

    const results = await Promise.all([
      apiRequest('/v1/profile'),
      apiRequest('/v1/profile'),
      apiRequest('/v1/profile'),
      apiRequest('/v1/profile'),
      apiRequest('/v1/profile'),
    ]);

    expect(results).toHaveLength(5);
    expect(getRefreshCallCount()).toBe(1);
    expect(protectedCallCount).toBe(10); // 5 initial 401s + 5 single retries
    expect(getAccessToken()).toBe('rotated-access-token-1');
    expect(getRefreshToken()).toBe('rotated-refresh-token-1');
  });

  it('2. Refresh failure clears auth state and never loops indefinitely', async () => {
    setAuthTokens('expired-token', 'revoked-refresh-token');

    let resourceCalls = 0;
    server.use(
      http.get('*/v1/profile', () => {
        resourceCalls += 1;
        return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
      }),
      http.post('*/v1/auth/refresh', () => {
        return HttpResponse.json({ error: { code: 'TOKEN_REVOKED', message: 'Token family revoked' } }, { status: 401 });
      })
    );

    await expect(apiRequest('/v1/profile')).rejects.toMatchObject({ status: 401 });
    expect(resourceCalls).toBe(1);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('3. Form validation & server 422 field errors map onto form inputs and 429 Retry-After disables submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignupPage enableParentalConsentFlag={true} />);

    // Verify feature-flagged parental consent step renders when flag is enabled
    expect(screen.getByTestId('parental-consent-placeholder')).toBeInTheDocument();

    // Trigger client-side validation errors
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    await user.click(submitBtn);
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();

    // Test server 422 field error mapping
    server.use(
      http.post('*/v1/auth/signup', () => {
        return HttpResponse.json(
          {
            detail: [{ loc: ['body', 'email'], msg: 'Institutional domain required for this cohort' }],
          },
          { status: 422 }
        );
      })
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'student@example.edu.in');
    await user.clear(passwordInput);
    await user.type(passwordInput, 'StrongPass123!');
    await user.click(submitBtn);

    expect(await screen.findByText('Institutional domain required for this cohort')).toBeInTheDocument();
  });

  it('4. 429 Too Many Requests displays Retry-After countdown and disables control', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/v1/auth/forgot-password', () => {
        return HttpResponse.json(
          { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
          {
            status: 429,
            headers: { 'Retry-After': '45' },
          }
        );
      })
    );

    renderWithProviders(<ForgotPasswordPage />);
    await user.type(screen.getByLabelText(/email address/i), 'student@example.edu.in');
    const btn = screen.getByRole('button', { name: /send reset instructions/i });
    await user.click(btn);

    await waitFor(() => {
      expect(btn).toBeDisabled();
      expect(btn).toHaveTextContent(/45s/i);
    });
  });

  it('5. Component loading, empty, error (with retry), and offline states work accurately', async () => {
    const retrySpy = vi.fn();
    render(
      <div>
        <Skeleton lines={2} />
        <EmptyState description="No saved careers yet" actionLabel="Explore" onAction={retrySpy} />
        <ErrorState message="Server temporarily unreachable" onRetry={retrySpy} />
        <OfflineBanner isOffline={true} />
        <ScoreRing score={88} label="Overall Match" breakdown={{ Investigative: 92 }} />
        <HonestFactDisplay label="Cutoff Rank" value={null} />
      </div>
    );

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    expect(screen.getByText('No saved careers yet')).toBeInTheDocument();
    expect(screen.getByText('Server temporarily unreachable')).toBeInTheDocument();
    expect(screen.getByText(/you are currently offline/i)).toBeInTheDocument();
    expect(screen.getByText(/guidance, not a diagnosis/i)).toBeInTheDocument();
    expect(screen.getByText(/not verified yet/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('6. Pending-then-ready AI polling transitions cleanly and shows fallback note when AI is unavailable', async () => {
    let calls = 0;
    const TestPoller: React.FC<{ forceFallback?: boolean }> = ({ forceFallback }) => {
      const { status, text } = usePollAiStatus({
        initialStatus: 'pending',
        initialText: 'Initial placeholder',
        fallbackText: 'Deterministic fallback explanation',
        baseIntervalMs: 10,
        maxAttempts: 2,
        pollFn: async () => {
          calls += 1;
          if (forceFallback) {
            return { status: 'fallback', text: 'Deterministic fallback explanation' };
          }
          return { status: 'ready', text: 'Personalized AI explanation ready' };
        },
      });
      return (
        <div>
          <span data-testid="ai-status">{status}</span>
          <span data-testid="ai-text">{text}</span>
        </div>
      );
    };

    const { unmount } = render(<TestPoller />);
    expect(screen.getByTestId('ai-status')).toHaveTextContent('pending');

    await waitFor(() => {
      expect(screen.getByTestId('ai-status')).toHaveTextContent('ready');
      expect(screen.getByTestId('ai-text')).toHaveTextContent('Personalized AI explanation ready');
    });
    expect(calls).toBeGreaterThanOrEqual(1);
    unmount();

    render(<TestPoller forceFallback={true} />);
    await waitFor(() => {
      expect(screen.getByTestId('ai-status')).toHaveTextContent('fallback');
      expect(screen.getByTestId('ai-text')).toHaveTextContent('Deterministic fallback explanation');
    });
  });

  it('7. XSS defense: renders "<img src=x onerror=alert(1)>" strictly as plain text and rejects unsafe URLs', async () => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    server.use(
      http.get('*/v1/profile', () => {
        return HttpResponse.json({
          user_id: 'u1',
          full_name: xssPayload,
          grade_level: xssPayload,
          budget_level: 'medium',
          hours_per_week: 15,
          timezone: 'Asia/Kolkata',
        });
      })
    );

    const { container } = renderWithProviders(
      <div>
        <DashboardPage />
        <Chip label={xssPayload} href="javascript:alert(1)" />
      </div>
    );

    await waitFor(() => {
      expect(
        screen.getAllByText((content) => content.includes(xssPayload)).length
      ).toBeGreaterThan(0);
    });

    // Ensure zero executable <img> or <script> tags were injected into the DOM
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelectorAll('a[href^="javascript:"]')).toHaveLength(0);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeHttpUrl('https://swayam.gov.in')).toBe(true);
  });

  it('8. Login screen authenticates and handles 401 friendly error message', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid@example.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /your session has expired or credentials were invalid/i
    );
  });
});

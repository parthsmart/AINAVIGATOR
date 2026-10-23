import type { paths, components } from './schema';

export type ApiSchemas = components['schemas'];

const REFRESH_STORAGE_KEY = 'cn_refresh_token';
const AUTH_CHANNEL_NAME = 'cn_auth_channel';

// Access token lives strictly in memory (never persisted to storage)
let accessTokenMemory: string | null = null;
// Single-flight promise shared across concurrent requests in the same tab
let activeRefreshPromise: Promise<boolean> | null = null;

type AuthListener = (isAuthenticated: boolean) => void;
const authListeners = new Set<AuthListener>();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      const data = event.data;
      if (data?.type === 'TOKENS_ROTATED' && data.accessToken && data.refreshToken) {
        accessTokenMemory = data.accessToken;
        try {
          localStorage.setItem(REFRESH_STORAGE_KEY, data.refreshToken);
        } catch {
          // Ignore storage quota errors
        }
        notifyAuthListeners(true);
      } else if (data?.type === 'SESSION_CLEARED') {
        accessTokenMemory = null;
        try {
          localStorage.removeItem(REFRESH_STORAGE_KEY);
        } catch {
          // Ignore storage errors
        }
        notifyAuthListeners(false);
      }
    };
  } catch {
    broadcastChannel = null;
  }
}

function notifyAuthListeners(isAuthenticated: boolean) {
  authListeners.forEach((listener) => listener(isAuthenticated));
}

export function subscribeAuthState(listener: AuthListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  accessTokenMemory = accessToken;
  try {
    // Refresh token stored in one single place only
    localStorage.setItem(REFRESH_STORAGE_KEY, refreshToken);
  } catch {
    // Ignore storage errors
  }
  broadcastChannel?.postMessage({
    type: 'TOKENS_ROTATED',
    accessToken,
    refreshToken,
  });
  notifyAuthListeners(true);
}

export function getAccessToken(): string | null {
  return accessTokenMemory;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearAuthState() {
  accessTokenMemory = null;
  try {
    localStorage.removeItem(REFRESH_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  broadcastChannel?.postMessage({ type: 'SESSION_CLEARED' });
  notifyAuthListeners(false);
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly fieldErrors: Record<string, string>;
  public readonly retryAfterSeconds: number | null;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
    retryAfterSeconds?: number | null;
  }) {
    super(params.message);
    this.name = 'ApiClientError';
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors ?? {};
    this.retryAfterSeconds = params.retryAfterSeconds ?? null;
  }
}

function getBaseUrl(): string {
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
      ? String(import.meta.env.VITE_API_BASE_URL)
      : '';
  return envUrl.replace(/\/$/, '');
}

async function executeRefreshSingleFlight(): Promise<boolean> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  const runRefresh = async (): Promise<boolean> => {
    const currentRefresh = getRefreshToken();
    if (!currentRefresh) {
      clearAuthState();
      return false;
    }

    try {
      const response = await fetch(`${getBaseUrl()}/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: currentRefresh }),
      });

      if (!response.ok) {
        clearAuthState();
        return false;
      }

      const data = (await response.json()) as ApiSchemas['TokenResponse'];
      if (!data.access_token || !data.refresh_token) {
        clearAuthState();
        return false;
      }

      setAuthTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      clearAuthState();
      return false;
    }
  };

  const lockWrapper = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      return navigator.locks.request('cn_single_flight_refresh_lock', async () => {
        return runRefresh();
      });
    }
    return runRefresh();
  };

  activeRefreshPromise = lockWrapper().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}

async function parseErrorResponse(response: Response): Promise<ApiClientError> {
  const retryHeader = response.headers.get('Retry-After');
  const retryAfterSeconds = retryHeader ? Math.max(1, parseInt(retryHeader, 10) || 30) : response.status === 429 ? 30 : null;

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const fieldErrors: Record<string, string> = {};
  if (response.status === 422) {
    if (Array.isArray(body?.detail)) {
      for (const item of body.detail) {
        const loc = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1]) : 'form';
        fieldErrors[loc] = String(item.msg || 'Invalid value');
      }
    } else if (body?.error?.fields && typeof body.error.fields === 'object') {
      Object.assign(fieldErrors, body.error.fields);
    }
  }

  const code = body?.error?.code || (
    response.status === 401
      ? 'UNAUTHORIZED'
      : response.status === 404
      ? 'NOT_FOUND'
      : response.status === 409
      ? 'CONFLICT'
      : response.status === 422
      ? 'VALIDATION_ERROR'
      : response.status === 429
      ? 'RATE_LIMITED'
      : 'API_ERROR'
  );

  const message =
    body?.error?.message ||
    (typeof body?.detail === 'string' ? body.detail : null) ||
    `Request failed with status ${response.status}`;

  return new ApiClientError({
    status: response.status,
    code,
    message,
    fieldErrors,
    retryAfterSeconds,
  });
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean;
  _retried?: boolean;
}

export async function apiRequest<TResponse = unknown>(
  path: keyof paths | string,
  options: RequestOptions = {}
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, skipAuthRefresh = false, _retried = false } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (accessTokenMemory) {
    requestHeaders['Authorization'] = `Bearer ${accessTokenMemory}`;
  }

  const url = `${getBaseUrl()}${String(path)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiClientError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network error',
    });
  }

  // Handle 401 with single-flight token refresh & single retry (never loops)
  const isAuthEndpoint =
    String(path).includes('/v1/auth/login') ||
    String(path).includes('/v1/auth/signup') ||
    String(path).includes('/v1/auth/refresh');

  if (response.status === 401 && !skipAuthRefresh && !isAuthEndpoint && !_retried) {
    const refreshed = await executeRefreshSingleFlight();
    if (refreshed) {
      return apiRequest<TResponse>(path, {
        ...options,
        _retried: true,
      });
    }
    throw await parseErrorResponse(response);
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return (await response.json()) as TResponse;
}

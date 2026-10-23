import { ApiClientError } from '../api/client';
import type { TFunction } from 'i18next';

export function isSafeHttpUrl(rawUrl: string | null | undefined): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getFriendlyErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return t('errors.unauthorized');
    if (error.status === 404) return t('errors.notFound');
    if (error.status === 409) return t('errors.conflict');
    if (error.status === 422) return t('errors.validation');
    if (error.status === 429) {
      return t('errors.rateLimit', { seconds: error.retryAfterSeconds ?? 30 });
    }
    if (error.status === 0) return t('errors.network');
    return error.message || t('errors.unexpected');
  }
  return t('errors.unexpected');
}

import { API_BASE_URL } from '@/config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAccessExpired,
  saveTokens,
} from '@/auth/tokenStorage';

import type { TokenPair } from './types';

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public details?: string[]
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return null;

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await clearTokens();
        return null;
      }

      const pair = (await res.json()) as TokenPair;
      await saveTokens(pair.accessToken, pair.refreshToken, pair.expiresIn);
      return pair.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function ensureAccess(): Promise<string | null> {
  if (!(await isAccessExpired())) {
    return getAccessToken();
  }
  return refreshAccess();
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const h = new Headers(headers);
  h.set('Accept', 'application/json');
  if (rest.body && !h.has('Content-Type')) {
    h.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = await ensureAccess();
    if (!token) throw new ApiError(401, 'Не авторизовано');
    h.set('Authorization', `Bearer ${token}`);
  }

  let res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: h });

  if (res.status === 401 && auth) {
    const token = await refreshAccess();
    if (!token) throw new ApiError(401, 'Сесія закінчилась');
    h.set('Authorization', `Bearer ${token}`);
    res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: h });
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: { detail?: unknown; title?: unknown; message?: unknown; details?: string[] } | undefined;
  if (text) {
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      data = undefined;
    }
  }

  if (!res.ok) {
    const detail = [data?.detail, data?.title, data?.message, text, res.statusText]
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .find(Boolean);
    throw new ApiError(res.status, detail || `HTTP ${res.status}`, data?.details);
  }

  return data as T;
}

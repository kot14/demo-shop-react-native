import { clearTokens, getRefreshToken, saveTokens } from '@/auth/tokenStorage';

import { api } from './client';
import type { TokenPair } from './types';

export async function register(email: string, password: string, fullName: string) {
  await api<void>('/auth/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password, fullName }),
  });
}

export async function login(email: string, password: string) {
  const pair = await api<TokenPair>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  await saveTokens(pair.accessToken, pair.refreshToken, pair.expiresIn);
  return pair;
}

export async function logout() {
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) {
      await api<void>('/auth/logout', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    await clearTokens();
  }
}

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';
const EXPIRES_AT = 'accessExpiresAt'; // epoch ms

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveTokens(access: string, refresh: string, expiresInSec: number) {
  await setItem(ACCESS, access);
  await setItem(REFRESH, refresh);
  await setItem(EXPIRES_AT, String(Date.now() + expiresInSec * 1000));
}

export async function clearTokens() {
  await deleteItem(ACCESS);
  await deleteItem(REFRESH);
  await deleteItem(EXPIRES_AT);
}

export async function getAccessToken() {
  return getItem(ACCESS);
}

export async function getRefreshToken() {
  return getItem(REFRESH);
}

export async function isAccessExpired(skewMs = 30_000) {
  const raw = await getItem(EXPIRES_AT);
  if (!raw) return true;
  return Date.now() >= Number(raw) - skewMs;
}

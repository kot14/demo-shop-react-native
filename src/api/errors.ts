import { ApiError } from './client';

export function errorMessage(error: unknown, fallback = 'Щось пішло не так') {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return 'Забагато спроб входу. Спробуйте через хвилину.';
    }
    if (error.details?.length) {
      return error.details.join('\n');
    }
    if (typeof error.detail === 'string' && error.detail.trim()) {
      return error.detail;
    }
    return fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function authErrorMessage(error: unknown, fallback = 'Не вдалося увійти') {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return 'Невірний email або пароль';
  }
  return errorMessage(error, fallback);
}

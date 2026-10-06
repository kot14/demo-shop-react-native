import { api } from './client';
import type { CartView } from './types';

export const getCart = () => api<CartView>('/cart');

export const addToCart = (productId: number, quantity: number) =>
  api<CartView>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

/** quantity = 0 видаляє позицію */
export const setCartItemQuantity = (productId: number, quantity: number) =>
  api<CartView>(`/cart/items/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (productId: number) =>
  api<CartView>(`/cart/items/${productId}`, { method: 'DELETE' });

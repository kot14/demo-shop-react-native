import { getCart } from './cart';
import { api } from './client';
import type { OrderView } from './types';

export const placeOrder = (lines: { productId: number; quantity: number }[]) =>
  api<{ orderId: number }>('/orders', {
    method: 'POST',
    body: JSON.stringify({ lines }),
  });

export const myOrders = () => api<OrderView[]>('/orders/my');

export const getOrder = (id: number) => api<OrderView>(`/orders/${id}`);

export async function checkoutFromCart() {
  const cart = await getCart();
  if (!cart.items.length) throw new Error('Кошик порожній');
  return placeOrder(
    cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }))
  );
}

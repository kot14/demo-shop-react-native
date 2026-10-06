import { api } from './client';
import type { Product } from './types';

let cachedList: Product[] | null = null;
let listInflight: Promise<Product[]> | null = null;

export async function listProducts(options?: { force?: boolean }) {
  if (!options?.force && cachedList) {
    return cachedList;
  }
  if (!listInflight) {
    listInflight = api<Product[]>('/products', { auth: false })
      .then((data) => {
        cachedList = data;
        return data;
      })
      .finally(() => {
        listInflight = null;
      });
  }
  return listInflight;
}

export const getProduct = (id: number) => api<Product>(`/products/${id}`, { auth: false });

export const createProduct = (body: {
  sku: string;
  name: string;
  description?: string;
  priceMinor: number;
  stock: number;
}) => api<Product>('/products', { method: 'POST', body: JSON.stringify(body) });

export const updateProduct = (
  id: number,
  body: {
    name: string;
    description?: string;
    priceMinor: number;
    stock: number;
    active: boolean;
  }
) => api<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteProduct = (id: number) =>
  api<void>(`/products/${id}`, { method: 'DELETE' });

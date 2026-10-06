export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // секунди
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  priceMinor: number;
  stock: number;
  active: boolean;
};

export type CartLine = {
  productId: number;
  quantity: number;
};

export type CartView = {
  customerId: number;
  items: CartLine[];
};

export type OrderStatus = 'NEW' | 'PAID' | 'CANCELLED';

export type OrderItemView = {
  productId: number;
  productName: string;
  unitPriceMinor: number;
  quantity: number;
};

export type OrderView = {
  id: number;
  customerId: number;
  status: OrderStatus;
  totalMinor: number;
  createdAt: string;
  paidAt: string | null;
  items: OrderItemView[];
};

/** RFC 7807 ProblemDetail */
export type ProblemDetail = {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  details?: string[];
};

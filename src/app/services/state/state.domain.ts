import { Order } from '../api.domain';

export type Quote = {
  symbol: string;
  bid: number;
};

export type QuotesMap = ReadonlyMap<string, number>;

export type ContractSizeMap = ReadonlyMap<string, number>;

export type OrderRow = Order & {
  profit: number | undefined;
};

export type OrderGroup = {
  symbol: string;
  count: number;
  size: number;
  swap: number;
  avgOpenPrice: number;
  profit: number | undefined;
  orders: OrderRow[];
};

export type NewOrder = Omit<Order, 'id'>;

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

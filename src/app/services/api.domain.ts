export type OrderSide = 'BUY' | 'SELL';

export type Order = {
  id: number;
  symbol: string;
  side: OrderSide;
  size: number;
  openPrice: number;
  openTime: number;
  swap: number;
};

export type Instrument = {
  symbol: string;
  contractType: number;
};

export type ContractType = {
  contractType: number;
  contractSize: number;
};

export type OrdersResponse = {
  data: Order[];
};

export type MarketData = {
  orders: Order[];
  instruments: Instrument[];
  contractTypes: ContractType[];
};

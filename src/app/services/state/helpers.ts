import { ContractType, Instrument, Order } from '../api.domain';
import { ContractSizeMap, OrderGroup, OrderRow } from './state.domain';

export function calculateProfit(order: Order, bid: number, contractSize: number): number {
  const sideMultiplier = order.side === 'BUY' ? 1 : -1;
  return (bid - order.openPrice) * order.size * contractSize * sideMultiplier;
}

export function toOrderRow(order: Order, bid: number | undefined, contractSize: number | undefined): OrderRow {
  const profit =
    bid === undefined || contractSize === undefined
      ? undefined
      : calculateProfit(order, bid, contractSize);
  return { ...order, profit };
}

export function toOrderGroup(symbol: string, orders: OrderRow[]): OrderGroup {
  const priced = orders.filter((row) => row.profit !== undefined);
  return {
    symbol,
    count: orders.length,
    size: sum(orders.map((row) => row.size)),
    swap: sum(orders.map((row) => row.swap)),
    avgOpenPrice: sum(orders.map((row) => row.openPrice)) / orders.length,
    profit: priced.length === 0 ? undefined : sum(priced.map((row) => row.profit ?? 0)),
    orders,
  };
}

export function buildContractSizeMap(
  instruments: readonly Instrument[],
  contractTypes: readonly ContractType[],
): ContractSizeMap {
  const sizeByType = new Map(contractTypes.map((ct) => [ct.contractType, ct.contractSize]));
  const result = new Map<string, number>();
  for (const instrument of instruments) {
    const size = sizeByType.get(instrument.contractType);
    if (size !== undefined) {
      result.set(instrument.symbol, size);
    }
  }
  return result;
}

export function nextOrderId(orders: Order[]): number {
  return orders.reduce((max, order) => Math.max(max, order.id), 0) + 1;
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

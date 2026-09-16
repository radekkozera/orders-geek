import { Injectable, computed, inject, signal } from '@angular/core';

import { ContractType, Instrument, Order } from '../api.domain';
import { ApiService } from '../api/api.service';
import { buildContractSizeMap, nextOrderId, toOrderGroup, toOrderRow } from './helpers';
import {
  ContractSizeMap,
  LoadStatus,
  NewOrder,
  OrderGroup,
  OrderRow,
  Quote,
  QuotesMap,
} from './state.domain';

@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly api = inject(ApiService);

  private readonly _orders = signal<Order[]>([]);
  private readonly _quotes = signal<QuotesMap>(new Map());
  private readonly _contractSizes = signal<ContractSizeMap>(new Map());
  private readonly _status = signal<LoadStatus>('idle');
  private readonly _error = signal<string | undefined>(undefined);

  public readonly orders = this._orders.asReadonly();
  public readonly quotes = this._quotes.asReadonly();
  public readonly status = this._status.asReadonly();
  public readonly error = this._error.asReadonly();

  public readonly symbols = computed<string[]>(() =>
    Array.from(new Set(this._orders().map((order) => order.symbol))),
  );

  public readonly groups = computed<OrderGroup[]>(() => {
    const quotes = this._quotes();
    const contractSizes = this._contractSizes();
    const bySymbol = new Map<string, OrderRow[]>();

    for (const order of this._orders()) {
      const row = toOrderRow(order, quotes.get(order.symbol), contractSizes.get(order.symbol));
      bySymbol.set(order.symbol, [...(bySymbol.get(order.symbol) ?? []), row]);
    }

    return Array.from(bySymbol, ([symbol, rows]) => toOrderGroup(symbol, rows));
  });

  public load(): void {
    this._status.set('loading');
    this._error.set(undefined);

    this.api.getMarketData().subscribe({
      next: ({ orders, instruments, contractTypes }) => {
        this._orders.set(orders);
        this._contractSizes.set(buildContractSizeMap(instruments, contractTypes));
        this._status.set('ready');
      },
      error: (err: unknown) => {
        this._error.set(err instanceof Error ? err.message : 'Failed to load market data');
        this._status.set('error');
      },
    });
  }

  public updateQuotes(quotes: readonly Quote[]): void {
    if (quotes.length === 0) {
      return;
    }
    this._quotes.update((prev) => {
      const next = new Map(prev);
      for (const quote of quotes) {
        next.set(quote.symbol, quote.bid);
      }
      return next;
    });
  }

  public addOrder(order: NewOrder): Order {
    const id = nextOrderId(this._orders());
    const created: Order = { ...order, id };
    this._orders.update((orders) => [...orders, created]);
    return created;
  }

  public removeOrder(id: number): number | undefined {
    const exists = this._orders().some((order) => order.id === id);
    if (!exists) {
      return undefined;
    }
    this._orders.update((orders) => orders.filter((order) => order.id !== id));
    return id;
  }

  public removeGroup(symbol: string): number[] {
    const closedIds = this._orders()
      .filter((order) => order.symbol === symbol)
      .map((order) => order.id);
    if (closedIds.length === 0) {
      return [];
    }
    this._orders.update((orders) => orders.filter((order) => order.symbol !== symbol));
    return closedIds;
  }
}

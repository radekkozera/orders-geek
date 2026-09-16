import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';

import { MarketData, Order } from '../api.domain';
import { ApiService } from '../api/api.service';
import { StateService } from './state.service';

const ORDERS: Order[] = [
  { id: 10, symbol: 'BTCUSD', side: 'BUY', size: 0.1, openPrice: 100, openTime: 1, swap: -1 },
  { id: 11, symbol: 'ETHUSD', side: 'SELL', size: 2, openPrice: 10, openTime: 2, swap: 0.5 },
  { id: 12, symbol: 'BTCUSD', side: 'SELL', size: 0.3, openPrice: 200, openTime: 3, swap: -2 },
];

const MARKET_DATA: MarketData = {
  orders: ORDERS,
  instruments: [
    { symbol: 'BTCUSD', contractType: 0 },
    { symbol: 'ETHUSD', contractType: 3 },
    { symbol: 'ORPHAN', contractType: 99 },
  ],
  contractTypes: [
    { contractType: 0, contractSize: 1 },
    { contractType: 3, contractSize: 1000 },
  ],
};

describe('StateService', () => {
  let service: StateService;
  let getMarketData: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMarketData = vi.fn(() => of(MARKET_DATA));
    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: { getMarketData } }],
    });
    service = TestBed.inject(StateService);
  });

  describe('initial state', () => {
    it('starts idle and empty', () => {
      expect(service.status()).toBe('idle');
      expect(service.error()).toBeUndefined();
      expect(service.orders()).toEqual([]);
      expect(service.groups()).toEqual([]);
      expect(service.symbols()).toEqual([]);
    });
  });

  describe('load', () => {
    it('transitions idle -> loading -> ready', () => {
      const pending = new Subject<MarketData>();
      getMarketData.mockReturnValueOnce(pending);

      service.load();
      expect(service.status()).toBe('loading');

      pending.next(MARKET_DATA);
      pending.complete();
      expect(service.status()).toBe('ready');
      expect(service.orders()).toEqual(ORDERS);
    });

    it('stores an error message and status on failure', () => {
      getMarketData.mockReturnValueOnce(throwError(() => new Error('boom')));

      service.load();

      expect(service.status()).toBe('error');
      expect(service.error()).toBe('boom');
      expect(service.orders()).toEqual([]);
    });

    it('clears a previous error when loading again', () => {
      getMarketData.mockReturnValueOnce(throwError(() => new Error('boom')));
      service.load();
      service.load();

      expect(service.status()).toBe('ready');
      expect(service.error()).toBeUndefined();
    });
  });

  describe('symbols', () => {
    it('returns distinct symbols in first-seen order', () => {
      service.load();
      expect(service.symbols()).toEqual(['BTCUSD', 'ETHUSD']);
    });
  });

  describe('groups', () => {
    beforeEach(() => service.load());

    it('groups orders by symbol preserving first-seen order', () => {
      expect(service.groups().map((g) => g.symbol)).toEqual(['BTCUSD', 'ETHUSD']);
      expect(service.groups()[0]?.orders.map((o) => o.id)).toEqual([10, 12]);
    });

    it('aggregates count, size, swap and average open price', () => {
      const btc = service.groups()[0];
      expect(btc?.count).toBe(2);
      expect(btc?.size).toBeCloseTo(0.4);
      expect(btc?.swap).toBeCloseTo(-3);
      expect(btc?.avgOpenPrice).toBeCloseTo(150);
    });

    it('has undefined profit before any quote arrives', () => {
      const btc = service.groups()[0];
      expect(btc?.profit).toBeUndefined();
      expect(btc?.orders.every((o) => o.profit === undefined)).toBe(true);
    });

    it('computes per-order and group profit once a quote arrives', () => {
      service.updateQuotes([{ symbol: 'BTCUSD', bid: 110 }]);

      const btc = service.groups()[0];
      // BUY: (110-100)*0.1*1 = 1 ; SELL: (110-200)*0.3*1*-1 = 27
      expect(btc?.orders.map((o) => o.profit)).toEqual([1, 27]);
      expect(btc?.profit).toBeCloseTo(28);
    });

    it('applies contract size from the instrument mapping', () => {
      service.updateQuotes([{ symbol: 'ETHUSD', bid: 9 }]);

      const eth = service.groups()[1];
      // SELL: (9-10)*2*1000*-1 = 2000
      expect(eth?.profit).toBeCloseTo(2000);
    });

    it('leaves profit undefined when the symbol has no contract size', () => {
      service.addOrder({ symbol: 'UNKNOWN', side: 'BUY', size: 1, openPrice: 1, openTime: 0, swap: 0 });
      service.updateQuotes([{ symbol: 'UNKNOWN', bid: 2 }]);

      const unknown = service.groups().find((g) => g.symbol === 'UNKNOWN');
      expect(unknown?.profit).toBeUndefined();
    });

    it('recomputes when a newer quote replaces the old one', () => {
      service.updateQuotes([{ symbol: 'BTCUSD', bid: 110 }]);
      service.updateQuotes([{ symbol: 'BTCUSD', bid: 120 }]);

      expect(service.groups()[0]?.orders[0]?.profit).toBeCloseTo(2);
    });
  });

  describe('updateQuotes', () => {
    it('merges quotes for different symbols', () => {
      service.updateQuotes([{ symbol: 'BTCUSD', bid: 1 }]);
      service.updateQuotes([{ symbol: 'ETHUSD', bid: 2 }]);

      expect(service.quotes().get('BTCUSD')).toBe(1);
      expect(service.quotes().get('ETHUSD')).toBe(2);
    });

    it('ignores an empty batch without touching the signal', () => {
      const before = service.quotes();
      service.updateQuotes([]);
      expect(service.quotes()).toBe(before);
    });
  });

  describe('addOrder', () => {
    it('assigns max id + 1 and appends the order', () => {
      service.load();
      const created = service.addOrder({
        symbol: 'ETHUSD', side: 'BUY', size: 1, openPrice: 5, openTime: 9, swap: 0,
      });

      expect(created.id).toBe(13);
      expect(service.orders().at(-1)).toEqual(created);
      expect(service.groups()[1]?.count).toBe(2);
    });

    it('starts ids from 1 on an empty store', () => {
      const created = service.addOrder({
        symbol: 'X', side: 'BUY', size: 1, openPrice: 1, openTime: 0, swap: 0,
      });
      expect(created.id).toBe(1);
    });
  });

  describe('removeOrder', () => {
    beforeEach(() => service.load());

    it('removes the order and returns its id', () => {
      expect(service.removeOrder(10)).toBe(10);
      expect(service.orders().map((o) => o.id)).toEqual([11, 12]);
    });

    it('drops the group when its last order is removed', () => {
      service.removeOrder(11);
      expect(service.groups().map((g) => g.symbol)).toEqual(['BTCUSD']);
      expect(service.symbols()).toEqual(['BTCUSD']);
    });

    it('returns undefined and leaves state untouched for an unknown id', () => {
      const before = service.orders();
      expect(service.removeOrder(999)).toBeUndefined();
      expect(service.orders()).toBe(before);
    });
  });

  describe('removeGroup', () => {
    beforeEach(() => service.load());

    it('removes all orders of the symbol and returns their ids in order', () => {
      expect(service.removeGroup('BTCUSD')).toEqual([10, 12]);
      expect(service.orders().map((o) => o.id)).toEqual([11]);
    });

    it('returns an empty list and leaves state untouched for an unknown symbol', () => {
      const before = service.orders();
      expect(service.removeGroup('NOPE')).toEqual([]);
      expect(service.orders()).toBe(before);
    });
  });
});

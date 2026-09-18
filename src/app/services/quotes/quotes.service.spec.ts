import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { StateService } from '../state/state.service';
import { QuotesService } from './quotes.service';

const RECONNECT_DELAY_MS = 3000;

class FakeWebSocket {
  public static instances: FakeWebSocket[] = [];

  public readyState = 0;
  public sent: unknown[] = [];
  public onopen: ((event: unknown) => void) | null = null;
  public onmessage: ((event: { data: string }) => void) | null = null;
  public onclose: ((event: { wasClean: boolean }) => void) | null = null;

  constructor(public readonly url: string) {
    FakeWebSocket.instances = [...FakeWebSocket.instances, this];
  }

  public send(data: string): void {
    this.sent = [...this.sent, JSON.parse(data)];
  }

  public close(): void {
    this.readyState = 3;
  }

  public open(): void {
    this.readyState = 1;
    this.onopen?.({});
  }

  public receive(message: unknown): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  public drop(): void {
    this.readyState = 3;
    this.onclose?.({ wasClean: false });
  }
}

describe('QuotesService', () => {
  let service: QuotesService;
  let symbols: ReturnType<typeof signal<string[]>>;
  let updateQuotes: ReturnType<typeof vi.fn>;

  const lastSocket = (): FakeWebSocket => FakeWebSocket.instances.at(-1)!;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', FakeWebSocket);
    FakeWebSocket.instances = [];

    symbols = signal<string[]>(['BTCUSD', 'ETHUSD']);
    updateQuotes = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: StateService, useValue: { symbols, updateQuotes } }],
    });
    service = TestBed.inject(QuotesService);
    service.connect();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('opens a single socket', () => {
    service.connect();

    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('subscribes to current symbols when the socket opens', () => {
    lastSocket().open();

    expect(lastSocket().sent).toEqual([{ p: '/subscribe/addlist', d: ['BTCUSD', 'ETHUSD'] }]);
  });

  it('sends only the difference when symbols change', () => {
    lastSocket().open();
    lastSocket().sent = [];

    symbols.set(['ETHUSD', 'XRPUSD']);
    TestBed.tick();

    expect(lastSocket().sent).toEqual([
      { p: '/subscribe/addlist', d: ['XRPUSD'] },
      { p: '/subscribe/removelist', d: ['BTCUSD'] },
    ]);
  });

  it('maps quotes to state updates and ignores other messages', () => {
    lastSocket().open();
    lastSocket().receive({ p: '/other', d: [{ s: 'BTCUSD', b: 1, a: 2, t: 3 }] });
    lastSocket().receive({ p: '/quotes/subscribed' });
    lastSocket().receive({ p: '/quotes/subscribed', d: [{ s: 'BTCUSD', b: 100.5, a: 101, t: 1 }] });

    expect(updateQuotes).toHaveBeenCalledExactlyOnceWith([{ symbol: 'BTCUSD', bid: 100.5 }]);
  });

  it('reconnects after the delay and resubscribes', () => {
    lastSocket().open();
    lastSocket().drop();
    vi.advanceTimersByTime(RECONNECT_DELAY_MS);

    expect(FakeWebSocket.instances).toHaveLength(2);
    lastSocket().open();
    expect(lastSocket().sent).toEqual([{ p: '/subscribe/addlist', d: ['BTCUSD', 'ETHUSD'] }]);
  });
});

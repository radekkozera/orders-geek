import { DestroyRef, Injectable, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { retry } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

import { StateService } from '../state/state.service';

const QUOTES_URL = 'wss://webquotes.geeksoft.pl/websocket/quotes';
const QUOTES_PATH = '/quotes/subscribed';
const RECONNECT_DELAY_MS = 3000;

type QuoteDto = {
  s: string;
  b: number;
  a: number;
  t: number;
};

type SubscriptionRequest = {
  p: '/subscribe/addlist' | '/subscribe/removelist';
  d: string[];
};

type QuotesMessage = {
  p: string;
  d?: QuoteDto[];
};

@Injectable({ providedIn: 'root' })
export class QuotesService {
  private readonly state = inject(StateService);
  private readonly destroyRef = inject(DestroyRef);

  private socket: WebSocketSubject<QuotesMessage | SubscriptionRequest> | undefined;
  private isOpen = false;
  private subscribed = new Set<string>();

  constructor() {
    effect(() => this.syncSubscriptions(this.state.symbols()));
  }

  public connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = webSocket<QuotesMessage | SubscriptionRequest>({
      url: QUOTES_URL,
      openObserver: { next: () => this.onOpen() },
      closeObserver: { next: () => this.onClose() },
    });

    this.socket
      .pipe(retry({ delay: RECONNECT_DELAY_MS }), takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => this.onMessage(message as QuotesMessage));
  }

  private onOpen(): void {
    this.isOpen = true;
    this.syncSubscriptions(this.state.symbols());
  }

  private onClose(): void {
    this.isOpen = false;
    this.subscribed = new Set();
  }

  private onMessage(message: QuotesMessage): void {
    if (message.p !== QUOTES_PATH || !message.d) {
      return;
    }
    this.state.updateQuotes(message.d.map((quote) => ({ symbol: quote.s, bid: quote.b })));
  }

  private syncSubscriptions(symbols: string[]): void {
    if (!this.isOpen) {
      return;
    }

    const added = symbols.filter((symbol) => !this.subscribed.has(symbol));
    const removed = [...this.subscribed].filter((symbol) => !symbols.includes(symbol));

    if (added.length > 0) {
      this.socket?.next({ p: '/subscribe/addlist', d: added });
    }
    if (removed.length > 0) {
      this.socket?.next({ p: '/subscribe/removelist', d: removed });
    }
    this.subscribed = new Set(symbols);
  }
}

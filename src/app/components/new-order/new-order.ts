import { Component, effect, inject, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { NewOrder as NewOrderData } from '../../services/state/state.domain';
import { StateService } from '../../services/state/state.service';
import { NewOrderModel, newOrderSchema } from './new-order.schema';

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-new-order',
  styleUrl: './new-order.scss',
  templateUrl: './new-order.html',
})
export class NewOrder {
  private readonly state = inject(StateService);
  private readonly router = inject(Router);

  protected readonly symbols = this.state.symbols;
  protected readonly sides: NewOrderModel['side'][] = ['BUY', 'SELL'];

  protected readonly model = signal<NewOrderModel>({
    symbol: '',
    side: 'BUY',
    size: null,
    openPrice: null,
    openTime: toDateTimeLocal(new Date()),
  });

  protected readonly form = form(this.model, newOrderSchema, {
    submission: { action: () => this.addOrder() },
  });

  constructor() {
    effect(() => this.prefillOpenPrice(this.form.symbol().value()));
  }

  private async addOrder(): Promise<void> {
    const { symbol, side, size, openPrice, openTime } = this.model();
    const order: NewOrderData = {
      symbol,
      side,
      size: size ?? 0,
      openPrice: openPrice ?? 0,
      openTime: new Date(openTime).getTime(),
      swap: 0,
    };

    this.state.addOrder(order);
    await this.router.navigate(['/']);
  }

  private prefillOpenPrice(symbol: string): void {
    const bid = this.state.quotes().get(symbol);
    if (bid !== undefined) {
      this.form.openPrice().value.set(bid);
    }
  }
}

function toDateTimeLocal(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

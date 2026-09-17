import { Component, inject, signal } from '@angular/core';

import { StateService } from '../../services/state/state.service';
import { OrderGroupRow } from '../order-group-row/order-group-row';
import { OrderRow } from '../order-row/order-row';

@Component({
  imports: [OrderGroupRow, OrderRow],
  selector: 'app-main-table',
  styleUrl: './main-table.scss',
  templateUrl: './main-table.html',
})
export class MainTable {
  private readonly state = inject(StateService);

  protected readonly groups = this.state.groups;
  protected readonly expanded = signal<string[]>([]);

  protected onToggle(symbol: string): void {
    this.expanded.update((symbols) =>
      symbols.includes(symbol) ? symbols.filter((s) => s !== symbol) : [...symbols, symbol],
    );
  }

  protected onRemoveOrder(id: number): void {
    this.state.removeOrder(id);
  }

  protected onRemoveGroup(symbol: string): void {
    this.state.removeGroup(symbol);
    this.expanded.update((symbols) => symbols.filter((s) => s !== symbol));
  }
}

import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  private readonly snackBar = inject(MatSnackBar);

  protected readonly groups = this.state.groups;
  protected readonly expanded = signal<string[]>([]);

  protected onToggle(symbol: string): void {
    this.expanded.update((symbols) =>
      symbols.includes(symbol) ? symbols.filter((s) => s !== symbol) : [...symbols, symbol],
    );
  }

  protected onRemoveOrder(id: number): void {
    const closedId = this.state.removeOrder(id);
    if (closedId !== undefined) {
      this.notifyClosed([closedId]);
    }
  }

  protected onRemoveGroup(symbol: string): void {
    const closedIds = this.state.removeGroup(symbol);
    this.expanded.update((symbols) => symbols.filter((s) => s !== symbol));
    if (closedIds.length > 0) {
      this.notifyClosed(closedIds);
    }
  }

  private notifyClosed(ids: number[]): void {
    const label = ids.length === 1 ? 'zlecenie' : 'zlecenia';
    this.snackBar.open(`Zamknięto ${label} nr ${ids.join(', ')}`, 'OK', { duration: 4000 });
  }
}

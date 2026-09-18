import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { OrderGroup } from '../../services/state/state.domain';
import { ProfitPipe } from '../../pipes/profit.pipe';

@Component({
  imports: [DecimalPipe, ProfitPipe],
  selector: 'app-order-group-row',
  styleUrl: './order-group-row.scss',
  templateUrl: './order-group-row.html',
})
export class OrderGroupRow {
  public readonly group = input.required<OrderGroup>();
  public readonly expanded = input(false);
  public readonly remove = output<string>();

  protected onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.group().symbol);
  }
}

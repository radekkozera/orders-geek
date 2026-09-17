import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { OrderRow as OrderRowData } from '../../services/state/state.domain';

@Component({
  imports: [DatePipe],
  selector: 'app-order-row',
  styleUrl: './order-row.scss',
  templateUrl: './order-row.html',
})
export class OrderRow {
  public readonly order = input.required<OrderRowData>();
  public readonly remove = output<number>();

  protected onRemove(): void {
    this.remove.emit(this.order().id);
  }
}

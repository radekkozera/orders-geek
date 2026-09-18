import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { OrderRow as OrderRowData } from '../../services/state/state.domain';
import { ProfitPipe } from '../../pipes/profit.pipe';

@Component({
  imports: [DatePipe, DecimalPipe, ProfitPipe],
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

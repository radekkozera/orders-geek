import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { OrderRow as OrderRowData } from '../../services/state/state.domain';

@Component({
  imports: [DatePipe],
  selector: 'app-order-row',
  styleUrl: './order-row.scss',
  templateUrl: './order-row.html',
})
export class OrderRow {
  public readonly order = input.required<OrderRowData>();
}

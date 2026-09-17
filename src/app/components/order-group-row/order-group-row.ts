import { Component, input } from '@angular/core';

import { OrderGroup } from '../../services/state/state.domain';

@Component({
  host: { role: 'row' },
  selector: 'app-order-group-row',
  styleUrl: './order-group-row.scss',
  templateUrl: './order-group-row.html',
})
export class OrderGroupRow {
  public readonly group = input.required<OrderGroup>();
}

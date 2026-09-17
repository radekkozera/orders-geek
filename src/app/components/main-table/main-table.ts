import { Component, inject } from '@angular/core';

import { StateService } from '../../services/state/state.service';
import { OrderGroupRow } from '../order-group-row/order-group-row';

@Component({
  imports: [OrderGroupRow],
  selector: 'app-main-table',
  styleUrl: './main-table.scss',
  templateUrl: './main-table.html',
})
export class MainTable {
  private readonly state = inject(StateService);

  protected readonly groups = this.state.groups;
}

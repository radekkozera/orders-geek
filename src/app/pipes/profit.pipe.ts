import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'profitClass' })
export class ProfitPipe implements PipeTransform {
  public transform(profit: number | undefined): string {
    if (profit === undefined || profit === 0) {
      return '';
    }
    return profit > 0 ? 'profit-positive' : 'profit-negative';
  }
}

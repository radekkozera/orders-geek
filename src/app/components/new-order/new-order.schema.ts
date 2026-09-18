import { ValidationError, required, schema, validate } from '@angular/forms/signals';

import { OrderSide } from '../../services/api.domain';

export type NewOrderModel = {
  symbol: string;
  side: OrderSide;
  size: number | null;
  openPrice: number | null;
  openTime: string;
};

export const newOrderSchema = schema<NewOrderModel>((path) => {
  required(path.symbol, { message: 'Symbol is required' });
  required(path.size, { message: 'Size is required' });
  required(path.openPrice, { message: 'Open price is required' });
  required(path.openTime, { message: 'Open time is required' });

  validate(path.size, ({ value }) => positiveError(value(), 'Size'));
  validate(path.openPrice, ({ value }) => positiveError(value(), 'Open price'));
});

function positiveError(value: number | null, label: string): ValidationError | undefined {
  if (value === null || value > 0) {
    return undefined;
  }
  return { kind: 'positive', message: `${label} must be greater than 0` };
}

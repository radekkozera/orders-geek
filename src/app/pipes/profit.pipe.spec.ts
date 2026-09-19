import { ProfitPipe } from './profit.pipe';

describe('ProfitPipe', () => {
  const pipe = new ProfitPipe();

  it('returns profit-positive for values above zero', () => {
    expect(pipe.transform(0.0001)).toBe('profit-positive');
    expect(pipe.transform(150)).toBe('profit-positive');
  });

  it('returns profit-negative for values below zero', () => {
    expect(pipe.transform(-0.0001)).toBe('profit-negative');
    expect(pipe.transform(-150)).toBe('profit-negative');
  });

  it('returns an empty class for zero', () => {
    expect(pipe.transform(0)).toBe('');
  });

  it('returns an empty class when profit is unknown', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});

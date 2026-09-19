import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ContractType, Instrument, MarketData, Order } from '../api.domain';
import { ApiService } from './api.service';

const BASE_URL = 'https://geeksoft.pl/assets/2026-task';

const ORDERS: Order[] = [
  { id: 1, symbol: 'BTCUSD', side: 'BUY', size: 0.1, openPrice: 100, openTime: 1, swap: -1 },
];
const INSTRUMENTS: Instrument[] = [{ symbol: 'BTCUSD', contractType: 0 }];
const CONTRACT_TYPES: ContractType[] = [{ contractType: 0, contractSize: 1 }];

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('getOrders unwraps the data field from the response', () => {
    let result: Order[] | undefined;
    service.getOrders().subscribe((orders) => (result = orders));

    const req = http.expectOne(`${BASE_URL}/order-data.json`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: ORDERS });

    expect(result).toEqual(ORDERS);
  });

  it('getInstruments returns the instruments list', () => {
    let result: Instrument[] | undefined;
    service.getInstruments().subscribe((instruments) => (result = instruments));

    http.expectOne(`${BASE_URL}/instruments.json`).flush(INSTRUMENTS);

    expect(result).toEqual(INSTRUMENTS);
  });

  it('getContractTypes returns the contract types list', () => {
    let result: ContractType[] | undefined;
    service.getContractTypes().subscribe((contractTypes) => (result = contractTypes));

    http.expectOne(`${BASE_URL}/contract-types.json`).flush(CONTRACT_TYPES);

    expect(result).toEqual(CONTRACT_TYPES);
  });

  it('getMarketData combines all three requests into one object', () => {
    let result: MarketData | undefined;
    service.getMarketData().subscribe((data) => (result = data));

    http.expectOne(`${BASE_URL}/order-data.json`).flush({ data: ORDERS });
    http.expectOne(`${BASE_URL}/instruments.json`).flush(INSTRUMENTS);
    http.expectOne(`${BASE_URL}/contract-types.json`).flush(CONTRACT_TYPES);

    expect(result).toEqual({
      orders: ORDERS,
      instruments: INSTRUMENTS,
      contractTypes: CONTRACT_TYPES,
    });
  });

  it('getMarketData fails when any request fails', () => {
    let error: unknown;
    service.getMarketData().subscribe({ error: (err: unknown) => (error = err) });

    http.expectOne(`${BASE_URL}/order-data.json`).flush({ data: ORDERS });
    http.expectOne(`${BASE_URL}/contract-types.json`).flush(CONTRACT_TYPES);
    http
      .expectOne(`${BASE_URL}/instruments.json`)
      .flush('Not found', { status: 404, statusText: 'Not Found' });

    expect(error).toBeInstanceOf(HttpErrorResponse);
  });
});

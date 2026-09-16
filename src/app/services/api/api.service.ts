import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { ContractType, Instrument, MarketData, Order, OrdersResponse } from '../api.domain';

const API_BASE_URL = 'https://geeksoft.pl/assets/2026-task';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  public getOrders(): Observable<Order[]> {
    return this.http
      .get<OrdersResponse>(`${API_BASE_URL}/order-data.json`)
      .pipe(map((response) => response.data));
  }

  public getInstruments(): Observable<Instrument[]> {
    return this.http.get<Instrument[]>(`${API_BASE_URL}/instruments.json`);
  }

  public getContractTypes(): Observable<ContractType[]> {
    return this.http.get<ContractType[]>(`${API_BASE_URL}/contract-types.json`);
  }

  public getMarketData(): Observable<MarketData> {
    return forkJoin({
      orders: this.getOrders(),
      instruments: this.getInstruments(),
      contractTypes: this.getContractTypes(),
    });
  }
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/main-table/main-table').then((m) => m.MainTable),
  },
  {
    path: 'new-order',
    loadComponent: () => import('./components/new-order/new-order').then((m) => m.NewOrder),
  },
  { path: '**', redirectTo: '' },
];

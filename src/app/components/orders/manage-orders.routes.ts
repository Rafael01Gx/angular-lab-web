
import { Routes } from '@angular/router';

export const MANAGE_ORDERS_ROUTES: Routes = [
  {
    path: 'dashboard',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/orders-dashboard.component').then(
        (m) => m.OrdersDashboardComponent
      ),
  },
  {
    path: 'waiting',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/manage-pending-orders.component').then(
        (m) => m.ManagePendingOrdersComponent
      ),
  },
  {
    path: 'executing',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/aproavacao.component').then(
        (m) => m.AproavacaoComponent
      ),
  },

]

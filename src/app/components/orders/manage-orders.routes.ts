
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
    path: 'aguardando',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/manage-pending-orders.component').then(
        (m) => m.ManagePendingOrdersComponent
      ),
  },
  {
    path: 'aprovacao',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/aproavacao.component').then(
        (m) => m.AproavacaoComponent
      ),
  },
  {
    path: 'buscar',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/search-orders.component').then(
        (m) => m.SearchOrdersComponent
      ),
  },
  {
    path: 'agenda',
    pathMatch: 'full',
    loadComponent: () =>
      import('./manage-order/agenda-container.component').then(
        (m) => m.AppComponent
      ),
  },

]

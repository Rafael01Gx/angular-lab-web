import {Routes} from '@angular/router';


export const ORDERS_ROUTES:Routes = [
  {
    path: 'create',
    pathMatch: 'full',
    loadComponent: () =>
      import('./orders-create/orders-create.component').then(
        (m) => m.OrdersCreateComponent
      ),
  },
  {
    path: 'pending',
    pathMatch: 'full',
    loadComponent: () =>
      import('./orders-pending-table/orders-pending-table.component').then(
        (m) => m.OrdersPendingTableComponent
      ),
  },
];

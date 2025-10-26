import {Routes} from '@angular/router';


export const ORDERS_ROUTES:Routes = [
  {
    path: 'nova',
    pathMatch: 'full',
    loadComponent: () =>
      import('./orders-create/orders-create.component').then(
        (m) => m.OrdersCreateComponent
      ),
  },
  {
    path: 'pendentes',
    pathMatch: 'full',
    loadComponent: () =>
      import('./orders-pending-table/orders-pending-table.component').then(
        (m) => m.OrdersPendingTableComponent
      ),
  },
  {
    path: 'minhas',
    pathMatch: 'full',
    loadComponent: () =>
      import('./all-by-user/all-orders-by-user.component').then(
        (m) => m.AllOrdersByUserComponent
      ),
  },
];

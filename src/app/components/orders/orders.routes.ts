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
  {
    path: 'all',
    pathMatch: 'full',
    loadComponent: () =>
      import('./all-by-user/all-orders-by-user.component').then(
        (m) => m.AllOrdersByUserComponent
      ),
  },
];

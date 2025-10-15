import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./components/info/info.component').then(
            (m) => m.InfoComponent
          ),
      },
      {
        path: 'profile',
        pathMatch: 'full',
        loadComponent: () =>
          import('./components/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./components/orders/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
      {
        path: 'manage-orders',
        loadChildren: () =>
          import('./components/orders/manage-orders.routes').then(
            (m) => m.MANAGE_ORDERS_ROUTES
          ),
      },
      {
        path: 'analysis',
        loadChildren: () =>
          import('./components/analises/analises.routes').then(
            (m) => m.ANALISES_ROUTES
          ),
      },
      {
        path: 'access-management',
        redirectTo: 'access-management/access-create',
        pathMatch: 'full',
      },
      {
        path: 'access-management/create-user',
        loadComponent: () =>
          import(
            './components/gerenciar-acesso/user-registration/user-registration.component'
          ).then((m) => m.UserRegistrationComponent),
      },
      {
        path: 'access-management/authorize',
        loadComponent: () =>
          import(
            './components/gerenciar-acesso/user-authorization/user-authorization.component'
          ).then((m) => m.UserAuthorizationComponent),
      },
      {
        path: 'samples',
        loadComponent: () =>
          import('./components/amostras/amostras.component').then(
            (m) => m.AmostrasComponent
          ),
      },
      {
        path: 'external-labs',
        loadChildren: () =>
          import(
            './components/laboratorios-externos/laboratorios-externos.routes'
          ).then((m) => m.LABORATORIOS_EXTERNOS_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./components/configuracoes/settings.routes').then(
            (m) => m.SETTINGS_ROUTES
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './shared/enums/roles.enum';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
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
        path: 'perfil',
        pathMatch: 'full',
        loadComponent: () =>
          import('./components/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
      {
        path: 'ordens',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.USUARIO] },
        loadChildren: () =>
          import('./components/orders/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
      {
        path: 'gerenciar-ordens',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadChildren: () =>
          import('./components/orders/manage-orders.routes').then(
            (m) => m.MANAGE_ORDERS_ROUTES
          ),
      },
      {
        path: 'analises',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.OPERADOR] },
        loadChildren: () =>
          import('./components/analises/analises.routes').then(
            (m) => m.ANALISES_ROUTES
          ),
      },
      {
        path: 'acessos',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadChildren: () =>
          import('./components/gerenciar-acesso/gerenciar-acesso.routes').then((m) =>
            m.ACESSOS_ROUTES)
      },
      {
        path: 'amostras',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.USUARIO] },
        loadComponent: () =>
          import('./components/amostras/amostras.component').then(
            (m) => m.AmostrasComponent
          ),
      },
      {
        path: 'laboratorios-externos',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.OPERADOR] },
        loadChildren: () =>
          import(
            './components/laboratorios-externos/laboratorios-externos.routes'
          ).then((m) => m.LABORATORIOS_EXTERNOS_ROUTES),
      },
      {
        path: 'configuracoes',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.OPERADOR] },
        loadChildren: () =>
          import('./components/configuracoes/settings.routes').then(
            (m) => m.SETTINGS_ROUTES
          ),
      },

    ],
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component')
        .then(m => m.UnauthorizedPage),
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

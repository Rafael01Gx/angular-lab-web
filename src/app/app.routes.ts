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
        path: 'perfil',
        pathMatch: 'full',
        loadComponent: () =>
          import('./components/perfil/perfil.component').then(
            (m) => m.PerfilComponent
          ),
      },
      {
        path: 'ordens',
        loadChildren: () =>
          import('./components/orders/orders.routes').then(
            (m) => m.ORDERS_ROUTES
          ),
      },
      {
        path: 'gerenciar-ordens',
        loadChildren: () =>
          import('./components/orders/manage-orders.routes').then(
            (m) => m.MANAGE_ORDERS_ROUTES
          ),
      },
      {
        path: 'analises',
        loadChildren: () =>
          import('./components/analises/analises.routes').then(
            (m) => m.ANALISES_ROUTES
          ),
      },
      {
        path: 'acessos',
        loadChildren:()=>
          import('./components/gerenciar-acesso/gerenciar-acesso.routes').then((m)=>
            m.ACESSOS_ROUTES)
      },
      {
        path: 'amostras',
        loadComponent: () =>
          import('./components/amostras/amostras.component').then(
            (m) => m.AmostrasComponent
          ),
      },
      {
        path: 'laboratorios-externos',
        loadChildren: () =>
          import(
            './components/laboratorios-externos/laboratorios-externos.routes'
          ).then((m) => m.LABORATORIOS_EXTERNOS_ROUTES),
      },
      {
        path: 'configuracoes',
        loadChildren: () =>
          import('./components/configuracoes/settings.routes').then(
            (m) => m.SETTINGS_ROUTES
          ),
      },

    ],
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

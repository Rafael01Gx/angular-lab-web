import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

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
        redirectTo:'orders/create',
        pathMatch: 'full',
      },
      {
        path: 'orders/create',
        pathMatch: 'full',
         loadComponent: () =>
          import('./components/orders/orders-create/orders-create.component').then(
            (m) => m.OrdersCreateComponent
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
        path: 'settings',
        redirectTo: 'settings/parameters',
        pathMatch: 'full',
      },
      {
        path: 'settings/analysis',
        loadComponent: () =>
          import(
            './components/configuracoes/analise-config/analise-config.component'
          ).then((m) => m.AnaliseConfigComponent),
      },
      {
        path: 'settings/parameters',
        loadComponent: () =>
          import(
            './components/configuracoes/parametros/parametros.component'
          ).then((m) => m.ParametrosComponent),
      },
      {
        path: 'settings/analysis-type',
        loadComponent: () =>
          import(
            './components/configuracoes/tipo-analise/tipo-analise.component'
          ).then((m) => m.TipoAnaliseComponent),
      },
      {
        path: 'settings/materials',
        loadComponent: () =>
          import(
            './components/configuracoes/materias-primas/materias-primas.component'
          ).then((m) => m.MateriasPrimasComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

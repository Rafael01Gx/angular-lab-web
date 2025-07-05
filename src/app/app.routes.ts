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
        path: 'settings',
        redirectTo:'settings/parameters',
        pathMatch: 'full',
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

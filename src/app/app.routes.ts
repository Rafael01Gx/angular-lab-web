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
        path: 'settings',
        redirectTo: 'settings/analysis-type',
        pathMatch: 'full',
      },
      {
        path: 'settings/analysis-type',
        loadComponent: () =>
          import(
            './components/configuracoes/tipo-analise/tipo-analise.component'
          ).then((m) => m.TipoAnaliseComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];

/*
[
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'ordens-servico',
    children: [
      { path: '', redirectTo: 'pendentes', pathMatch: 'full' },
      { 
        path: 'criar', 
        loadComponent: () => import('./pages/ordens-servico/criar-os.component').then(m => m.CriarOSComponent)
      },
      { 
        path: 'pendentes', 
        loadComponent: () => import('./pages/ordens-servico/pendentes-os.component').then(m => m.PendentesOSComponent)
      },
      { 
        path: 'finalizadas', 
        loadComponent: () => import('./pages/ordens-servico/finalizadas-os.component').then(m => m.FinalizadasOSComponent)
      }
    ]
  },
  { 
    path: 'amostras', 
    loadComponent: () => import('./pages/amostras/amostras.component').then(m => m.AmostrasComponent)
  },
  {
    path: 'analises',
    children: [
      { path: '', redirectTo: 'aguardando', pathMatch: 'full' },
      { 
        path: 'aguardando-autorizacao', 
        loadComponent: () => import('./pages/analises/aguardando-auth.component').then(m => m.AguardandoAuthComponent)
      },
      { 
        path: 'aguardando', 
        loadComponent: () => import('./pages/analises/aguardando.component').then(m => m.AguardandoComponent)
      },
      { 
        path: 'em-andamento', 
        loadComponent: () => import('./pages/analises/em-andamento.component').then(m => m.EmAndamentoComponent)
      },
      { 
        path: 'finalizadas', 
        loadComponent: () => import('./pages/analises/finalizadas.component').then(m => m.FinalizadasComponent)
      }
    ]
  },
  {
    path: 'gerenciar-os',
    children: [
      { path: '', redirectTo: 'aguardando', pathMatch: 'full' },
      { 
        path: 'aguardando', 
        loadComponent: () => import('./pages/gerenciar-os/aguardando.component').then(m => m.AguardandoOSComponent)
      },
      { 
        path: 'autorizada', 
        loadComponent: () => import('./pages/gerenciar-os/autorizada.component').then(m => m.AutorizadaOSComponent)
      },
      { 
        path: 'em-execucao', 
        loadComponent: () => import('./pages/gerenciar-os/em-execucao.component').then(m => m.EmExecucaoOSComponent)
      },
      { 
        path: 'finalizadas', 
        loadComponent: () => import('./pages/gerenciar-os/finalizadas.component').then(m => m.FinalizadasOSComponent)
      }
    ]
  },
  {
    path: 'gerenciar-acesso',
    children: [
      { path: '', redirectTo: 'autorizar', pathMatch: 'full' },
      { 
        path: 'autorizar', 
        loadComponent: () => import('./pages/gerenciar-acesso/autorizar.component').then(m => m.AutorizarAcessoComponent)
      },
      { 
        path: 'alterar-nivel', 
        loadComponent: () => import('./pages/gerenciar-acesso/alterar-nivel.component').then(m => m.AlterarNivelComponent)
      },
      { 
        path: 'excluir', 
        loadComponent: () => import('./pages/gerenciar-acesso/excluir.component').then(m => m.ExcluirUsuarioComponent)
      },
      { 
        path: 'cadastrar', 
        loadComponent: () => import('./pages/gerenciar-acesso/cadastrar.component').then(m => m.CadastrarUsuarioComponent)
      }
    ]
  },
  {
    path: 'configuracoes',
    children: [
      { path: '', redirectTo: 'analise', pathMatch: 'full' },
      { 
        path: 'analise', 
        loadComponent: () => import('./pages/configuracoes/config-analise.component').then(m => m.ConfigAnaliseComponent)
      },
      { 
        path: 'parametros', 
        loadComponent: () => import('./pages/configuracoes/parametros.component').then(m => m.ParametrosComponent)
      },
      { 
        path: 'materia-prima', 
        loadComponent: () => import('./pages/configuracoes/materia-prima.component').then(m => m.MateriaPrimaComponent)
      },
      { 
        path: 'tipo-analise', 
        loadComponent: () => import('./pages/configuracoes/tipo-analise.component').then(m => m.TipoAnaliseComponent)
      }
    ]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
*/

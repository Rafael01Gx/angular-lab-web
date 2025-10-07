import {Routes} from '@angular/router';
import {amostraResolver, paramsConfigResolver} from '../../core/resolvers/params-config.resolver';

export const ANALISES_ROUTES:Routes= [{
  path: 'waiting-authorization',
  pathMatch: 'full',
  loadComponent: ()=> import('./aguardando-autorizacao/aguardando-autorizacao.component').then((c)=> c.AguardandoAutorizacaoComponent)
},{
  path: 'waiting-analysis',
  pathMatch: 'full',
  loadComponent: ()=> import('./aguardando-analise/aguardando-analise.component').then((c)=> c.AguardandoAnaliseComponent)
},
  {
    path: 'in-progress',
    pathMatch: 'full',
    loadComponent: ()=> import('./analise-em-andamento/analise-em-andamento.component').then((c)=> c.AnaliseEmAndamentoComponent)
  },  {
    path: 'include-results',
    pathMatch: 'full',
    loadComponent: ()=> import('./lancamento-resultado/lancamento-resultado.component').then((c)=> c.LancamentoResultadoComponent),
    resolve: {
      configssettings: paramsConfigResolver,
      amostra: amostraResolver
    }
  },
  {
    path: 'completed',
    pathMatch: 'full',
    loadComponent: ()=> import('./analise-finalizada/analise-finalizada.component').then((c)=> c.AnaliseFinalizadaComponent)
  },];

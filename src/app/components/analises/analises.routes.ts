import {Routes} from '@angular/router';

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
  },
  {
    path: 'completed',
    pathMatch: 'full',
    loadComponent: ()=> import('./lancamento-resultado/lancamento-resultado.component').then((c)=> c.LancamentoResultadoComponent)
  },];

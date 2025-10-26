import {Routes} from '@angular/router';

export const ANALISES_ROUTES:Routes= [{
  path: 'aguardando-autorizacao',
  pathMatch: 'full',
  loadComponent: ()=> import('./aguardando-autorizacao/aguardando-autorizacao.component').then((c)=> c.AguardandoAutorizacaoComponent)
},{
  path: 'aguardando-analises',
  pathMatch: 'full',
  loadComponent: ()=> import('./aguardando-analise/aguardando-analise.component').then((c)=> c.AguardandoAnaliseComponent)
},
  {
    path: 'em-progresso',
    pathMatch: 'full',
    loadComponent: ()=> import('./analise-em-andamento/analise-em-andamento.component').then((c)=> c.AnaliseEmAndamentoComponent)
  },  {
    path: 'incluir-resultados',
    pathMatch: 'full',
    loadComponent: ()=> import('./lancamento-resultado/lancamento-resultado.component').then((c)=> c.LancamentoResultadoComponent),
  },
  {
    path: 'finalizadas',
    pathMatch: 'full',
    loadComponent: ()=> import('./analise-finalizada/analise-finalizada.component').then((c)=> c.AnaliseFinalizadaComponent)
  },];

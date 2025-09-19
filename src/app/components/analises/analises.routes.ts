import {Routes} from '@angular/router';

export const ANALISES_ROUTES:Routes= [{
  path: 'waiting-authorization',
  pathMatch: 'full',
  loadComponent: ()=> import('./aguardando-autorizacao/aguardando-autorizacao.component').then((c)=> c.AguardandoAutorizacaoComponent)
},{
  path: 'waiting-analysis',
  pathMatch: 'full',
  loadComponent: ()=> import('./aguardando-analise/aguardando-analise.component').then((c)=> c.AguardandoAnaliseComponent)
},];

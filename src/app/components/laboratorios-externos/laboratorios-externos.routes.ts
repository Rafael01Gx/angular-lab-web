
import { Routes } from '@angular/router';

export const LABORATORIOS_EXTERNOS_ROUTES: Routes = [
  {
    path: 'remessa',
    loadComponent: () =>
      import(
        './remessa/remessa.component'
        ).then((m) => m.RemessaComponent),
  },  {
    path: 'amostras',
    loadComponent: () =>
      import(
        './amostras/amostras.component'
        ).then((m) => m.AmostrasComponent),
  },
  {
    path: 'elementos-quimicos',
    loadComponent: () =>
      import(
        './elementos-quimicos/elementos-quimicos.component'
        ).then((m) => m.ElementosQuimicosComponent),
  },
  {
    path: 'laboratorios',
    loadComponent: () =>
      import(
        './laboratorios/laboratorios.component'
        ).then((m) => m.LaboratoriosComponent),
  },
  {
    path: 'resultados',
    loadComponent: () =>
      import(
        './tabela-amostras/amostras-analise-externa-table.component'
        ).then((m) => m.AmostrasAnaliseExternaTableComponent),
  },
  {
      path: 'upload',
      loadComponent:() =>
      import(
        './upload-resultados/upload-resultados.component'
        ).then((m) => m.UploadResultadoComponent),
    },
  {
    path: 'resultados',
    loadComponent: () =>
      import(
        './tabela-amostras/amostras-analise-externa-table.component'
        ).then((m) => m.AmostrasAnaliseExternaTableComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import(
        './dashboard/lab-externo-dashboard.component'
        ).then((m) => m.LabExternoDashboardComponent),
  },

]

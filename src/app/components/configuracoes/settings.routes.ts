import {Routes} from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'analysis',
    loadComponent: () =>
      import(
        './analise-config/analise-config.component'
        ).then((m) => m.AnaliseConfigComponent),
  },
  {
    path: 'parameters',
    loadComponent: () =>
      import(
        './parametros/parametros.component'
        ).then((m) => m.ParametrosComponent),
  },
  {
    path: 'analysis-type',
    loadComponent: () =>
      import(
        './tipo-analise/tipo-analise.component'
        ).then((m) => m.TipoAnaliseComponent),
  },
  {
    path: 'materials',
    loadComponent: () =>
      import(
        './materias-primas/materias-primas.component'
        ).then((m) => m.MateriasPrimasComponent),
  },
];

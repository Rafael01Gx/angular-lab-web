import {Routes} from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: 'analises',
    loadComponent: () =>
      import(
        './analise-config/analise-config.component'
        ).then((m) => m.AnaliseConfigComponent),
  },
  {
    path: 'parametros',
    loadComponent: () =>
      import(
        './parametros/parametros.component'
        ).then((m) => m.ParametrosComponent),
  },
  {
    path: 'tipos-analise',
    loadComponent: () =>
      import(
        './tipo-analise/tipo-analise.component'
        ).then((m) => m.TipoAnaliseComponent),
  },
  {
    path: 'materias-primas',
    loadComponent: () =>
      import(
        './materias-primas/materias-primas.component'
        ).then((m) => m.MateriasPrimasComponent),
  },
];

import {Routes} from '@angular/router';

export const ACESSOS_ROUTES:Routes= [
  {
    path: 'novo-usuario',
    pathMatch: 'full',
    loadComponent: () =>
      import(
        './user-registration/user-registration.component'
        ).then((m) => m.UserRegistrationComponent),
  },
  {
    path: 'gerenciar',
    pathMatch: 'full',
    loadComponent: () =>
      import(
        './user-authorization/user-authorization.component'
        ).then((m) => m.UserAuthorizationComponent),
  },
]

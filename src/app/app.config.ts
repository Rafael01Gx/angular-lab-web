import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import {errorsInterceptor} from './core/interceptors/errors.interceptor';
import {registerLocaleData} from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch(),withInterceptors([errorsInterceptor])),
    provideRouter(routes),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideEnvironmentNgxMask(),
    provideAnimationsAsync(),
  { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
};

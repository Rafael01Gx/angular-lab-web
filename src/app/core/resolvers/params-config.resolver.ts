import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { IAnalysisSettings } from '../../shared/interfaces/analysis-settings.interface';
import { inject, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { AnalysisSettingsService } from '../../services/analysis-settings.service';
import { of, tap } from 'rxjs';
import { IAmostra } from '../../shared/interfaces/amostra.interface';
import { AmostrasService } from '../../services/amostras.service';
import { isPlatformBrowser } from '@angular/common';

const CONFIG_ANALISE_KEY = makeStateKey<IAnalysisSettings[]>('analiseConfigResolver');
const AMOSTRA_KEY = makeStateKey<IAmostra>('amostraResolver');


export const paramsConfigResolver: ResolveFn<IAnalysisSettings[]> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const transferState = inject(TransferState);
  const platformId = inject(PLATFORM_ID);
  const analiseConfig = transferState.get(CONFIG_ANALISE_KEY, null);
  const analiseConfigService = inject(AnalysisSettingsService);
  const config_id = route.queryParamMap.get('config')!;
  if (analiseConfig) {
    if (isPlatformBrowser(platformId)) {
      transferState.remove(CONFIG_ANALISE_KEY);
    }

    return of(analiseConfig);
  }

  return analiseConfigService.findByAnalisysId(config_id).pipe(tap((configs) => transferState.set(CONFIG_ANALISE_KEY, configs)));

}


export const amostraResolver: ResolveFn<IAmostra> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const transferState = inject(TransferState);
  const platformId = inject(PLATFORM_ID);
  const amostra = transferState.get(AMOSTRA_KEY, null);
  const amostraService = inject(AmostrasService);
  const amostra_id = route.queryParamMap.get('amostra')!;
  if (amostra) {
    if (isPlatformBrowser(platformId)) {
      transferState.remove(AMOSTRA_KEY);
    }

    return of(amostra);
  }

  return amostraService.findById(amostra_id).pipe(tap((amostra) => transferState.set(AMOSTRA_KEY, amostra)));

}

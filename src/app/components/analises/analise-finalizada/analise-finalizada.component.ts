import {
  Component,
  inject,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';
import { TabelaAnaliseAmostrasComponent } from '../../tables/tabela-analise-amostras.component';
import {
  PaginatedMeta,
  Querys,
} from '../../../shared/interfaces/querys.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { IAmostra } from '../../../shared/interfaces/amostra.interface';
import { AmostrasService } from '../../../services/amostras.service';
import { LaudoAmostraService } from '../../../services/laudo-pdf.service';

const AMOSTRAS_FINALIZADAS_KEY = makeStateKey<IAmostra[]>(
  'analises-finalizadas'
);
const PAGINATED_META_KEY = makeStateKey<PaginatedMeta>(
  'analises-finalizadas-meta'
);

@Component({
  selector: 'app-analise-finalizada',
  imports: [TabelaAnaliseAmostrasComponent],
  template: ` <app-tabela-analise-amostras
    class="w-full h-full"
    [analiseFinalizada]="true"
    [selectFilter]="false"
    [amostras]="amostras()"
    [paginatedMeta]="paginatedMeta()"
    (amostraOutput)="gerarLaudo($event)"
    (pageChange)="onPageChange($event)"
  />`,
})
export class AnaliseFinalizadaComponent implements OnInit {
  #laudoAmostraService = inject(LaudoAmostraService);
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  #amostraService = inject(AmostrasService);
  amostras = signal<IAmostra[]>([]);
  paginatedMeta = signal<PaginatedMeta | null>(null);

  ngOnInit() {
    const amostras = this.#transferState.get(AMOSTRAS_FINALIZADAS_KEY, []);
    const paginatedMeta = this.#transferState.get(PAGINATED_META_KEY, null);
    if (amostras.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.amostras.set(amostras);
      this.paginatedMeta.set(paginatedMeta);
      this.#transferState.remove(AMOSTRAS_FINALIZADAS_KEY);
      return;
    }
    this.carregarAmostras();
  }

  private carregarAmostras(limit: number = 20, page: number = 1 ,progresso: number = 100) {
    const query: Querys = { limit, page , progresso};
    this.#amostraService
      .findAllWithAnalystsAndCompleted(query)
      .subscribe((res) => {
        if (res && res.data.length > 0) {
          this.amostras.update((v) => [...v, ...res.data]);
          this.paginatedMeta.set(res.meta);
          if (isPlatformServer(this.#platFormId)) {
            this.paginatedMeta.set(res.meta);
            this.#transferState.set(AMOSTRAS_FINALIZADAS_KEY, res.data);
          }
        }
      });
  }

  onPageChange(event: { page?: number; limit?: number }) {
    this.carregarAmostras(event.limit, event.page);
  }

  gerarLaudo(amostra: IAmostra) {
    if (!amostra) return;
    this.#laudoAmostraService.generateLaudoPdf(amostra);
  }
}

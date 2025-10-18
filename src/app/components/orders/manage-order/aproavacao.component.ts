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

const AMOSTRAS_KEY = makeStateKey<IAmostra[]>(
  'amostras-aproavacao'
);

@Component({
  selector: 'app-aproavacao',
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
export class AproavacaoComponent implements OnInit {
  #laudoAmostraService = inject(LaudoAmostraService);
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  #amostraService = inject(AmostrasService);
  amostras = signal<IAmostra[]>([]);
  paginatedMeta = signal<PaginatedMeta | null>(null);

  ngOnInit() {
    const amostras = this.#transferState.get(AMOSTRAS_KEY, []);
    if (amostras.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.amostras.set(amostras);
      this.#transferState.remove(AMOSTRAS_KEY);
      return;
    }
    this.carregarAmostras();
  }

  private carregarAmostras(limit: number = 20, page: number = 1) {
    const query: Querys = { limit, page };
    this.#amostraService
      .findAllWithAnalystsAndCompleted(query)
      .subscribe((res) => {
        if (res && res.data.length > 0) {
          this.amostras.update((v) => [...v, ...res.data]);
          this.paginatedMeta.set(res.meta);
          console.log(res.meta);
          if (isPlatformServer(this.#platFormId)) {
            this.paginatedMeta.set(res.meta);
            this.#transferState.set(AMOSTRAS_KEY, res.data);
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

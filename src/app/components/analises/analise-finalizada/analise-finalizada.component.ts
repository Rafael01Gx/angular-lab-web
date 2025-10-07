import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {TabelaAnaliseAmostrasComponent} from '../../tables/tabela-analise-amostras.component';
import {Querys} from '../../../shared/interfaces/querys.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {IAmostra} from '../../../shared/interfaces/amostra.interface';
import {AmostrasService} from '../../../services/amostras.service';
import {Router} from '@angular/router';
import {ITipoAnalise} from '../../../shared/interfaces/analysis-type.interface';


const AMOSTRAS_FINALIZADAS_KEY = makeStateKey<IAmostra[]>("analises-finalizadas");

@Component({
  selector: 'app-analise-finalizada',
  imports: [
    TabelaAnaliseAmostrasComponent
  ],
  template: `
    <app-tabela-analise-amostras class="w-full h-full" [selectFilter]="false" [amostras]="amostras()"/>`
})
export class AnaliseFinalizadaComponent implements OnInit {
  #router = inject(Router);
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  #amostraService = inject(AmostrasService);
  amostras = signal<IAmostra[]>([]);

  ngOnInit() {
    const amostras = this.#transferState.get(AMOSTRAS_FINALIZADAS_KEY, []);
    if (amostras.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.amostras.set(amostras);
      this.#transferState.remove(AMOSTRAS_FINALIZADAS_KEY);
      return;
    }
    this.carregarAmostras();
  }

  private carregarAmostras() {
    const query: Querys = {status: "status=FINALIZADA"}
    this.#amostraService.findAll(query).subscribe(amostras => {
      if (amostras) {
        this.amostras.set(amostras)
        if (isPlatformServer(this.#platFormId)) {
          this.#transferState.set(AMOSTRAS_FINALIZADAS_KEY, amostras);
        }
      }
    })
  }

}


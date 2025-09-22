import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {TabelaAnaliseAmostrasComponent} from '../../tables/tabela-analise-amostras.component';
import {Querys} from '../../../shared/interfaces/querys.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {IAmostra} from '../../../shared/interfaces/amostra.interface';
import {AmostrasService} from '../../../services/amostras.service';


const AMOSTRAS_KEY = makeStateKey<IAmostra[]>("analise-em-andamento-amostras");

@Component({
  selector: 'app-analise-em-andamento',
  imports: [
    TabelaAnaliseAmostrasComponent
  ],
  template:`
  <app-tabela-analise-amostras class="w-full h-full" [amostras]="amostras()" />`
})
export class AnaliseEmAndamentoComponent implements OnInit {
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  #amostraService = inject(AmostrasService);
  amostras = signal<IAmostra[]>([]);

  ngOnInit() {
    const amostras = this.#transferState.get(AMOSTRAS_KEY, []);
    if (amostras.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.amostras.set(amostras);
      this.#transferState.remove(AMOSTRAS_KEY);
      return;
    }
    this.carregarAmostras();
  }

  private carregarAmostras() {
    const query: Querys = {status: "status=AGUARDANDO&status=AUTORIZADA"}
    this.#amostraService.findAll(query).subscribe(amostras => {
      if (amostras) {
        this.amostras.set(amostras)
        if (isPlatformServer(this.#platFormId)) {
          this.#transferState.set(AMOSTRAS_KEY, amostras);
        }
      }
    })
  }
}

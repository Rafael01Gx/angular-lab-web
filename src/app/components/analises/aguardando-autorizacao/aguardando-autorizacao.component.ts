import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {OrdemServicoManagerTable} from '../../tables/ordem-servico-manage-table.component';
import {OrderService} from '../../../services/order.service';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {Querys} from '../../../shared/interfaces/querys.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {Status} from '../../../shared/enums/status.enum';
import {AguardandoAnaliseComponent} from '../aguardando-analise/aguardando-analise.component';

const ORDERS_KEY = makeStateKey<IOrders[]>("ordens-aguardando-autorizacao");

@Component({
  selector: 'app-aguardando-autorizacao',
  imports: [
    OrdemServicoManagerTable,
  ],
  template: `
    <app-ordem-servico-manager-table [titulo]="'Aguandando autorização'" [ordens]="ordens()"
                                     [selectOptions]="[Status.AGUARDANDO]"
    />

  `,
})
export class AguardandoAutorizacaoComponent implements OnInit{
  #orderService = inject(OrderService);
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);

  ordens = signal<IOrders[]>([]);

  ngOnInit() {
    const orders = this.#transferState.get(ORDERS_KEY, []);
    if (orders.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.ordens.set(orders);
      this.#transferState.remove(ORDERS_KEY);
      return;
    }
    this.carregarOrdens();
  }


  private carregarOrdens() {
    const query: Querys = {status: "status=AGUARDANDO"}
    this.#orderService.findAll(query).subscribe(ordens => {
      if (ordens) {
        this.ordens.set(ordens)
        if (isPlatformServer(this.#platFormId)) {
          this.#transferState.set(ORDERS_KEY, ordens);
        }
      }
    })
  }

  protected readonly Status = Status;
}

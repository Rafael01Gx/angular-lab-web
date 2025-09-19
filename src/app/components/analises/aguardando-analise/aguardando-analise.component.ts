import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {OrderService} from '../../../services/order.service';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {Querys} from '../../../shared/interfaces/querys.interface';
import {OrdemServicoManagerTable} from '../../tables/ordem-servico-manage-table.component';
import {Status} from '../../../shared/enums/status.enum';
import {AgendamentoModalService} from '../../../services/agendamento-modal.service';
import {ToastrService} from '../../../services/toastr.service';

const ORDERS_KEY = makeStateKey<IOrders[]>("ordens-aguardando-analise");

@Component({
  selector: 'app-aguardando-analise',
  imports: [
    OrdemServicoManagerTable,
  ],
  template: `
    <app-ordem-servico-manager-table [titulo]="'Aguandando análise'" [ordens]="ordens()"
                                     [selectOptions]="[Status.AUTORIZADA]"
                                     (getOrder)="setSelectedOrder($event)"
                                     [actionButtonOption]="{icon:'heroClock',label:'Agendar análise'}"   />

  `,

})
export class AguardandoAnaliseComponent implements OnInit{
  #orderService = inject(OrderService);
  #toastr = inject(ToastrService);
  #agendamento = inject(AgendamentoModalService);
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
    const query: Querys = {status: "status=AUTORIZADA"}
    this.#orderService.findAll(query).subscribe(ordens => {
      if (ordens) {
        this.ordens.set(ordens)
        if (isPlatformServer(this.#platFormId)) {
          this.#transferState.set(ORDERS_KEY, ordens);
        }
      }
    })
  }
  closeModal(event: boolean) {

  }
  setSelectedOrder(order: IOrders) {
    this.#agendamento.openModal(order).then((res)=>{
      if(res){
        if (typeof res == "object"){
          this.updateList(res);
        } else {
          this.#toastr.info('As alterações não foram salvas!');
        }
      }
    }).catch((err)=> {
      console.log(err)
      this.#toastr.error('Erro ao efetuar a operação!','Erro');
    })
  }

  updateList(ordem:IOrders) {
    this.ordens.update(value => value.map(o => o.id === ordem.id ? ordem : o))
  }

  protected readonly Status = Status;
}

import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {OrderService} from '../../../services/order.service';
import {Querys} from '../../../shared/interfaces/querys.interface';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {OrdemServicoManagerTable} from '../../tables/ordem-servico-manage-table.component';
import {Status} from '../../../shared/enums/status.enum';
import {StatusModalComponent} from '../status-modal/status-modal.component';

const ORDERS_KEY = makeStateKey<IOrders[]>("orders-pending-table");

@Component({
  selector: 'app-manage-pending-orders',
  imports: [OrdemServicoManagerTable, StatusModalComponent],
  template: `
    <app-ordem-servico-manager-table [titulo]="'Gerenciar OS'" [ordens]="ordens()"
                                     [selectOptions]="[Status.AGUARDANDO,Status.AUTORIZADA]"
                                     (setStatus)="setSelectedOrder($event)"
    />
    <app-status-modal [isOpen]="isOpened()" [ordem]="selectedOrder()" (modalFechado)="closeModal($event)"
                      [selectOptions]="[Status.AUTORIZADA,Status.CANCELADA]"
                      (statusAlterado)="updateList($event)"
    />
  `,
})
export class ManagePendingOrdersComponent implements OnInit {
  #orderService = inject(OrderService);
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  isOpened = signal<boolean>(false);
  selectedOrder = signal<IOrders | null>(null);
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
    const query: Querys = {status: "status=AGUARDANDO&status=AUTORIZADA"}
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
    this.isOpened.set(false);
  }
  setSelectedOrder(order: IOrders) {
    this.selectedOrder.set(order);
    this.isOpened.set(true);
  }

  updateList(ordem:IOrders) {
    this.ordens.update(value => value.map(o => o.id === ordem.id ? ordem : o))
  }

  protected readonly Status = Status;
}

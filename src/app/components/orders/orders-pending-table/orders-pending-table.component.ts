import {Component, effect, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';

import {OrderService} from '../../../services/order.service';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {OrdemServicoTableComponent} from '../../tables/ordem-servico-table/ordem-servico-table.component';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroNumberedList} from '@ng-icons/heroicons/outline';

const ORDERS_KEY = makeStateKey<IOrders[]>("orders-pending-table")

@Component({
  selector: 'app-orders-pending-table',
  imports: [OrdemServicoTableComponent, NgIcon],
  viewProviders:[provideIcons({heroNumberedList})],
  template: `
    <div class="bg-white rounded-sm shadow-2xl h-full w-full flex flex-col p-4">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6 flex-shrink-0">
        <ng-icon name="heroNumberedList" class="text-2xl text-blue-600"></ng-icon>
        <h2 class="text-xl font-semibold text-slate-700">Ordens de Serviço</h2>
      </div>

      <!-- Table Container com altura mínima definida -->
      <div class="flex-1 min-h-0">
        <app-ordem-servico-table
          class="h-full block"
          [ordensServico]="ordems()" />
      </div>
    </div>
  `,
})
export class OrdersPendingTableComponent implements OnInit{
#orderService = inject(OrderService);
#transferState = inject(TransferState);
#platFormId = inject(PLATFORM_ID);

ordems = signal<IOrders[]>([]);

constructor() {
  effect(() => {
    console.log(this.ordems());
  });
}
  ngOnInit() {
    const orders = this.#transferState.get(ORDERS_KEY, [])
    if(orders.length > 0 && isPlatformBrowser(this.#platFormId)){
      this.ordems.set(orders)
      this.#transferState.remove(ORDERS_KEY)
      return;
    }
    this.loadOrders();
  }
  loadOrders(){
    this.#orderService.findAll().subscribe((res)=>{
      if(res){
        this.ordems.set(res);
        if(isPlatformServer(this.#platFormId)){
          this.#transferState.set(ORDERS_KEY, res)
        }
      }
    })
  }
}

import {
  Component,
  effect,
  inject,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';

import {OrderService} from '../../../services/order.service';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {OrdemServicoTableComponent} from '../../tables/ordem-servico-table.component';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroClock, heroMagnifyingGlass} from '@ng-icons/heroicons/outline';
import {ReactiveFormsModule} from '@angular/forms';
import {debouncedSignal} from '../../../shared/utils/debounced-signal';

const ORDERS_KEY = makeStateKey<IOrders[]>("orders-pending-table")

@Component({
  selector: 'app-orders-pending-table',
  imports: [OrdemServicoTableComponent, NgIcon, ReactiveFormsModule],
  viewProviders: [provideIcons({heroClock, heroMagnifyingGlass})],
  template: `
    <div class="bg-white rounded-sm shadow-2xl h-full w-full flex flex-col p-4">
      <!-- Header -->
      <div class="pb-4 shrink-0">
        <div class="flex justify-start items-center">
          <ng-icon name="heroClock" class="text-2xl text-blue-600 mr-2"/>
          <h2 class="text-lg font-semibold text-slate-700">
            OS Pendentes
          </h2>
          <div class="relative ml-auto rounded-md shadow-sm">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <ng-icon name="heroMagnifyingGlass" class="h-5 w-5 text-gray-400"/>
            </div>
            <input
              [value]="busca()"
              #inputBusca (input)="busca.set(inputBusca.value)"
              type="text"
              name="search"
              id="search"
              class="block w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Filtrar por ID/OS"
            />
          </div>
        </div>
      </div>

      <div class="flex-1 min-h-0">
        <app-ordem-servico-table
          [impressao]="true"
          [cancelarOs]="true"
          class="h-full block"
          [ordensServico]="ordemsFiltradas()"/>
      </div>
    </div>
  `,
})
export class OrdersPendingTableComponent implements OnInit {
  #orderService = inject(OrderService);
  #transferState = inject(TransferState);
  #platFormId = inject(PLATFORM_ID);


  ordems = signal<IOrders[]>([]);
  ordemsFiltradas = signal<IOrders[]>([]);

  busca = signal('');
  buscaDebounced = debouncedSignal(this.busca, 400);

  constructor() {
    effect(() => {
      const valor = this.buscaDebounced().toLowerCase();
      const filtro = this.ordems().filter((o) => o.id?.toLowerCase().includes(valor) || o.numeroOs?.toLowerCase().includes(valor))
      valor.length > 0 ? this.ordemsFiltradas.set(filtro) : this.ordemsFiltradas.set(this.ordems());
    });
  }

  ngOnInit() {
    const orders = this.#transferState.get(ORDERS_KEY, [])
    if (orders.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.ordems.set(orders)
      this.ordemsFiltradas.set(orders)
      this.#transferState.remove(ORDERS_KEY)
      return;
    }
    this.loadOrders();
  }

  loadOrders() {
    const status = "status=EXECUCAO&status=AGUARDANDO&status=AUTORIZADA";
    this.#orderService.findAllByUser({status}).subscribe((res) => {
      if (res) {
        res = this.calcularProgresso(res);
        this.ordems.set(res);
        this.ordemsFiltradas.set(res);
        if (isPlatformServer(this.#platFormId)) {
          this.#transferState.set(ORDERS_KEY, res)
        }
      }
    })
  }

  filtrar(filtro: string) {
    return []

  }

  calcularProgresso(data: IOrders[]): IOrders[] {
      return data.map((ordem) => {
        const totalAmostras = ordem.amostras.length;
        const mediaProgressoAmostras = Math.round(
                ordem.amostras.reduce((acc, amostra) => acc + (amostra.progresso || 0), 0) /
                  totalAmostras
              );
        return { ...ordem, progresso: mediaProgressoAmostras };
      });
    }
}

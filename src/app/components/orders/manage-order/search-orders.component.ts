import {
  Component,
  effect,
  inject,
  makeStateKey,
  model,
  OnInit,
  PLATFORM_ID,
  signal,
  TransferState
} from "@angular/core";
import { FilterOrdersTableComponent, IPaginateConfigAndFilters } from "../../tables/filter-orders-table.component";
import { OrderService } from "../../../services/order.service";
import { PaginatedResponse, Querys } from "../../../shared/interfaces/querys.interface";
import { IOrders } from "../../../shared/interfaces/orders.interface";
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {tap} from 'rxjs';

const ORDENS_DATA_KEY = makeStateKey<PaginatedResponse<IOrders[]>>('app-search-ordensData');

@Component({
    selector: 'app-search-orders',
    imports: [FilterOrdersTableComponent],
    template: `
<app-filter-orders-table
        [isLoading]="isLoading()"
        [data]="ordensData()"
        (configAndFilters)="setConfigAndFilters($event)"
         class="w-full h-full" />
`
})
export class SearchOrdersComponent implements OnInit {
    #ordemService = inject(OrderService);
    #transferState = inject(TransferState);
    #platformId = inject(PLATFORM_ID)
    ordensData = signal<PaginatedResponse<IOrders[]>|null>(null)
    isLoading = signal<boolean>(false);

    paginateConfig = signal<IPaginateConfigAndFilters>({
        currentPage: 1,
        itemsPerPage: 15,
        totalItems: 0,
        totalPages: 0,
        advancedFilters:null,
    })


    ngOnInit(): void {
      const ordensDatakey = this.#transferState.get(ORDENS_DATA_KEY,null);
      if (isPlatformBrowser(this.#platformId) && ordensDatakey) {
        this.ordensData.set(ordensDatakey);
        this.#transferState.remove(ORDENS_DATA_KEY);
        return
      }
        this.loadOrdens();
    }

    loadOrdens() {
        this.isLoading.set(true);

        const query: Querys = {
            page: this.paginateConfig().currentPage,
            limit: this.paginateConfig().itemsPerPage,
            ...this.paginateConfig().advancedFilters
        };
        this.#ordemService.findByFilters(query).pipe(tap((data)=>{
          if(data && isPlatformServer(this.#platformId)){
            this.#transferState.set(ORDENS_DATA_KEY, data);
          }
        })).subscribe({
            next: (response: PaginatedResponse<IOrders[]>) => {
                this.ordensData.set(response);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar ordens de serviço:', err);
                this.isLoading.set(false);
            }
        });
    }

    setConfigAndFilters(event:IPaginateConfigAndFilters){
        this.paginateConfig.set(event);
        this.loadOrdens();
    }

}

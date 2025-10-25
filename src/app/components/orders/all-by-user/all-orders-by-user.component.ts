import { Component, effect, inject, model, OnInit, signal } from "@angular/core";
import { FilterOrdersTableComponent, IPaginateConfigAndFilters } from "../../tables/filter-orders-table.component";
import { OrderService } from "../../../services/order.service";
import { PaginatedResponse, Querys } from "../../../shared/interfaces/querys.interface";
import { IOrders } from "../../../shared/interfaces/orders.interface";


@Component({
    selector: 'app-all-orders-by-user',
    imports: [FilterOrdersTableComponent],
    template: `
<app-filter-orders-table
        [isLoading]="isLoading()"
        [data]="ordensData()"
        [filtroUsuario]="false" 
        (configAndFilters)="setConfigAndFilters($event)"
         class="w-full h-full" />
`
})
export class AllOrdersByUserComponent implements OnInit {
    #ordemService = inject(OrderService);
    ordensData = signal<PaginatedResponse<IOrders[]>|null>(null)
    isLoading = signal<boolean>(false);
    
    paginateConfig = signal<IPaginateConfigAndFilters>({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
        advancedFilters:null,
    })


    ngOnInit(): void {
        this.loadOrdens()
    }

    loadOrdens() {
        this.isLoading.set(true);

        const query: Querys = {
            page: this.paginateConfig().currentPage,
            limit: this.paginateConfig().itemsPerPage,
            ...this.paginateConfig().advancedFilters
        };
        this.#ordemService.findByUserAndFilters(query).subscribe({
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
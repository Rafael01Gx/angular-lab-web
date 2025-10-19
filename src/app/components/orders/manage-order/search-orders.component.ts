import { Component, inject, model, OnInit, signal } from "@angular/core";
import { FilterOrdersTableComponent } from "../../tables/filter-orders-table.component";
import { OrderService } from "../../../services/order.service";
import { PaginatedResponse, Querys } from "../../../shared/interfaces/querys.interface";
import { IOrders } from "../../../shared/interfaces/orders.interface";

@Component({
    selector: 'app-search-orders',
    imports: [FilterOrdersTableComponent],
    template: `
<app-filter-orders-table
        [isLoading]="isLoading()"
        [(currentPage)]="currentPage"
        [(itemsPerPage)]="itemsPerPage"
        [(totalItems)]="totalItems"
        [(totalPages)]="totalPages"
        [(advancedFilters)]="advancedFilters"
        (applyFilter)="loadOrdens()" class="w-full h-full" />
`
})
export class SearchOrdersComponent implements OnInit {
    #ordemService = inject(OrderService);
    ordens = signal<IOrders[]>([])
    isLoading = signal<boolean>(false);
    currentPage = signal<number>(1);
    itemsPerPage = signal<number>(10);
    totalItems = signal<number>(0);
    totalPages = signal<number>(0);
    advancedFilters = signal<Querys>({});
    

    ngOnInit(): void {
        this.loadOrdens()
    }

   loadOrdens() {
        this.isLoading.set(true);

        const query: Querys = {
            page: this.currentPage(),
            limit: this.itemsPerPage(),
            ...this.advancedFilters()
        };

        this.#ordemService.findByFilters(query).subscribe({
            next: (response: PaginatedResponse<IOrders[]>) => {
                this.ordens.set(response.data);
                this.totalItems.set(response.meta.total);
                this.totalPages.set(response.meta.totalPages);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar ordens de serviço:', err);
                this.isLoading.set(false);
            }
        });
    }
}
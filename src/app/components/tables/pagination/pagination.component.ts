import { Component, computed, input, output, OutputEmitterRef } from "@angular/core";
import { PaginatedMeta } from "../../../shared/interfaces/querys.interface";

@Component({
    selector: 'app-footer-pagination',
    imports: [],
    template: `
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500"
          >
            <span>
              Mostrando {{ exibindo()}} de
              {{ total() }} amostras
            </span>

            <!-- Paginação -->
            @if(paginatedMeta()){
            <div class="flex items-center gap-2">
              <button
                (click)="onPageChange(paginatedMeta()!.currentPage - 1)"
                [disabled]="paginatedMeta()!.currentPage === 1"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Anterior
              </button>

              <!-- Números das páginas -->
              <div class="flex gap-1">
                @for(page of getPageNumbers(); track page){
                <button
                  (click)="onPageChange(page)"
                  [class]="
                    page === paginatedMeta()!.currentPage
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                  "
                  class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors border"
                >
                  {{ page }}
                </button>
                }
              </div>

              <!-- Botão Próximo -->
              <button
                (click)="onPageChange(paginatedMeta()!.currentPage + 1)"
                [disabled]="
                  paginatedMeta()!.currentPage === paginatedMeta()!.totalPages
                "
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Próximo
              </button>

              <!-- Info de páginas -->
              <span class="text-xs text-gray-500 ml-2 whitespace-nowrap">
                Página {{ paginatedMeta()!.currentPage }} de
                {{ paginatedMeta()!.totalPages }}
              </span>
            </div>
            }
          </div>
    `,
    host:{
      class: 'px-6 py-3 bg-gray-50 border-t border-gray-200'
    }
})
export class FooterPaginateComponent {
    paginatedMeta = input.required<PaginatedMeta | null>();
    pageChange: OutputEmitterRef<{ page?: number; limit?: number }> = output<{
        page?: number;
        limit?: number;
    }>();
    exibindo = computed(()=> this.paginatedMeta()?.perPage)
    total = computed(()=> this.paginatedMeta()?.total)

    onPageChange(page: number) {
        const meta = this.paginatedMeta();
        if (meta) {
            this.pageChange.emit({ page, limit: meta.perPage });
        }
    }

    getPageNumbers(): number[] {
        const meta = this.paginatedMeta();
        if (!meta) return [];

        const pages: number[] = [];
        const maxVisiblePages = 5;

        if (meta.totalPages <= maxVisiblePages) {
            for (let i = 1; i <= meta.totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let start = Math.max(1, meta.currentPage - halfVisible);
            let end = Math.min(meta.totalPages, start + maxVisiblePages - 1);

            if (end - start < maxVisiblePages - 1) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    }


}
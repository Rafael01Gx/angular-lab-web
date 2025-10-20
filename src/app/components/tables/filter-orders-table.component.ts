import { keyOfStatus, mapStatus, Status } from '../../shared/enums/status.enum';
import { Component, computed, effect, inject, input, model, output, OutputEmitterRef, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
  heroChevronRight,
  heroFunnel,
  heroXMark,
  heroMagnifyingGlass,
  heroChevronDown,
  heroChevronUp,
  heroPrinter
} from '@ng-icons/heroicons/outline';
import { PaginatedResponse, Querys } from '../../shared/interfaces/querys.interface';
import { IOrders } from '../../shared/interfaces/orders.interface';

import { debouncedSignal } from '../../shared/utils/debounced-signal';
import { IAmostra } from '../../shared/interfaces/amostra.interface';
import { LaudoAmostraService } from '../../services/laudo-pdf.service';

export interface IPaginateConfigAndFilters {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  advancedFilters?: Querys | null;
}

@Component({
  selector: 'app-filter-orders-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, DatePipe],
  viewProviders: [
    provideIcons({
      heroChevronLeft,
      heroChevronRight,
      heroFunnel,
      heroXMark,
      heroMagnifyingGlass,
      heroChevronDown,
      heroChevronUp,
      heroPrinter
    })
  ],
  template: `
    <div  class="h-full w-full bg-gradient-to-b from-blue-50/70 to-slate-50/50 p-0 rounded-sm flex flex-col">
      <!-- Cabeçalho com busca básica -->
       <div class="flex-1 flex flex-col min-h-0">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Ordens de Serviço</h2>
          <button
            (click)="toggleAdvancedFilters()"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ng-icon name="heroFunnel" size="20"></ng-icon>
            <span>Filtros Avançados</span>
            <ng-icon [name]="showAdvancedFilters() ? 'heroChevronUp' : 'heroChevronDown'" size="16"></ng-icon>
          </button>
        </div>

        <!-- Busca Básica -->
        <div class="relative">
          <ng-icon 
            name="heroMagnifyingGlass" 
            size="20" 
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          ></ng-icon>
          <input
            type="text"
            [(ngModel)]="basicSearch"
            placeholder="Buscar por número OS, solicitante..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Filtros Avançados (Expansível) -->
      @if (showAdvancedFilters()) {
        <div class="mb-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                [(ngModel)]="advancedFilters().status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option [ngValue]="undefined">Todos os status</option>
                @for (status of statusOptions; track status.value) {
                  <option [value]="status.value">{{ status.label }}</option>
                }
              </select>
            </div>

            <!-- Data Início -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                [(ngModel)]="advancedFilters().dataInicio"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Data Fim -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                [(ngModel)]="advancedFilters().dataFim"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Tipo de Análise
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Análise</label>
              <input
                type="text"
                [(ngModel)]="advancedFilters().tipoAnalise"
                placeholder="Ex: Físico-Química"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
                 -->
            <!-- Nome do Usuário  -->
            @if(filtroUsuario()){<div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Solicitante</label>
              <input
                type="text"
                [(ngModel)]="advancedFilters().solicitante"
                placeholder="Nome do solicitante"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>}
           
          </div> 

          <!-- Botões de ação dos filtros -->
          <div class="flex gap-3 mt-4">
            <button
              (click)="applyAdvancedFilters()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              (click)="clearAdvancedFilters()"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>

          <!-- Tags de filtros ativos -->
          @if (activeFiltersCount() > 0) {
            <div class="flex flex-wrap gap-2 mt-4">
              @for (filter of activeFiltersList(); track filter.key) {
                <span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {{ filter.label }}: {{ filter.value }}
                  <button
                    (click)="removeFilter(filter.key)"
                    class="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <ng-icon name="heroXMark" size="14"></ng-icon>
                  </button>
                </span>
              }
            </div>
          }
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex justify-center items-center py-12 bg-white flex-1">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }

      <!-- Tabela -->
      @if (!isLoading() && ordensFiltradas().length > 0) {
        <div class="flex-1 overflow-auto bg-white">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Número OS</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data OS</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Recepção</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Solicitante</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amostras</th> 
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Progresso</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Laudo</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              @for (ordem of ordensFiltradas(); track ordem.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ ordem.id }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ ordem.createdAt | date: 'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ ordem.dataRecepcao && (ordem.dataRecepcao | date: 'dd/MM/yyyy')|| "Não Recepcionado" }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ ordem.solicitante?.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 truncate">{{ getAmostrasName(ordem.amostras) }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(ordem.status!)">
                      {{ ordem.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          class="bg-blue-600 h-2 rounded-full transition-all"
                          [style.width.%]="ordem.progresso"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-600">{{ ordem.progresso }}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                      <button
                    (click)="imprimirLaudo(ordem, $event)"
                    class="inline-flex items-center px-3 py-1.5 button-gradient-blue"
                    [disabled]="ordem.progresso! < 100 "
                  > 
                    <ng-icon name="heroPrinter"/>
                  </button> 
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="flex items-center justify-between mt-2 px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            Mostrando {{ startItem() }} até {{ endItem() }} de {{ totalItems() }} resultados
          </div>
          
          <div class="flex items-center gap-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              [class.opacity-50]="currentPage() === 1"
              [class.cursor-not-allowed]="currentPage() === 1"
              class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:hover:bg-white"
            >
              <ng-icon name="heroChevronLeft" size="20"></ng-icon>
            </button>

            <div class="flex gap-1">
              @for (page of visiblePages(); track page) {
                @if (page === '...') {
                  <span class="px-3 py-2 text-gray-600">...</span>
                } @else {
                  <button
                    (click)="goToPage(page)"
                    [class.bg-blue-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.hover:bg-gray-50]="page !== currentPage()"
                    class="px-3 py-2 border border-gray-300 rounded-lg transition-colors"
                  >
                    {{ page }}
                  </button>
                }
              }
            </div>

            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              [class.opacity-50]="currentPage() === totalPages()"
              [class.cursor-not-allowed]="currentPage() === totalPages()"
              class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:hover:bg-white"
            >
              <ng-icon name="heroChevronRight" size="20"></ng-icon>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Itens por página:</label>
            <select
              [(ngModel)]="itemsPerPage"
              (ngModelChange)="onItemsPerPageChange()"
              class="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
        </div>
      }

      <!-- Estado Vazio -->
      @if (!isLoading() && ordensFiltradas().length === 0) {
        <div class="text-center py-12  bg-white min-h-0 flex-1 ">
          <ng-icon name="heroMagnifyingGlass" size="48" class="text-gray-400 mb-4"></ng-icon>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma amostra encontrada</h3>
          <p class="text-gray-600">Tente ajustar os filtros de busca ou ultilize o filtro avançado.</p>
        </div> 
      }</div>
    </div>
  `,
  styles: []
})
export class FilterOrdersTableComponent {
#laudoAmostraService = inject(LaudoAmostraService);
  filtroUsuario = input<boolean>(true)
  configAndFilters: OutputEmitterRef<IPaginateConfigAndFilters> = output<IPaginateConfigAndFilters>();
  data = input<PaginatedResponse<IOrders[]>|null>();
  ordensFiltradas = signal<IOrders[]>([]);
  isLoading = input<boolean>(false);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);
  showAdvancedFilters = signal(false);
  basicSearch = signal('');
  advancedFilters = signal<Querys>({});
  buscaDebounced = debouncedSignal(this.basicSearch, 400);

  config = computed<IPaginateConfigAndFilters>(() => {
    return {
      currentPage: this.currentPage(),
      itemsPerPage: this.itemsPerPage(),
      totalItems: this.totalItems(),
      totalPages: this.totalPages(),
      advancedFilters: this.advancedFilters(),
    }
  })

  constructor() {
    effect(() => {
      const valor = this.buscaDebounced().toLowerCase();
      const filtro = this.data()?.data.filter((o) => o.numeroOs?.toLowerCase().includes(valor) || o.solicitante?.name?.toLowerCase().includes(valor))
      valor.length > 0 ? this.ordensFiltradas.set(filtro!) : this.ordensFiltradas.set(this.data()?.data!);
    });
    effect(() => {
      if (this.data()) {
        this.currentPage.set(this.data()?.meta.currentPage!)
        this.totalItems.set(this.data()?.meta.total!)
        this.totalPages.set(this.data()?.meta.totalPages!)
      }
    })
  }



  statusOptions = [
    { value: keyOfStatus(Status.AGUARDANDO), label: 'Aguardando Autorização' },
    { value: keyOfStatus(Status.AUTORIZADA), label: 'Autorizada' },
    { value: keyOfStatus(Status.EXECUCAO), label: 'Em Execução' },
    { value: keyOfStatus(Status.FINALIZADA), label: 'Finalizada' },
    { value: keyOfStatus(Status.CANCELADA), label: 'Cancelada' }
  ];

  startItem = computed(() => {
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  endItem = computed(() => {
    const end = this.currentPage() * this.itemsPerPage();
    return Math.min(end, this.totalItems());
  });

  visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  });

  activeFiltersCount = computed(() => {
    const filters = this.advancedFilters();
    let count = 0;
    if (filters.status) count++;
    if (filters.dataInicio) count++;
    if (filters.dataFim) count++;
    if (filters.solicitante) count++;
    // if (filters.userName) count++;
    return count;
  });

  activeFiltersList = computed(() => {
    const filters = this.advancedFilters();
    const list: Array<{ key: string, label: string, value: string }> = [];

    if (filters.status) {
      list.push({ key: 'status', label: 'Status', value: filters.status });
    }
    if (filters.dataInicio) {
      list.push({ key: 'dataInicio', label: 'Data Início', value: filters.dataInicio });
    }
    if (filters.dataFim) {
      list.push({ key: 'dataFim', label: 'Data Fim', value: filters.dataFim });
    }
    if (filters.solicitante) {
      list.push({ key: 'solicitante', label: 'Solicitante', value: filters.solicitante });
    }
    // if (filters.userName) {
    //   list.push({ key: 'userName', label: 'solicitante', value: filters.userName });
    // }

    return list;
  });

  toggleAdvancedFilters() {
    this.showAdvancedFilters.update(v => !v);
  }


  applyAdvancedFilters() {
    this.currentPage.set(1);
    this.configAndFilters.emit(this.config());
  }

  clearAdvancedFilters() {
    this.advancedFilters.set({});
    this.currentPage.set(1);
    this.configAndFilters.emit(this.config());
  }

  removeFilter(key: string) {
    const filters = { ...this.advancedFilters() };
    delete filters[key as keyof Querys];
    this.advancedFilters.set(filters);
    this.currentPage.set(1);
    this.configAndFilters.emit(this.config());
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(v => v - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(v => v + 1);
    }
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage()) {
      this.currentPage.set(page);
    }
  }

  onItemsPerPageChange() {
    this.currentPage.set(1);
    this.configAndFilters.emit(this.config());
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  getStatusClass(status: Status): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium ';
    status = mapStatus(status)
    switch (status) {
      case Status.AGUARDANDO:
        return baseClasses + 'bg-yellow-100 text-yellow-800';
      case Status.AUTORIZADA:
        return baseClasses + 'bg-blue-100 text-blue-800';
      case Status.EXECUCAO:
        return baseClasses + 'bg-purple-100 text-purple-800';
      case Status.FINALIZADA:
        return baseClasses + 'bg-green-100 text-green-800';
      case Status.CANCELADA:
        return baseClasses + 'bg-red-100 text-red-800';
      default:
        return baseClasses + 'bg-gray-100 text-gray-800';
    }
  }

async imprimirLaudo(ordem: IOrders, event: Event) {
  event.stopPropagation();
  if (!ordem) return;

  for (const amostra of ordem.amostras) {
    await this.#laudoAmostraService.generateLaudoPdf(amostra);
  }
}
  getAmostrasName(amostras: IAmostra[]): string {
    return amostras.flatMap(a => a.nomeAmostra).toString()
  }

}
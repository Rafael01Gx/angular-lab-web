// analise-externa.component.ts
import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroChevronDown, 
  heroChevronUp, 
  heroFunnel,
  heroArrowDownTray,
  heroChevronLeft,
  heroChevronRight
} from '@ng-icons/heroicons/outline';
import * as XLSX from 'xlsx';

interface ElementoAnalisado {
  valor: string;
  unidade: string;
  elemento: string;
}

interface Laboratorio {
  id: number;
  nome: string;
  endereco: {
    cidade: string;
    estado: string;
  };
}

interface RemessaLabExterno {
  data: string;
  destino: Laboratorio;
}

interface AmostraAnalise {
  id: number;
  amostraName: string;
  subIdentificacao: string;
  dataInicio: string;
  dataFim: string;
  elementosSolicitados: string[];
  elementosAnalisados: ElementoAnalisado[];
  analiseConcluida: boolean;
  RemessaLabExterno: RemessaLabExterno;
}

interface AmostraAnaliseExternaQuery {
  analiseConcluida?: boolean;
  dataInicio?: string;
  dataFim?: string;
  amostraName?: string;
  labExternoId?: number;
  page?: number;
  limit?: number;
}

interface ApiResponse {
  data: AmostraAnalise[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
    elements: string[];
  };
}

@Component({
  selector: 'app-resultado-externo-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({ 
      heroChevronDown, 
      heroChevronUp, 
      heroFunnel,
      heroArrowDownTray,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  template: `
    <div class="h-full flex flex-col gap-4">
      <!-- Header com Filtros -->
      <div class="bg-white rounded-lg shadow-sm border border-zinc-300">
        <div class="p-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-zinc-800">Análises Externas</h2>
          <div class="flex gap-2">
            <button
              (click)="toggleFilters()"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ng-icon name="heroFunnel" size="20"></ng-icon>
              <span>Filtros</span>
              <ng-icon 
                [name]="showFilters() ? 'heroChevronUp' : 'heroChevronDown'" 
                size="16"
              ></ng-icon>
            </button>
            <button
              (click)="exportToExcel()"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ng-icon name="heroArrowDownTray" size="20"></ng-icon>
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <!-- Filtros Avançados -->
        @if (showFilters()) {
          <div class="border-t border-zinc-200 p-4 bg-zinc-50">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Nome da Amostra
                </label>
                <input
                  type="text"
                  [(ngModel)]="filters().amostraName"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Buscar amostra..."
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Laboratório
                </label>
                <select
                  [(ngModel)]="filters().labExternoId"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option [value]="undefined">Todos</option>
                  @for (lab of laboratorios(); track lab.id) {
                    <option [value]="lab.id">{{ lab.nome }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  [(ngModel)]="filters().dataInicio"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  [(ngModel)]="filters().dataFim"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Status
                </label>
                <select
                  [(ngModel)]="filters().analiseConcluida"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option [value]="undefined">Todos</option>
                  <option [value]="true">Concluída</option>
                  <option [value]="false">Pendente</option>
                </select>
              </div>

              <div class="md:col-span-2 lg:col-span-3 flex items-end gap-2">
                <button
                  (click)="clearFilters()"
                  class="px-4 py-2 text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  Limpar Filtros
                </button>
                <button
                  (click)="applyFilters()"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Tabela -->
      <div class="flex-1 bg-white rounded-lg shadow-sm border border-zinc-300 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-auto">
          <table class="w-full">
            <thead class="bg-zinc-100 sticky top-0 z-10">
              <tr>
                <th rowspan="2" class="px-4 py-3 text-left text-sm font-semibold text-zinc-700 border-b border-zinc-300">
                  Amostra
                </th>
                <th rowspan="2" class="px-4 py-3 text-left text-sm font-semibold text-zinc-700 border-b border-zinc-300">
                  Sub ID
                </th>
                <th rowspan="2" class="px-4 py-3 text-left text-sm font-semibold text-zinc-700 border-b border-zinc-300">
                  Período
                </th>
                <th rowspan="2" class="px-4 py-3 text-left text-sm font-semibold text-zinc-700 border-b border-zinc-300">
                  Laboratório
                </th>
                @for (element of elements(); track element) {
                  <th class="px-4 py-2 text-center text-sm font-semibold text-zinc-700 border-b-0 border-l border-zinc-300 whitespace-nowrap">
                    {{ element }}
                  </th>
                }
              </tr>
              <tr>
                @for (element of elements(); track element) {
                  <th class="px-4 py-1 text-center text-xs font-medium text-zinc-500 border-b border-l border-zinc-300">
                    %
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (amostra of paginatedData(); track amostra.id) {
                <tr class="hover:bg-zinc-50 transition-colors">
                  <td class="px-4 py-3 text-sm text-zinc-900 border-b border-zinc-200">
                    {{ amostra.amostraName }}
                  </td>
                  <td class="px-4 py-3 text-sm text-zinc-600 border-b border-zinc-200">
                    {{ amostra.subIdentificacao || '-' }}
                  </td>
                  <td class="px-4 py-3 text-sm text-zinc-600 border-b border-zinc-200 whitespace-nowrap">
                    {{ formatDate(amostra.dataInicio) }} à {{ formatDate(amostra.dataFim) }}
                  </td>
                  <td class="px-4 py-3 text-sm text-zinc-600 border-b border-zinc-200">
                    {{ amostra.RemessaLabExterno.destino.nome }}
                  </td>
                  @for (element of elements(); track element) {
                    <td class="px-4 py-3 text-sm text-zinc-900 border-b border-l border-zinc-200 text-center">
                      {{ getElementValue(amostra, element) }}
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td [attr.colspan]="elements().length + 4" class="px-4 py-8 text-center text-zinc-500">
                    Nenhum resultado encontrado
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="border-t border-zinc-200 px-4 py-3 flex items-center justify-between bg-zinc-50">
          <div class="flex items-center gap-2">
            <span class="text-sm text-zinc-700">Itens por página:</span>
            <select
              [(ngModel)]="filters().limit"
              (ngModelChange)="changeLimit()"
              class="px-3 py-1 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm text-zinc-700">
              Página {{ currentPage() }} de {{ totalPages() }} 
              ({{ totalItems() }} itens)
            </span>
            <div class="flex gap-1">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="p-2 border border-zinc-300 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ng-icon name="heroChevronLeft" size="20"></ng-icon>
              </button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="p-2 border border-zinc-300 rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ng-icon name="heroChevronRight" size="20"></ng-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ResultadoExternoTableComponent {
  // Signals
  showFilters = signal(false);
  mockData = signal<ApiResponse>(this.getMockData());
  filters = signal<AmostraAnaliseExternaQuery>({
    page: 1,
    limit: 10
  });

  // Computed signals
  elements = computed(() => this.mockData().meta.elements);
  currentPage = computed(() => this.mockData().meta.currentPage);
  totalPages = computed(() => this.mockData().meta.totalPages);
  totalItems = computed(() => this.mockData().meta.total);
  paginatedData = computed(() => this.mockData().data);
  
  laboratorios = computed(() => [
    {
      id: 1,
      nome: 'SENAI / FIEMG',
      endereco: { cidade: 'Belo Horizonte', estado: 'MG' }
    },
    {
      id: 2,
      nome: 'SGS DO BRASIL',
      endereco: { cidade: 'Vespasiano', estado: 'MG' }
    }
  ]);

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  applyFilters() {
    // Aqui você chamará seu service
    // this.service.getAnalises(this.filters()).subscribe(...)
    console.log('Aplicando filtros:', this.filters());
  }

  clearFilters() {
    this.filters.set({
      page: 1,
      limit: this.filters().limit || 10
    });
    this.applyFilters();
  }

  changeLimit() {
    this.filters.update(f => ({ ...f, page: 1 }));
    this.applyFilters();
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.filters.update(f => ({ ...f, page: f.page! - 1 }));
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.filters.update(f => ({ ...f, page: f.page! + 1 }));
      this.applyFilters();
    }
  }

  getElementValue(amostra: AmostraAnalise, element: string): string {
    const elem = amostra.elementosAnalisados.find(e => e.elemento === element);
    if (!elem) return '-';
    
    // Remove símbolos < e >
    let valor = elem.valor.replace(/[<>]/g, '');
    
    // Substitui vírgula por ponto para conversão numérica
    valor = valor.replace(',', '.');
    
    const numericValue = parseFloat(valor);
    
    // Se não for um número válido, retorna o valor original
    if (isNaN(numericValue)) return elem.valor;
    
    // Se a unidade for ppm, divide por 10000 para converter para %
    if (elem.unidade.toLowerCase() === 'ppm') {
      const converted = numericValue / 10000;
      return converted.toFixed(4);
    }
    
    // Caso contrário, retorna o valor como está (já em %)
    return numericValue.toString();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  exportToExcel() {
    const data = this.paginatedData().map(amostra => {
      const row: any = {
        'Amostra': amostra.amostraName,
        'Sub ID': amostra.subIdentificacao || '-',
        'Data Início': this.formatDate(amostra.dataInicio),
        'Data Fim': this.formatDate(amostra.dataFim),
        'Laboratório': amostra.RemessaLabExterno.destino.nome,
        'Cidade': amostra.RemessaLabExterno.destino.endereco.cidade,
        'Estado': amostra.RemessaLabExterno.destino.endereco.estado
      };

      this.elements().forEach(element => {
        row[element] = this.getElementValue(amostra, element);
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajustar largura das colunas
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Análises Externas');
    
    const fileName = `analises_externas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  getMockData(): ApiResponse {
    return {
      data: [
        {
          id: 13,
          amostraName: "Coque Interno",
          subIdentificacao: "",
          dataInicio: "2025-10-27",
          dataFim: "2025-10-27",
          elementosSolicitados: ["Cz", "Fe", "SiO₂", "CaO", "Al₂O₃", "MgO", "K₂O", "Na₂O", "Zn", "P", "S"],
          elementosAnalisados: [
            { valor: "19", unidade: "ppm", elemento: "Zn" },
            { valor: "0,01", unidade: "%", elemento: "S" },
            { valor: "56,51", unidade: "%", elemento: "Fe" },
            { valor: "1,24", unidade: "%", elemento: "FeO" },
            { valor: "2,07", unidade: "%", elemento: "Al2O3" },
            { valor: "0,13", unidade: "%", elemento: "CaO" },
            { valor: "0,03", unidade: "%", elemento: "Cr2O3" },
            { valor: "80,4", unidade: "%", elemento: "Fe2O3" },
            { valor: "<0,01", unidade: "%", elemento: "K2O" },
            { valor: "<0,1", unidade: "%", elemento: "MgO" },
            { valor: "0,042", unidade: "%", elemento: "Mn" },
            { valor: "<0,1", unidade: "%", elemento: "Na2O" },
            { valor: "0,084", unidade: "%", elemento: "P" },
            { valor: "14,7", unidade: "%", elemento: "SiO2" },
            { valor: "0,07", unidade: "%", elemento: "TiO2" },
            { valor: "99,97", unidade: "%", elemento: "SOMA" },
            { valor: "2,23", unidade: "%", elemento: "LOI" }
          ],
          analiseConcluida: true,
          RemessaLabExterno: {
            data: "2025-10-24T00:00:00.000Z",
            destino: {
              id: 1,
              nome: "SENAI / FIEMG",
              endereco: { cidade: "Belo Horizonte", estado: "MG" }
            }
          }
        },
        {
          id: 11,
          amostraName: "Minério de Ferro SFCON",
          subIdentificacao: "",
          dataInicio: "2025-10-27",
          dataFim: "2025-10-27",
          elementosSolicitados: ["Fe", "SiO₂", "FeO", "Fe₂O₃", "CaO", "Al₂O₃", "MgO", "K₂O", "Na₂O", "Zn", "Cr", "Mn", "PPC", "P", "TiO₂", "S"],
          elementosAnalisados: [
            { valor: "23", unidade: "ppm", elemento: "Zn" },
            { valor: "0,009", unidade: "%", elemento: "S" },
            { valor: "53,48", unidade: "%", elemento: "Fe" },
            { valor: "1,67", unidade: "%", elemento: "FeO" },
            { valor: "2,06", unidade: "%", elemento: "Al2O3" },
            { valor: "0,42", unidade: "%", elemento: "CaO" },
            { valor: "0,03", unidade: "%", elemento: "Cr2O3" },
            { valor: "76,5", unidade: "%", elemento: "Fe2O3" },
            { valor: "0,02", unidade: "%", elemento: "K2O" },
            { valor: "0,11", unidade: "%", elemento: "MgO" },
            { valor: "0,062", unidade: "%", elemento: "Mn" },
            { valor: "<0,1", unidade: "%", elemento: "Na2O" },
            { valor: "0,044", unidade: "%", elemento: "P" },
            { valor: "18,7", unidade: "%", elemento: "SiO2" },
            { valor: "0,08", unidade: "%", elemento: "TiO2" },
            { valor: "99,92", unidade: "%", elemento: "SOMA" },
            { valor: "1,82", unidade: "%", elemento: "LOI" }
          ],
          analiseConcluida: true,
          RemessaLabExterno: {
            data: "2025-10-16T00:00:00.000Z",
            destino: {
              id: 2,
              nome: "SGS DO BRASIL",
              endereco: { cidade: "Vespasiano", estado: "MG" }
            }
          }
        }
      ],
      meta: {
        total: 5,
        totalPages: 3,
        currentPage: 1,
        perPage: 2,
        elements: ["Zn", "S", "Fe", "FeO", "Al2O3", "CaO", "Cr2O3", "Fe2O3", "K2O", "MgO", "Mn", "Na2O", "P", "SiO2", "TiO2", "SOMA", "LOI"]
      }
    };
  }
}
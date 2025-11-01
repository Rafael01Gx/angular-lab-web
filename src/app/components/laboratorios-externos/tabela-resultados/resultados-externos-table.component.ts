import { Component, signal, computed, effect, OnInit, inject, TransferState, makeStateKey, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
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
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { AmostraAnaliseExterna, AmostraAnaliseExternaQuery } from '../../../shared/interfaces/amostra-analise-externa.interfaces';
import { PaginatedResponse } from '../../../shared/interfaces/querys.interface';
import { AmostraLabExternoService } from '../../../services/amostras-analises-externas.service';
import { tap } from 'rxjs';
import { LabsLabExternosService } from '../../../services/labs-lab-externos.service';
import { Laboratorio } from '../../../shared/interfaces/laboratorios-externos.interfaces';

const AMOSTRA_META_KEY = makeStateKey<PaginatedResponse<AmostraAnaliseExterna[]>>("resultado-externo-table-meta");
const LABS_KEY = makeStateKey<Laboratorio[]>("resultado-externo-labs");

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
    <div class="h-full flex flex-col gap-2">
      <!-- Header -->
      <div class="bg-white rounded-md shadow-sm border border-zinc-300">
        <div class="p-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Análises Externas</h2>
          <div class="flex gap-2">
            <button
              (click)="exportToExcel()"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <ng-icon name="heroArrowDownTray" size="20"></ng-icon>
            </button>

            <button
              (click)="toggleFilters()"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-700/80 transition-colors"
            >
              <ng-icon name="heroFunnel" size="20"></ng-icon>
              <span>Filtros</span>
              <ng-icon 
                [name]="showFilters() ? 'heroChevronUp' : 'heroChevronDown'" 
                size="16"
              ></ng-icon>
            </button>
          </div>
        </div>

        <!-- Filtros Avançados -->
        @if (showFilters()) {
          <div class="border-t border-zinc-200 p-4 bg-zinc-50">
            <div class="flex justify-between items-center gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Nome da Amostra
                </label>
                <input
                  type="text"
                  [(ngModel)]="filters().amostraName"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500/80 focus:border-transparent"
                  placeholder="Buscar amostra..."
                />
              </div>

              <div class="flex-1">
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Laboratório
                </label>
                <select
                  [(ngModel)]="filters().labExternoId"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500/80 focus:border-transparent"
                >
                  <option [value]="undefined">Todos</option>
                  @for (lab of laboratorios(); track lab.id) {
                    <option [value]="lab.id">{{ lab.nome }}</option>
                  }
                </select>
              </div>

              <div class="flex-1">
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Data Início (Remessa)
                </label>
                <input
                  type="date"
                  [(ngModel)]="filters().dataInicio"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500/80 focus:border-transparent"
                />
              </div>

              <div class="flex-1">
                <label class="block text-sm font-medium text-zinc-700 mb-1">
                  Data Fim (Remessa)
                </label>
                <input
                  type="date"
                  [(ngModel)]="filters().dataFim"
                  class="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-blue-500/80 focus:border-transparent"
                />
              </div>

              <div class="flex-1 flex items-end justify-end items-center gap-2">
                <button
                  (click)="clearFilters()"
                  class="px-4 py-2 mt-4 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors font-medium"
                >
                  Limpar
                </button>
                <button
                  (click)="applyFilters()"
                  class="px-4 py-2 mt-4 bg-blue-600/80 text-white rounded-md hover:bg-blue-700/80 transition-colors font-medium"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Tabela -->
      <div class="flex-1 bg-white rounded-md shadow-lg border border-zinc-300 flex flex-col overflow-hidden min-h-0">
        <div class="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-zinc-100 min-h-0">
          <div class="overflow-x-auto h-full">
            <table class="w-full min-w-max">
              <thead class="bg-gradient-to-r from-blue-600/80 to-blue-700/80 sticky top-0 z-10 shadow-md">
                <tr>
                  <th rowspan="2" class="px-4 py-2 text-left text-sm font-bold text-white border-r border-blue-500 min-w-[200px]">
                    <div class="flex items-center gap-2">
                      <span>Amostra</span>
                    </div>
                  </th>
                  <th rowspan="2" class="table-th min-w-[120px]">
                    Sub ID
                  </th>
                  <th rowspan="2" class="table-th min-w-[180px]">
                    Período
                  </th>
                  <th rowspan="2" class="table-th min-w-[200px]">
                    Laboratório
                  </th>
                  <th rowspan="2" class="table-th min-w-[180px]">
                   Data/Remessa
                 </th>
                  @for (element of elements(); track element) {
                    <th class="table-th-t-center whitespace-nowrap min-w-[100px]">
                      {{ element }}
                    </th>
                  }
                </tr>
                <tr>
                  @for (element of elements(); track element) {
                    <th class="px-4 text-center text-xs font-semibold text-blue-100 border-r border-blue-500 ">
                      %
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200">
                @for (amostra of paginatedData(); track amostra.id; let idx = $index) {
                  <tr class="group hover:bg-blue-50 transition-all duration-200 border-b border-zinc-200 ease-in-out" [class.bg-zinc-50]="idx % 2 === 0">
                    <td class="px-4 py-2 text-sm font-semibold text-zinc-900 border-r border-zinc-200 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                        {{ amostra.amostraName }}
                      </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-zinc-600 border-r border-zinc-200 whitespace-nowrap">
                      <span class="text-zinc-400 italic">{{ amostra.subIdentificacao || 'N/A' }}</span>
                    </td>
                    <td class="px-4 py-2 text-sm text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                      <div class="flex items-center gap-1">
                        <span class="font-medium">{{ formatDate(amostra.dataInicio) }}</span>
                        <span class="text-zinc-400">→</span>
                        <span class="font-medium">{{ formatDate(amostra.dataFim) }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                      <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span class="font-medium">{{ amostra.RemessaLabExterno.destino.nome }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-zinc-700 border-r border-zinc-200 whitespace-nowrap">
                    <div class="flex items-center gap-1">
                      <span class="font-medium">{{ formatDate(amostra.RemessaLabExterno.data) }}</span>
                    </div>
                  </td>
                    @for (element of elements(); track element) {
                      <td class="px-4 py-4 text-sm font-mono text-zinc-900 border-r border-zinc-200 text-center whitespace-nowrap bg-white group-hover:bg-blue-50/50 transition-colors">
                        <span class="inline-block px-2 py-1 rounded bg-zinc-100 group-hover:bg-blue-100 transition-colors">
                          {{ getElementValue(amostra, element) }}
                        </span>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="elements().length + 4" class="px-6 py-16 text-center">
                      <div class="flex flex-col items-center gap-3">
                        <div class="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                          <svg class="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-zinc-600 font-medium">Nenhum resultado encontrado</p>
                          <p class="text-sm text-zinc-400 mt-1">Tente ajustar os filtros de busca</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginação -->
        <div class="border-t border-zinc-200 px-4 py-2 flex items-center justify-between bg-gradient-to-r from-zinc-50 to-zinc-100">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-zinc-700">Itens por página:</span>
            <select
              [(ngModel)]="filters().limit"
              (ngModelChange)="changeLimit()"
              class="input-primary"
            >
              <option [value]="5">5</option>
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>

          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-zinc-700">
              Página <span class="text-blue-600 font-bold">{{ currentPage() }}</span> de 
              <span class="font-bold">{{ totalPages() }}</span> 
              <span class="text-zinc-500 ml-2">({{ totalItems() }} itens)</span>
            </span>
            <div class="flex gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="p-2 border-2 border-zinc-300 rounded-md hover:bg-blue-50 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-zinc-300 transition-all duration-200 shadow-sm"
              >
                <ng-icon name="heroChevronLeft" size="20" class="text-zinc-700"></ng-icon>
              </button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="p-2 border-2 border-zinc-300 rounded-md hover:bg-blue-50 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-zinc-300 transition-all duration-200 shadow-sm"
              >
                <ng-icon name="heroChevronRight" size="20" class="text-zinc-700"></ng-icon>
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

    /* Custom Scrollbar */
    .scrollbar-thin::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .scrollbar-thin::-webkit-scrollbar-track {
      background: #f4f4f5;
      border-radius: 4px;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #a1a1aa;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: #71717a;
    }

    .scrollbar-thumb-zinc-400::-webkit-scrollbar-thumb {
      background: #a1a1aa;
    }

    .scrollbar-track-zinc-100::-webkit-scrollbar-track {
      background: #f4f4f5;
    }
  `]
})
export class ResultadoExternoTableComponent implements OnInit {
  #amostraLabExternoService = inject(AmostraLabExternoService);
  #labsLabExternosService = inject(LabsLabExternosService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID)
  showFilters = signal(false);
  data = signal<PaginatedResponse<AmostraAnaliseExterna[]> | null>(null);
  filters = signal<AmostraAnaliseExternaQuery>({
    page: 1,
    limit: 50
  });

  elements = computed(() => this.data()?.meta.elements as [] ?? []);
  currentPage = computed(() => this.data()?.meta.currentPage as number);
  totalPages = computed(() => this.data()?.meta.totalPages as number);
  totalItems = computed(() => this.data()?.meta.total as number);
  paginatedData = computed(() => this.data()?.data as AmostraAnaliseExterna[]);

  laboratorios = signal<Laboratorio[] | null>(null);

  ngOnInit(): void {
    const amostraKeyMetaData = this.#transferState.get(AMOSTRA_META_KEY, null)
    const labsKey = this.#transferState.get(LABS_KEY, null)
    if (amostraKeyMetaData && isPlatformBrowser(this.#platformId)) {
      this.data.set(amostraKeyMetaData)
      return;
    } else {
    this.loadAmostraData()
    }
    if(labsKey && isPlatformBrowser(this.#platformId)){
      this.laboratorios.set(labsKey);
    }
    else{this.loadLabs()
    }
  }

  loadAmostraData() {
    this.#amostraLabExternoService.findAllWithResults(this.filters()).pipe(tap((data) => {
      if (isPlatformServer(this.#platformId) && data) {
        this.#transferState.set(AMOSTRA_META_KEY, data);
      }
    })).subscribe({
      next: (metaData) => {
        this.data.set(metaData)
      }
    })
  }

  loadLabs() {
    this.#labsLabExternosService.findAll().pipe(tap((data) => {
      if (isPlatformServer(this.#platformId) && data) {
        this.#transferState.set(LABS_KEY, data);
      }
    })).subscribe({
      next: (labs) => {
        this.laboratorios.set(labs)
      }
    })
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  applyFilters() {
    this.loadAmostraData();
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

  getElementValue(amostra: AmostraAnaliseExterna, element: string): string {
    const elem = amostra.elementosAnalisados?.find(e => e.elemento === element);
    if (!elem) return '-';

    // Remove símbolos < e >
    let valor = elem.valor.replace(/[<>]/g, '');

    // Substitui vírgula por ponto para conversão numérica
    valor = valor.replace(',', '.');

    const numericValue = parseFloat(valor);

    if (isNaN(numericValue)) return elem.valor;

    if (elem.unidade?.toLowerCase() === 'ppm') {
      const converted = numericValue / 10000;
      return converted.toFixed(4);
    }

    return numericValue.toString();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

async exportToExcel(): Promise<void> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Análises Externas');

  // 📋 Montar os dados dinamicamente
  const data = this.paginatedData().map((amostra) => {
    const row: any = {
      Amostra: amostra.amostraName,
      'Sub ID': amostra.subIdentificacao || '-',
      'Data Início': this.formatDate(amostra.dataInicio),
      'Data Fim': this.formatDate(amostra.dataFim),
      Laboratório: amostra.RemessaLabExterno.destino.nome,
    };

    // Adiciona os elementos dinâmicos (ex: K2O, Na2O, Zn...)
    this.elements()?.forEach((element) => {
      row[element] = this.getElementValue(amostra, element);
    });

    return row;
  });

  if (!data.length) {
    console.warn('Nenhum dado para exportar.');
    return;
  }

  // 🧱 Define as colunas automaticamente
  const columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key,
    width: Math.max(key.length, 15),
  }));

  sheet.columns = columns;

  // 🧾 Adiciona os dados
  sheet.addRows(data);

  // 🎨 Estiliza o cabeçalho
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '007BFF' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
    };
  });

  // 🔢 Formata colunas numéricas automaticamente (K2O, Na2O, Zn, etc.)
  const numericColumns = this.elements?.() || [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // pula cabeçalho
    numericColumns.forEach((colName) => {
      const cell = row.getCell(colName);
      if (!isNaN(Number(cell.value))) {
        cell.numFmt = '0.00'; // exibe duas casas decimais
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // 🧩 Ajusta largura das colunas (mantendo largura mínima)
  sheet.columns.forEach((column) => {
    column.width = Math.max(15, column.header?.toString().length || 10);
  });

  // 💾 Exporta arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer]),
    `analises_externas_${new Date().toISOString().split('T')[0]}.xlsx`
  );
}
}
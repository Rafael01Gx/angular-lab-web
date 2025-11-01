import {
  Component,
  OnInit,
  PLATFORM_ID,
  TransferState,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import {
  CommonModule,
  isPlatformBrowser,
  isPlatformServer,
} from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBeaker,
  heroChartBar,
  heroCheckCircle,
  heroXCircle,
  heroCalendar,
  heroArrowDownTray,
  heroFunnel,
  heroArrowTrendingUp,
  heroChevronDown,
  heroChevronUp,
} from '@ng-icons/heroicons/outline';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormsModule } from '@angular/forms';
import {
  AmostraAnaliseExterna,
  DashboardCompleto,
  LaboratorioDashboard,
  RemessaStatsDashboard,
} from '../../../shared/interfaces/amostra-analise-externa.interfaces';
import { AmostraLabExternoService } from '../../../services/amostras-analises-externas.service';
import { tap } from 'rxjs';

const DATA_AMOSTRA_KEY = makeStateKey<DashboardCompleto>(
  'analytics-dashboard-data'
);
@Component({
  selector: 'app-lab-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent, FormsModule],
  viewProviders: [
    provideIcons({
      heroBeaker,
      heroChartBar,
      heroCheckCircle,
      heroXCircle,
      heroCalendar,
      heroArrowDownTray,
      heroFunnel,
      heroArrowTrendingUp,
      heroChevronDown,
      heroChevronUp,
    }),
  ],
  template: `
    <div
      class="h-full w-full gap-2 bg-gradient-to-b from-blue-50/70 to-slate-50/50 p-0 rounded-sm flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class=" p-6 bg-white rounded-md">
        <div class="flex items-center justify-between">
          <div class="flex gap-2">
            <ng-icon
              name="heroBeaker"
              class="text-lg text-gray-600"
              size="24"
            ></ng-icon>
            <h2 class="text-lg font-semibold text-slate-700">
              Dashboard de Análises Laboratoriais
            </h2>
          </div>
          <div class="flex gap-2">
            <button
              (click)="exportToExcel()"
              class="flex items-center gap-2 px-5 py-3 bg-green-600/80 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ng-icon name="heroArrowDownTray" size="20"></ng-icon>
              <span class="font-medium">Exportar Excel</span>
            </button>
            <button
              (click)="exportToPDF()"
              class="flex items-center gap-2 px-5 py-3 bg-red-600/80 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ng-icon name="heroArrowDownTray" size="20"></ng-icon>
              <span class="font-medium">Exportar PDF</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-md shadow-lg px-6 flex flex-col gap-4 py-2 border border-slate-200">
        <div class="flex items-center gap-3">
          <ng-icon
            name="heroFunnel"
            class="text-indigo-600"
            size="18"
          ></ng-icon>
          <h2 class="text-md font-semibold text-slate-800">Filtros</h2>
          <button
            (click)="toggleFiltros()"
            class="flex items-center ml-auto gap-2 px-3 py-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors"
          >
            <ng-icon
              [name]="filtrosExpanded() ? 'heroChevronUp' : 'heroChevronDown'"
              size="16"
            ></ng-icon>
          </button>
        </div>
        <div
          [hidden]="!filtrosExpanded()"
          class="
            flex items-center gap-4 transition-all duration-300
          "
        >
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Laboratório</label
            >
            <select
              [ngModel]="selectedLab()"
              (ngModelChange)="setSelectedLab($event)"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Todos os Laboratórios</option>
              @for(lab of laboratorios(); track lab.id){
              <option [value]="lab.id">{{ lab.nome }}</option>
              }
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Data Início</label
            >
            <input
              type="date"
              [ngModel]="dateStart()"
              (ngModelChange)="setDateStart($event)"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700 mb-2"
              >Data Fim</label
            >
            <input
              type="date"
              [ngModel]="dateEnd()"
              (ngModelChange)="setDateEnd($event)"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Cards Principais -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="bg-gradient-to-br from-blue-600/80 to-blue-700/80 rounded-md shadow-lg p-6 text-white transform hover:scale-105 transition-transform"
        >
          <div class="flex items-center justify-between mb-4">
            <ng-icon name="heroChartBar" size="32" class="opacity-80"></ng-icon>
            <div class="text-3xl font-bold">{{ totalAmostras() }}</div>
          </div>
          <h3 class="text-lg font-semibold opacity-90">Total de Amostras</h3>
          <p class="text-sm opacity-75 mt-1">Todas as amostras registradas</p>
        </div>

        <div
          class="bg-gradient-to-br from-green-500/80 to-green-600/80 rounded-md shadow-lg p-6 text-white transform hover:scale-105 transition-transform"
        >
          <div class="flex items-center justify-between mb-4">
            <ng-icon
              name="heroCheckCircle"
              size="32"
              class="opacity-80"
            ></ng-icon>
            <div class="text-3xl font-bold">{{ amostrasCompletas() }}</div>
          </div>
          <h3 class="text-lg font-semibold opacity-90">Análises Concluídas</h3>
          <p class="text-sm opacity-75 mt-1">
            {{ percentualCompletas() }}% do total
          </p>
        </div>

        <div
          class="bg-gradient-to-br from-orange-500/80 to-orange-600/80 rounded-md shadow-lg p-6 text-white transform hover:scale-105 transition-transform"
        >
          <div class="flex items-center justify-between mb-4">
            <ng-icon name="heroXCircle" size="32" class="opacity-80"></ng-icon>
            <div class="text-3xl font-bold">{{ amostrasIncompletas() }}</div>
          </div>
          <h3 class="text-lg font-semibold opacity-90">Análises Pendentes</h3>
          <p class="text-sm opacity-75 mt-1">
            {{ percentualIncompletas() }}% do total
          </p>
        </div>

        <div
          class="bg-gradient-to-br from-purple-500/80 to-purple-600/80 rounded-md shadow-lg p-6 text-white transform hover:scale-105 transition-transform"
        >
          <div class="flex items-center justify-between mb-4">
            <ng-icon
              name="heroArrowTrendingUp"
              size="32"
              class="opacity-80"
            ></ng-icon>
            <div class="text-3xl font-bold">
              {{ mediaElementosPorAmostra() }}
            </div>
          </div>
          <h3 class="text-lg font-semibold opacity-90">Média de Elementos</h3>
          <p class="text-sm opacity-75 mt-1">Por amostra analisada</p>
        </div>
      </div>

      <div class="flex-1 flex min-h-0">
        <div class="flex-1 flex justify-around gap-2 overflow-hidden min-h-0">
          <!-- Análise por Laboratório -->
          <div
            class="flex-1 bg-white rounded-md shadow-md p-4 mb-2 border border-slate-200 min-h-0"
          >
            <h2
              class="text-md font-bold text-slate-800 mb-6 flex items-center gap-3"
            >
              <ng-icon
                name="heroBeaker"
                class="text-indigo-600"
                size="18"
              ></ng-icon>
              Análise por Laboratório
            </h2>
            <div class="w-full h-full overflow-y-auto min-h-0">
              <table class="w-full">
                <thead class="text-center bg-gray-50 sticky top-0 z-10">
                  <tr class="border-b-2 border-slate-200">
                    <th
                      class="text-left py-4 px-4 font-semibold text-slate-700"
                    >
                      Laboratório
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Total
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Concluídas
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Pendentes
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Taxa de Conclusão
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for(lab of laboratorios(); track lab.id){
                  <tr
                    class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td class="py-4 px-4">
                      <div class="font-medium text-slate-800">
                        {{ lab.nome }}
                      </div>
                    </td>
                    <td class="text-center py-4 px-4 text-slate-600">
                      {{ lab.totalAmostras }}
                    </td>
                    <td class="text-center py-4 px-4">
                      <span
                        class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                      >
                        <ng-icon name="heroCheckCircle" size="16"></ng-icon>
                        {{ lab.amostrasCompletas }}
                      </span>
                    </td>
                    <td class="text-center py-4 px-4">
                      <span
                        class="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium"
                      >
                        <ng-icon name="heroXCircle" size="16"></ng-icon>
                        {{ lab.amostrasIncompletas }}
                      </span>
                    </td>
                    <td class="text-center py-4 px-4">
                      <span class="font-semibold text-slate-700"
                        >{{ lab.taxaConclusao }}%</span
                      >
                    </td>
                    <td class="py-4 px-4">
                      <div
                        class="w-full bg-slate-200 rounded-full h-3 overflow-hidden"
                      >
                        <div
                          class="h-full rounded-full transition-all"
                          [ngClass]="{
                            'bg-green-500': lab.taxaConclusao >= 80,
                            'bg-yellow-500':
                              lab.taxaConclusao >= 50 && lab.taxaConclusao < 80,
                            'bg-red-500': lab.taxaConclusao < 50
                          }"
                          [style.width.%]="lab.taxaConclusao"
                        ></div>
                      </div>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Análise por Remessa -->
          <div
            class="flex-1 flex flex-col bg-white rounded-md shadow-md p-4 mb-2 border border-slate-200 min-h-0"
          >
            <h2
              class="text-md font-bold text-slate-800 mb-6 flex items-center gap-3"
            >
              <ng-icon
                name="heroCalendar"
                class="text-indigo-600"
                size="18"
              ></ng-icon>
              Análise por Remessa
            </h2>
            <div class="w-full h-full overflow-y-auto min-h-0">
              <table class="w-full">
                <thead class="text-center bg-gray-50 sticky top-0 z-10">
                  <tr class="border-b-2 border-slate-200">
                    <th
                      class="text-left py-4 px-4 font-semibold text-slate-700"
                    >
                      Data
                    </th>
                    <th
                      class="text-left py-4 px-4 font-semibold text-slate-700"
                    >
                      Laboratório
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Total
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Concluídas
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Pendentes
                    </th>
                    <th
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      Taxa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for(remessa of remessasStats(); track $index){
                  <tr
                    class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td class="py-4 px-4">
                      <span
                        class="inline-flex items-center gap-2 text-slate-700 font-medium"
                      >
                        <ng-icon
                          name="heroCalendar"
                          size="16"
                          class="text-indigo-600"
                        ></ng-icon>
                        {{ formatDate(remessa.data) }}
                      </span>
                    </td>
                    <td class="py-4 px-4 text-slate-800">
                      {{ remessa.laboratorio }}
                    </td>
                    <td class="text-center py-4 px-4 text-slate-600">
                      {{ remessa.totalAmostras }}
                    </td>
                    <td class="text-center py-4 px-4">
                      <span
                        class="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                      >
                        {{ remessa.amostrasCompletas }}
                      </span>
                    </td>
                    <td class="text-center py-4 px-4">
                      <span
                        class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium"
                      >
                        {{ remessa.amostrasIncompletas }}
                      </span>
                    </td>
                    <td
                      class="text-center py-4 px-4 font-semibold text-slate-700"
                    >
                      {{ remessa.taxaConclusao }}%
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class LabExternoDashboardComponent implements OnInit {
  #amostrasAnalisesExternasService = inject(AmostraLabExternoService);
  #tranferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  amostras = signal<AmostraAnaliseExterna[]>([]);
  filteredAmostras = signal<AmostraAnaliseExterna[]>([]);

  filtrosExpanded = signal<boolean>(false);

  selectedLab = signal<string>('');
  dateStart = signal<string>('');
  dateEnd = signal<string>('');

  totalAmostras = computed(() => this.filteredAmostras().length);

  amostrasCompletas = computed(
    () => this.filteredAmostras().filter((a) => a.analiseConcluida).length
  );

  amostrasIncompletas = computed(
    () => this.filteredAmostras().filter((a) => !a.analiseConcluida).length
  );

  percentualCompletas = computed(() =>
    this.totalAmostras() > 0
      ? Math.round((this.amostrasCompletas() / this.totalAmostras()) * 100)
      : 0
  );

  percentualIncompletas = computed(() =>
    this.totalAmostras() > 0
      ? Math.round((this.amostrasIncompletas() / this.totalAmostras()) * 100)
      : 0
  );

  mediaElementosPorAmostra = computed(() => {
    const total = this.filteredAmostras().reduce(
      (acc, a) => acc + a.elementosSolicitados.length,
      0
    );
    return this.totalAmostras() > 0
      ? (total / this.totalAmostras()).toFixed(1)
      : '0';
  });

  laboratorios = computed(() => {
    const labs = new Map<number, LaboratorioDashboard>();

    this.filteredAmostras().forEach((amostra) => {
      const labId = amostra.RemessaLabExterno.destino.id;
      const labNome = amostra.RemessaLabExterno.destino.nome;

      if (!labs.has(labId)) {
        labs.set(labId, {
          id: labId,
          nome: labNome,
          totalAmostras: 0,
          amostrasCompletas: 0,
          amostrasIncompletas: 0,
          taxaConclusao: 0,
        });
      }

      const lab = labs.get(labId)!;
      lab.totalAmostras++;
      if (amostra.analiseConcluida) {
        lab.amostrasCompletas++;
      } else {
        lab.amostrasIncompletas++;
      }
    });

    labs.forEach((lab) => {
      lab.taxaConclusao =
        lab.totalAmostras > 0
          ? Math.round((lab.amostrasCompletas / lab.totalAmostras) * 100)
          : 0;
    });

    return Array.from(labs.values()).sort(
      (a, b) => b.totalAmostras - a.totalAmostras
    );
  });

  remessasStats = computed(() => {
    const remessas = new Map<number, RemessaStatsDashboard>();

    this.filteredAmostras().forEach((amostra) => {
      const remessaId = amostra.remessaLabExternoId;

      if (!remessas.has(remessaId)) {
        remessas.set(remessaId, {
          remessaId,
          data: amostra.RemessaLabExterno.data,
          laboratorio: amostra.RemessaLabExterno.destino.nome,
          totalAmostras: 0,
          amostrasCompletas: 0,
          amostrasIncompletas: 0,
          taxaConclusao: 0,
        });
      }

      const remessa = remessas.get(remessaId)!;
      remessa.totalAmostras++;
      if (amostra.analiseConcluida) {
        remessa.amostrasCompletas++;
      } else {
        remessa.amostrasIncompletas++;
      }
    });

    remessas.forEach((remessa) => {
      remessa.taxaConclusao =
        remessa.totalAmostras > 0
          ? Math.round(
              (remessa.amostrasCompletas / remessa.totalAmostras) * 100
            )
          : 0;
    });

    return Array.from(remessas.values()).sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  });

  ngOnInit() {
    const dataAmostraKey = this.#tranferState.get(DATA_AMOSTRA_KEY, null);
    if (dataAmostraKey && isPlatformBrowser(this.#platformId)) {
      this.amostras.set(dataAmostraKey.amostras);
      this.filteredAmostras.set(dataAmostraKey.amostras);
      this.#tranferState.remove(DATA_AMOSTRA_KEY);
      return;
    }
    this.loadData();
  }

  loadData() {
    this.#amostrasAnalisesExternasService
      .getDashboardCompleto()
      .pipe(
        tap((data) => {
          if (data && isPlatformServer(this.#platformId)) {
            this.#tranferState.set(DATA_AMOSTRA_KEY, data);
          }
        })
      )
      .subscribe({
        next: (data) => {
          this.amostras.set(data.amostras);
          this.filteredAmostras.set(data.amostras);
        },
        error: (error) => {
          console.error('Erro ao carregar dados:', error);
        },
      });
  }

  applyFilters() {
    let filtered = this.amostras();

    if (this.selectedLab()) {
      filtered = filtered.filter(
        (a) => a.RemessaLabExterno.destino.id === parseInt(this.selectedLab())
      );
    }

    if (this.dateStart()) {
      filtered = filtered.filter(
        (a) => a.RemessaLabExterno.data >= this.dateStart()
      );
    }

    if (this.dateEnd()) {
      filtered = filtered.filter(
        (a) => a.RemessaLabExterno.data <= this.dateEnd()
      );
    }

    this.filteredAmostras.set(filtered);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

async exportToExcel() {
  const workbook = new Workbook();
  const date = new Date().toLocaleString('pt-BR');

  // 🧾 Sheet 1 - Visão Geral
  const ws1 = workbook.addWorksheet('Visão Geral');

  ws1.addRow(['Análises Laboratórios Externos']);
  ws1.addRow(['Data de Geração:', date]);
  ws1.addRow([
    'Período',
    this.dateStart() && this.dateEnd()
      ? new Date(this.dateStart()).toLocaleDateString('pt-BR') +
        ' até ' +
        new Date(this.dateEnd()).toLocaleDateString('pt-BR')
      : '',
  ]);
  ws1.addRow([]);
  ws1.addRow(['Métricas Gerais']);
  ws1.addRow(['Total de Amostras', this.totalAmostras()]);
  ws1.addRow(['Análises Concluídas', this.amostrasCompletas()]);
  ws1.addRow(['Análises Pendentes', this.amostrasIncompletas()]);
  ws1.addRow(['Percentual Concluído', `${this.percentualCompletas()}%`]);
  ws1.addRow(['Média de Elementos por Amostra', this.mediaElementosPorAmostra()]);

  // Estilo do título
  ws1.getCell('A1').font = { bold: true, size: 16, color: { argb: '004085' } };
  ws1.getRow(1).alignment = { horizontal: 'center' };
  ws1.mergeCells('A1:B1');
  ws1.getColumn(1).width = 35;
  ws1.getColumn(2).width = 30;

  // 📊 Sheet 2 - Por Laboratório
  const ws2 = workbook.addWorksheet('Por Laboratório');
  const labData = this.laboratorios().map((lab) => ({
    Laboratório: lab.nome,
    'Total Amostras': lab.totalAmostras,
    Concluídas: lab.amostrasCompletas,
    Pendentes: lab.amostrasIncompletas,
    'Taxa de Conclusão (%)': lab.taxaConclusao,
  }));

  ws2.columns = Object.keys(labData[0]).map((key) => ({ header: key, key, width: 22 }));
  ws2.addRows(labData);

  // Cabeçalho estilizado
  ws2.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '007BFF' },
    };
    cell.alignment = { horizontal: 'center' };
  });

  // 📅 Sheet 3 - Por Remessa
  const ws3 = workbook.addWorksheet('Por Remessa');
  const remessaData = this.remessasStats().map((r) => ({
    Data: this.formatDate(r.data),
    Laboratório: r.laboratorio,
    Total: r.totalAmostras,
    Concluídas: r.amostrasCompletas,
    Pendentes: r.amostrasIncompletas,
    'Taxa (%)': r.taxaConclusao,
  }));
  ws3.columns = Object.keys(remessaData[0]).map((key) => ({ header: key, key, width: 22 }));
  ws3.addRows(remessaData);

  ws3.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '28A745' },
    };
    cell.alignment = { horizontal: 'center' };
  });

  // 🧬 Sheet 4 - Detalhamento
  const ws4 = workbook.addWorksheet('Detalhamento Amostras');
  const amostrasDetalhadas = this.filteredAmostras().map((a) => ({
    ID: a.id,
    Nome: a.amostraName,
    'Sub-ID': a.subIdentificacao,
    'Data Início': this.formatDate(a.dataInicio),
    'Data Fim': this.formatDate(a.dataFim),
    Laboratório: a.RemessaLabExterno.destino.nome,
    'Data Remessa': this.formatDate(a.RemessaLabExterno.data),
    'Elementos Solicitados': a.elementosSolicitados.join(', '),
    'Qtd Elementos': a.elementosSolicitados.length,
    Status: a.analiseConcluida ? 'Concluída' : 'Pendente',
    'Criado em': new Date(a.createdAt).toLocaleString('pt-BR'),
    'Atualizado em': new Date(a.updatedAt).toLocaleString('pt-BR'),
  }));

  ws4.columns = Object.keys(amostrasDetalhadas[0]).map((key) => ({
    header: key,
    key,
    width: 25,
  }));
  ws4.addRows(amostrasDetalhadas);

  // Cabeçalho com cor diferente
  ws4.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '6C757D' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Colorir status (verde/vermelho)
  ws4.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const statusCell = row.getCell('Status');
    if (statusCell.value === 'Concluída') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'C3E6CB' },
      };
    } else if (statusCell.value === 'Pendente') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F5C6CB' },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `relatorio-analises-laboratoriais-${new Date().toISOString().split('T')[0]}.xlsx`);
}

  exportToPDF() {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138); // Indigo
    doc.text('Análises Laboratórios Externos', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 27);
    if (this.dateStart() && this.dateEnd()) {
      doc.text(
        `Período - ${
          new Date(this.dateStart()).toLocaleString('pt-BR').split(',')[0]
        } até ${
          new Date(this.dateEnd()).toLocaleString('pt-BR').split(',')[0]
        } `,
        14,
        32
      );
    }

    // Métricas Gerais
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Métricas Gerais', 14, 42);

    const metricsData = [
      ['Total de Amostras', this.totalAmostras().toString()],
      ['Análises Concluídas', this.amostrasCompletas().toString()],
      ['Análises Pendentes', this.amostrasIncompletas().toString()],
      ['Percentual Concluído', `${this.percentualCompletas()}%`],
      [
        'Média de Elementos/Amostra',
        this.mediaElementosPorAmostra().toString(),
      ],
    ];

    autoTable(doc, {
      startY: 52,
      head: [['Métrica', 'Valor']],
      body: metricsData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Análise por Laboratório
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Análise por Laboratório', 14, finalY);

    const labData = this.laboratorios().map((lab) => [
      lab.nome,
      lab.totalAmostras.toString(),
      lab.amostrasCompletas.toString(),
      lab.amostrasIncompletas.toString(),
      `${lab.taxaConclusao}%`,
    ]);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Laboratório', 'Total', 'Concluídas', 'Pendentes', 'Taxa']],
      body: labData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Nova página para Remessas
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Análise por Remessa', 14, 20);

    const remessaData = this.remessasStats().map((r) => [
      this.formatDate(r.data),
      r.laboratorio,
      r.totalAmostras.toString(),
      r.amostrasCompletas.toString(),
      r.amostrasIncompletas.toString(),
      `${r.taxaConclusao}%`,
    ]);

    autoTable(doc, {
      startY: 24,
      head: [
        ['Data', 'Laboratório', 'Total', 'Concluídas', 'Pendentes', 'Taxa'],
      ],
      body: remessaData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });

    doc.save(
      `relatorio-analises-laboratoriais-${
        new Date().toISOString().split('T')[0]
      }.pdf`
    );
  }

  setSelectedLab(event: any) {
    this.selectedLab.set(event);
    this.applyFilters();
  }

  setDateStart(event: any) {
    this.dateStart.set(event);
    this.applyFilters();
  }

  setDateEnd(event: any) {
    this.dateEnd.set(event);
    this.applyFilters();
  }
  toggleFiltros() {
    this.filtrosExpanded.update((v) => !v);
  }
}

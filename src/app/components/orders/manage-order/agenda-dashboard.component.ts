import { Component, signal, computed, input, OutputEmitterRef, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBeaker,
  heroCalendarDays,
  heroChartBar,
  heroClipboardDocumentList,
  heroChevronDown,
  heroChevronUp,
  heroMagnifyingGlass,
  heroClock,
  heroCheckCircle,
  heroExclamationTriangle,
} from '@ng-icons/heroicons/outline';
import { getPrazoInicioFim } from '../../../shared/utils/get-prazo-inicio-fim';

interface AmostraDetalhes {
  id: number;
  nomeAmostra: string;
  numeroOs: string;
  prazoInicioFim: string;
  status: string;
}

interface TipoAnalise {
  tipo: string;
  classe: string;
  quantidade: number;
  amostras: AmostraDetalhes[];
}

interface AgendamentoSemanal {
  semana: string;
  dataInicio: string;
  dataFim: string;
  tiposAnalise: TipoAnalise[];
  totalAmostras: number;
}

@Component({
  selector: 'app-agenda-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent,DatePipe],
  viewProviders: [
    provideIcons({
      heroBeaker,
      heroCalendarDays,
      heroChartBar,
      heroClipboardDocumentList,
      heroChevronDown,
      heroChevronUp,
      heroMagnifyingGlass,
      heroClock,
      heroCheckCircle,
      heroExclamationTriangle,
    }),
  ],
  template:`
  <div class="flex-1 flex flex-col bg-white p-6 overflow-hidden"> 
    <!-- Header -->
    <header class="mb-8">
      <div class="flex items-center justify-end mb-4">

        
        <!-- Toggle de visualização -->
        <div class="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
          <button
            (click)="visualizacao.set('grid')"
            [class.bg-blue-500]="visualizacao() === 'grid'" 
            [class.text-white]="visualizacao() === 'grid'"
            [class.text-slate-600]="visualizacao() !== 'grid'"
            class="px-4 py-2 rounded-md transition-all">
            <ng-icon name="heroChartBar"></ng-icon>
          </button>
          <button
            (click)="visualizacao.set('lista')"
            [class.bg-blue-500]="visualizacao() === 'lista'"
            [class.text-white]="visualizacao() === 'lista'"
            [class.text-slate-600]="visualizacao() !== 'lista'"
            class="px-4 py-2 rounded-md transition-all">
            <ng-icon name="heroClipboardDocumentList"></ng-icon>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Total de Amostras</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ totalAmostras() }}</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <ng-icon name="heroBeaker" size="24" class="text-blue-500"></ng-icon>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Semanas Agendadas</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ totalSemanas() }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <ng-icon name="heroCalendarDays" size="24" class="text-green-600"></ng-icon>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Tipos de Análise</p>
              <p class="text-3xl font-bold text-slate-800 mt-1">{{ tiposUnicos().length }}</p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <ng-icon name="heroChartBar" size="24" class="text-purple-600"></ng-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtro -->
      <div class="bg-white rounded-md shadow-sm p-4 border border-slate-200">
        <div class="relative">
          <ng-icon
            name="heroMagnifyingGlass"
            size="20"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          </ng-icon>
          <input
            type="text"
            [value]="filtroTipo()"
            (input)="filtroTipo.set($any($event.target).value)"
            placeholder="Buscar tipo de análise..."
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
        </div>
      </div>
    </header>

    <!-- Loading State -->
    @if (loading()) {
      <div class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }

    <!-- Error State -->
    @if (error()) {
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <ng-icon name="heroExclamationTriangle" size="48" class="text-red-600 mx-auto mb-3"></ng-icon>
        <p class="text-red-800 font-medium">{{ error() }}</p>
        <button
          (click)="recarregar()"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Tentar Novamente
        </button>
      </div>
    }

    <!-- Content -->
    @if (!loading() && !error()) {
      <!-- Visualização -->
      @if (visualizacao() === 'grid') {
        <div class="space-y-6 overflow-y-auto">
          @for (agendamento of agendamentosFiltrados(); track agendamento.semana) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
              <!-- Semana Header -->
              <div
                (click)="toggleSemana(agendamento.semana)"
                class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all">
                <div class="flex items-center justify-between text-white">
                  <div class="flex items-center gap-4">
                    <ng-icon name="heroCalendarDays" size="32"></ng-icon>
                    <div>
                      <h2 class="text-2xl font-bold">{{ agendamento.semana }}</h2>
                      <p class="text-blue-100 text-sm mt-1">
                        {{ agendamento.dataInicio | date:'dd/MM/yyyy' }} até {{ agendamento.dataFim | date:'dd/MM/yyyy' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-right">
                      <div class="text-3xl font-bold">{{ agendamento.totalAmostras }}</div>
                      <div class="text-blue-100 text-sm">amostras</div>
                    </div>
                    <ng-icon
                      [name]="isSemanaExpandida(agendamento.semana) ? 'heroChevronUp' : 'heroChevronDown'"
                      size="24">
                    </ng-icon>
                  </div>
                </div>
              </div>

              <!-- Tipos de Análise -->
              @if (isSemanaExpandida(agendamento.semana)) {
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (tipo of agendamento.tiposAnalise; track tipo.tipo + tipo.classe) {
                      <div class="group relative">
                        <div
                          class="bg-gradient-to-br {{ getCorClasse(tipo.classe) }} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
                          <div class="flex items-start justify-between mb-4">
                            <div class="bg-white/20 rounded-lg p-2">
                              <ng-icon name="heroBeaker" size="24"></ng-icon>
                            </div>
                            <span class="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                              {{ tipo.quantidade }}
                            </span>
                          </div>
                          <h3 class="text-xl font-bold mb-1">{{ tipo.tipo }}</h3>
                          <p class="text-white/80 text-sm">{{ tipo.classe }}</p>
                          
                          <!-- Indicador de amostras -->
                          <div class="mt-4 flex items-center gap-2 text-sm">
                            <ng-icon name="heroClipboardDocumentList" size="16"></ng-icon>
                            <span>{{ tipo.amostras.length }} amostra(s)</span>
                          </div>
                        </div>

                        <div class="absolute inset-0 bg-slate-900/95 rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto overflow-y-auto">
                          <h4 class="text-white font-bold mb-3 flex items-center gap-2">
                            <ng-icon name="heroClipboardDocumentList" size="20"></ng-icon>
                            Amostras
                          </h4>
                          @for (amostra of tipo.amostras; track amostra.id) {
                            <div class="bg-white/10 rounded-lg p-3 mb-2 text-white text-sm">
                              <div class="font-medium">{{ amostra.nomeAmostra }}</div>
                              <div class="text-white/70 text-xs mt-1">OS: {{ amostra.numeroOs }}</div>
                              <div class="flex items-center gap-2 mt-2">
                                <span class="px-2 py-1 rounded text-xs {{ getCorStatus(amostra.status) }}">
                                  {{ amostra.status }}
                                </span>
                                <span class="text-white/60 text-xs flex items-center gap-1">
                                  <ng-icon name="heroClock" size="12"></ng-icon>
                                  {{ getPrazoInicioFim(amostra.prazoInicioFim) }} 
                                </span>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div> 
          }
        </div>
      }

      <!-- Lista -->
      @if (visualizacao() === 'lista') {
        <div class="flex bg-white rounded-xl shadow-sm border border-slate-200 min-h-0 ">
          <div class="flex-1 min-h-0 overflow-y-auto">
            <table class="w-full">
              <thead class="bg-slate-50 sticky top-0 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Semana
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Tipo de Análise
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Classe
                  </th>
                  <th class="px-6 py-4 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th class="px-6 py-4 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Período
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (agendamento of agendamentosFiltrados(); track agendamento.semana) {
                  @for (tipo of agendamento.tiposAnalise; track tipo.tipo + tipo.classe; let first = $first) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      @if (first) {
                        <td
                          [attr.rowspan]="agendamento.tiposAnalise.length"
                          class="px-6 py-4 align-top font-medium text-slate-800 bg-slate-50">
                          <div class="flex items-center gap-2">
                            <ng-icon name="heroCalendarDays" size="20" class="text-blue-600"></ng-icon>
                            {{ agendamento.semana }}
                          </div>
                        </td>
                      }
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <ng-icon name="heroBeaker" size="18" class="text-slate-600"></ng-icon>
                          <span class="font-medium text-slate-800">{{ tipo.tipo }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r {{ getCorClasse(tipo.classe) }} text-white">
                          {{ tipo.classe }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {{ tipo.quantidade }}
                        </span>
                      </td>
                      @if (first) {
                        <td
                          [attr.rowspan]="agendamento.tiposAnalise.length"
                          class="px-6 py-4 text-center align-center text-sm font-bold text-gray-800">
                          {{ agendamento.dataInicio | date:'dd/MM/yyyy' }} <br /> até <br /> {{ agendamento.dataFim | date:'dd/MM/yyyy' }}
                        </td>
                      }
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (agendamentosFiltrados().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <ng-icon name="heroCalendarDays" size="64" class="text-slate-300 mx-auto mb-4"></ng-icon>
          <h3 class="text-xl font-bold text-slate-800 mb-2">Nenhum agendamento encontrado</h3>
          <p class="text-slate-600">
            Não há ensaios programados com os filtros aplicados.
          </p>
        </div>
      }
    }
  
</div>`,
  styles:`
:host {
  width: 100%;
  height: 100%;
  display: flex;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}

.bg-white {
  animation: fadeIn 0.3s ease-out;
}

.group:hover .bg-gradient-to-br {
  transform: translateY(-4px);
  transition: transform 0.3s ease;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

button {
  position: relative;
  overflow: hidden;
}

button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

button:active::after {
  width: 300px;
  height: 300px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.bg-white:hover {
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1);
}

.group:hover .absolute {
  backdrop-filter: blur(10px);
}

.overflow-hidden {
  animation: slideDown 0.3s ease-out;
}

span[class*="bg-"][class*="text-"] {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr !important;
  }
}

input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

tbody tr:hover {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
  `,
})
export class AgendaDashboardComponent {
  agendamentos = input<AgendamentoSemanal[]>([]);
  loading = input(true);
  error = input<string | null>(null);
  onErrorRetry:OutputEmitterRef<void> = output<void>();
  expandedWeeks = signal<Set<string>>(new Set());
  filtroTipo = signal<string>('');
  visualizacao = signal<'grid' | 'lista'>('grid');

  // Computed signals
  totalAmostras = computed(() =>
    this.agendamentos().reduce((acc, sem) => acc + sem.totalAmostras, 0)
  );

  totalSemanas = computed(() => this.agendamentos().length);

  tiposUnicos = computed(() => {
    const tipos = new Set<string>();
    this.agendamentos().forEach((sem) =>
      sem.tiposAnalise.forEach((tipo) => tipos.add(tipo.tipo))
    );
    return Array.from(tipos).sort();
  });

  agendamentosFiltrados = computed(() => {
    const filtro = this.filtroTipo().toLowerCase();
    if (!filtro) return this.agendamentos();

    return this.agendamentos()
      .map((sem) => ({
        ...sem,
        tiposAnalise: sem.tiposAnalise.filter((tipo) =>
          tipo.tipo.toLowerCase().includes(filtro)
        ),
      }))
      .filter((sem) => sem.tiposAnalise.length > 0);
  });



  toggleSemana(semana: string) {
    const expanded = new Set(this.expandedWeeks());
    if (expanded.has(semana)) {
      expanded.delete(semana);
    } else {
      expanded.add(semana);
    }
    this.expandedWeeks.set(expanded);
  }

  isSemanaExpandida(semana: string): boolean {
    return this.expandedWeeks().has(semana);
  }

  getCorStatus(status: string): string {
    return status === 'EXECUCAO'
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : 'bg-green-100 text-green-700 border-green-300';
  }

  getCorClasse(classe: string): string {
    const cores: Record<string, string> = {
      Física: 'from-gray-500 to-gray-600' ,
      Metalúrgica: 'from-blue-500 to-blue-500',
      Químico: 'from-green-500 to-green-500',
      Térmica: 'from-orange-500 to-orange-500',
    };
    return cores[classe] || 'from-purple-500 to-purple-600';
  }

  recarregar() {
    this.onErrorRetry.emit();
  }
  protected readonly getPrazoInicioFim=getPrazoInicioFim
}

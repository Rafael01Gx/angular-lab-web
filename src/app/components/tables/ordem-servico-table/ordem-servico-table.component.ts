import {Component, Input, Output, EventEmitter, inject, input, output, OutputEmitterRef} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {IAmostra} from '../../../shared/interfaces/amostra.interface';
import {Status} from '../../../shared/enums/status.enum';
import {OrderService} from '../../../services/order.service';

@Component({
  selector: 'app-ordem-servico-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="bg-white flex flex-col rounded-xl shadow-sm border border-gray-200 w-full h-full min-h-0 ">
      <!-- Table Container -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <table class="w-full">
          <!-- Table Header -->
          <thead class="bg-gray-50 border-b border-gray-200 sticky top-0">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progresso
            </th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
            <th class="w-12 px-6 py-4"></th>
          </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            @for (ordem of ordensServico(); track ordem.id) {
              <ng-container>
                <!-- Main Row -->
                <tr
                  class="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  [class.bg-blue-50]="expandedRows.has(ordem.id!)"
                  (click)="toggleRow(ordem.id!)">

                  <!-- ID / Data Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-col">
                      <div class="text-sm font-medium text-gray-900">
                        OS #{{ ordem.id }}
                      </div>

                    </div>
                  </td>

                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-md text-gray-500">
                      {{ ordem.createdAt | date: 'mediumDate' }}
                    </div>
                  </td>

                  <!-- Status Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="getStatusClass(ordem.status)">
            <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                  [ngClass]="getStatusDotClass(ordem.status)">
            </span>
            {{ ordem.status || 'N/A' }}
          </span>
                  </td>

                  <!-- Progress Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-3">
                      <div class="flex-1">
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div
                            class="h-2 rounded-full transition-all duration-300"
                            [class]="getProgressBarClass(ordem.progresso!)"
                            [style.width.%]="ordem.progresso || 0">
                          </div>
                        </div>
                      </div>
                      <span class="text-sm font-medium text-gray-700 min-w-[40px]">
          {{ ordem.progresso || 0 }}%
                    </span>
                    </div>
                  </td>

                  <!-- Actions Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button
                      (click)="cancelarOrdem(ordem?.id!, $event)"
                      class="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancelar OS
                    </button>
                  </td>

                  <!-- Expand Arrow Column -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button class="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                      <svg
                        class="w-5 h-5 transform transition-transform duration-200"
                        [class.rotate-180]="expandedRows.has(ordem.id!)"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </td>
                </tr>

                <!-- Expanded Content -->
                @if (expandedRows.has(ordem.id!)) {
                  <tr class="bg-gray-50 ">
                    <td colspan="6" class="px-6 py-0">
                      <div class="py-6 space-y-6 animate-fade-in">

                        <!-- Informações Gerais -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div class="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor"
                                   viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Informações Gerais
                            </h4>
                            <div class="space-y-2 text-sm">
                              <div class="flex justify-between">
                                <span class="text-gray-500">Data Recepção:</span>
                                <span
                                  class="text-gray-900">{{ (ordem.dataRecepcao | date: 'mediumDate') || "Não Recepcionado!" }}</span>
                              </div>
                              <div class="flex justify-between">
                                <span class="text-gray-500">Prazo:</span>
                                <span class="text-gray-900">{{ ordem.prazoInicioFim }}</span>
                              </div>
                              <div class="flex justify-between">
                                <span class="text-gray-500">Atualizado:</span>
                                <span
                                  class="text-gray-900">{{ (ordem.updatedAt || Date.now()) | date: 'mediumDate' }}</span>
                              </div>
                            </div>
                          </div>

                          <div class="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor"
                                   viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Progresso
                            </h4>
                            <div class="space-y-3">
                              <div class="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  class="h-3 rounded-full transition-all duration-500"
                                  [class]="getProgressBarClass(ordem.progresso!)"
                                  [style.width.%]="ordem.progresso || 0">
                                </div>
                              </div>
                              <div class="text-center">
                                <span class="text-lg font-bold text-gray-900">{{ ordem.progresso || 0 }}%</span>
                                <span class="text-sm text-gray-500 ml-1">concluído</span>
                              </div>
                            </div>
                          </div>

                          @if (ordem.observacao) {
                            <div class="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                <svg class="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Observações
                              </h4>
                              <p class="text-sm text-gray-700">{{ ordem.observacao }}</p>
                            </div>
                          }
                        </div>

                        <!-- Amostras -->
                        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div class="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h4 class="text-sm font-semibold text-gray-900 flex items-center">
                              <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor"
                                   viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                              </svg>
                              Amostras ({{ ordem.amostras.length }})
                            </h4>
                          </div>

                          <div class="divide-y divide-gray-200">
                            @for (amostra of ordem.amostras; track amostra.id) {
                              <div
                                class="p-4 hover:bg-gray-50 transition-colors duration-200">

                                <div class="flex items-start justify-between mb-3">
                                  <div>
                                    <h5 class="text-sm font-medium text-gray-900">
                                      {{ amostra.nomeAmostra }}
                                    </h5>
                                    <p class="text-xs text-gray-500 mt-1">
                                      ID: {{ amostra.id }} • OS: {{ amostra.numeroOs }}
                                    </p>
                                  </div>

                                  <div class="flex items-center space-x-3">
                                    <!-- Status da Amostra -->
                                    <span
                                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="getStatusClass(amostra.status)">
                          <span class="w-1 h-1 rounded-full mr-1"
                                [ngClass]="getStatusDotClass(amostra.status)">
                          </span>
                                      {{ amostra.status }}
                      </span>

                                    <!-- Progresso da Amostra -->
                                    <div class="flex items-center space-x-2">
                                      <div class="w-16 bg-gray-200 rounded-full h-1.5">
                                        <div
                                          class="h-1.5 rounded-full"
                                          [class]="getProgressBarClass(amostra.progresso)"
                                          [style.width.%]="amostra.progresso || 0">
                                        </div>
                                      </div>
                                      <span class="text-xs text-gray-600 min-w-[30px]">
                      {{ amostra.progresso || 0 }}%
                                </span>
                                    </div>
                                  </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                  <div>
                                    <span class="text-gray-500">Data Amostra:</span>
                                    <div
                                      class="text-gray-900 font-medium">{{ amostra.dataAmostra | date: 'mediumDate' }}
                                    </div>
                                  </div>
                                  <div>
                                    <span class="text-gray-500">Tipo:</span>
                                    <div class="text-gray-900 font-medium">{{ amostra.amostraTipo }}</div>
                                  </div>
                                  <div>
                                    <span class="text-gray-500">Prazo:</span>
                                    <div
                                      class="text-gray-900 font-medium">{{ amostra.prazoInicioFim || "Aguardando prazo" }}
                                    </div>
                                  </div>
                                  <div>
                                    <span class="text-gray-500">Data Recepção:</span>
                                    <div
                                      class="text-gray-900 font-medium">{{amostra.dataRecepcao }}
                                    </div>
                                  </div>
                                </div>

                                <!-- Ensaios Solicitados -->
                                @if (amostra.ensaiosSolicitados.length) {
                                  <div class="mt-3">
                                    <span class="text-xs text-gray-500 mb-2 block">Ensaios Solicitados:</span>
                                    <div class="flex flex-wrap gap-1">
                                      @for (ensaio of amostra.ensaiosSolicitados; track ensaio.id) {
                                        <span
                                          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {{ ensaio.tipo }} ({{ ensaio.classe }})
                              </span>
                                      }
                                    </div>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              </ng-container>
            }
          </tbody>
        </table>

        <!-- Empty State -->
        @if (ordensServico().length === 0) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 class="mt-4 text-sm font-medium text-gray-900">Nenhuma ordem de serviço encontrada</h3>
            <p class="mt-2 text-sm text-gray-500">Comece criando uma nova ordem de serviço.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }

    .table-container {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }

    .table-container::-webkit-scrollbar {
      height: 8px;
    }

    .table-container::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .table-container::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .table-container::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class OrdemServicoTableComponent {
ordensServico= input<IOrders[]>([]);
cancelarOrdemEvent: OutputEmitterRef<string> = output<string>();

  expandedRows = new Set<string>();

  toggleRow(ordemId: string): void {
    if (this.expandedRows.has(ordemId)) {
      this.expandedRows.delete(ordemId);
    } else {
      this.expandedRows.add(ordemId);
    }
  }

  cancelarOrdem(ordemId: string, event: Event): void {
    event.stopPropagation(); // Prevent row expansion
    this.cancelarOrdemEvent.emit(ordemId);
  }

  trackByOrdemId(index: number, ordem: IOrders): string {
    return ordem.id!;
  }

  trackByAmostraId(index: number, amostra: IAmostra): number {
    return Number(amostra.id);
  }


  getStatusClass(status: string | Status | undefined): string {
    const statusValue = status as Status;

    switch (statusValue) {
      case Status.AGUARDANDO:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case Status.AUTORIZADA || Status.EXECUCAO:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case Status.FINALIZADA:
        return 'bg-green-100 text-green-800 border border-green-200';
      case Status.CANCELADA:
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getStatusDotClass(status: string | Status | undefined): string {
    const statusValue = status as Status;

    switch (statusValue) {
      case Status.AGUARDANDO:
        return 'bg-yellow-400';
      case Status.AUTORIZADA || Status.EXECUCAO:
        return 'bg-blue-400';
      case Status.FINALIZADA:
        return 'bg-green-400';
      case Status.CANCELADA:
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }

  getProgressBarClass(progresso: number | string): string {
    const progress = Number(progresso) || 0;

    if (progress === 0) return 'bg-gray-300';
    if (progress <= 25) return 'bg-red-500';
    if (progress <= 50) return 'bg-yellow-500';
    if (progress <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  }

  protected readonly Date = Date;
}

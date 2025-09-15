import {Component, Input, Output, EventEmitter, signal, computed, model, output, input} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroChevronDownMini,
  heroChevronUpMini,
  heroPrinterMini,
  heroCalendarDaysMini,
  heroUserMini,
  heroClipboardDocumentListMini,
  heroBeakerMini,
  heroTagMini,
  heroClockMini
} from '@ng-icons/heroicons/mini';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {Status} from '../../../shared/enums/status.enum';

interface ButtonAction {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-ordem-servico',
  standalone: true,
  imports: [CommonModule, NgIconComponent, DatePipe],
  viewProviders: [
    provideIcons({
      heroChevronDownMini,
      heroChevronUpMini,
      heroPrinterMini,
      heroCalendarDaysMini,
      heroUserMini,
      heroClipboardDocumentListMini,
      heroBeakerMini,
      heroTagMini,
      heroClockMini
    })
  ],
  template: `
    @if (isVisible()) {
      <div
        (click)="onBackdropClick($event)"
        class="fixed inset-0 z-999 flex items-center  justify-center bg-black/50 overflow-hidden backdrop-blur-sm "
      >
        <div (click)="$event.stopPropagation()"
             class="flex flex-col items-center justify-center max-h-[95lvh]  max-w-[90lvw]">
          <!-- Header compacto -->
          <div
            class="flex items-center justify-between rounded-t-md  w-full p-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-6 flex-1">
              <!-- ID da OS -->
              <div class="flex items-center gap-2 min-w-0">
                <ng-icon name="heroClipboardDocumentListMini" class="text-blue-600 flex-shrink-0" size="16"></ng-icon>
                <span class="font-semibold text-gray-900 text-sm">{{ ordemServico.id }}</span>
              </div>

              <!-- Data de Criação -->
              <div class="flex items-center gap-2 min-w-0 hidden sm:flex">
                <ng-icon name="heroCalendarDaysMini" class="text-gray-500 flex-shrink-0" size="16"></ng-icon>
                <span class="text-sm text-gray-600">{{ ordemServico.createdAt | date : 'mediumDate'}}</span>
              </div>

              <!-- Solicitante -->
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <ng-icon name="heroUserMini" class="text-gray-500 flex-shrink-0" size="16"></ng-icon>
                <span class="text-sm text-gray-900 truncate">{{ ordemServico.solicitante?.name || 'N/A' }}</span>
              </div>

              <!-- Status -->
              <div class="flex items-center gap-2 min-w-0">
            <span [class]="getStatusClass(ordemServico.status)"
                  class="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              {{ ordemServico.status || Status.DEFAULT }}
            </span>
              </div>
            </div>

            <div class="flex items-center gap-2 ml-4">
              <!-- Botão Alterar Status -->
              @if (headerButton().label) {
                <button
                  (click)="headerButton().action()"
                  class="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  {{ headerButton().label }}
                </button>
              }

              <!-- Botão Expandir/Recolher -->
              <button (click)="toggleExpanded()"
                      class="p-1 text-gray-400 hover:text-gray-600 hover:scale-110  cursor-pointer transition-colors">
                <ng-icon
                  [name]="isExpanded() ? 'heroChevronUpMini' : 'heroChevronDownMini'"
                  size="20"
                ></ng-icon>
              </button>
            </div>
          </div>

          <!-- Conteúdo expandido -->
          <div
            [class]="isExpanded() ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'"
            class="overflow-y-auto rounded-b-md bg-gray-800/80 transition-all duration-300 ease-in-out"
          >
            <div class="p-6 space-y-6" #printableContent>

              <!-- Cabeçalho para impressão -->
              <div class="hidden print:block mb-6 text-center border-b pb-4">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Ordem de Serviço</h1>
                <p class="text-gray-600">{{ ordemServico.numeroOs || ordemServico.id }}</p>
              </div>

              <!-- Informações gerais -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <!-- Número OS -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroTagMini" class="text-blue-600" size="16"></ng-icon>
                    <span class="font-medium text-gray-700 text-sm">Número OS</span>
                  </div>
                  <p class="text-gray-900 font-semibold">{{ ordemServico.numeroOs || ordemServico.id }}</p>
                </div>

                <!-- Solicitante -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroUserMini" class="text-green-600" size="16"></ng-icon>
                    <span class="font-medium text-gray-700 text-sm">Solicitante</span>
                  </div>
                  <p class="text-gray-900 font-semibold">{{ ordemServico.solicitante?.name || 'N/A' }}</p>
                  <p class="text-gray-600 text-sm">{{ ordemServico.solicitante?.email || '' }}</p>
                  <p class="text-gray-600 text-sm">{{ ordemServico.solicitante?.area || '' }}</p>
                </div>

                <!-- Status -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroClockMini" class="text-yellow-600" size="16"></ng-icon>
                    <span class="font-medium text-gray-700 text-sm">Status</span>
                  </div>
                  <span [class]="getStatusClass(ordemServico.status)"
                        class="px-3 py-1 rounded-full text-xs font-medium">
                {{ ordemServico.status || Status.DEFAULT }}
              </span>
                </div>

                <!-- Data de Recepção -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroCalendarDaysMini" class="text-purple-600" size="16"></ng-icon>
                    <span class="font-medium text-gray-700 text-sm">Data Recepção</span>
                  </div>
                  <p class="text-gray-900 text-center font-semibold">{{ ordemServico.dataRecepcao || ' - ' }}</p>
                </div>

                <!-- Prazo -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroCalendarDaysMini" class="text-red-600" size="16"></ng-icon>
                    <span class="font-medium text-gray-700 text-sm">Prazo</span>
                  </div>
                  <p
                    class="text-gray-900 text-center font-semibold">{{ ordemServico.prazoInicioFim || 'Aguardando!' }}</p>
                </div>

                <!-- Progresso -->
                <div class="bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-center gap-2 mb-2">
                    <ng-icon name="heroClockMini" class="text-indigo-600" size="16"></ng-icon>
                    <span class="font-medium text-gray-700 text-sm">Progresso</span>
                  </div>
                  <p class="text-gray-900 text-center font-semibold">{{ ordemServico.progresso ?? '0' }} %</p>
                </div>
              </div>

              <!-- Observações -->
              @if (ordemServico.observacao) {
                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 class="font-medium text-gray-700 mb-2">Observações</h3>
                  <p class="text-gray-900">{{ ordemServico.observacao }}</p>
                </div>
              }

              <!-- Amostras -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <ng-icon name="heroBeakerMini" color="orange" size="20"></ng-icon>
                  <h3 class="font-semibold text-gray-200 text-lg">Amostras ({{ ordemServico.amostras.length }})</h3>
                </div>

                <div class="space-y-4">
                  @for (amostra of ordemServico.amostras; track amostra.id) {
                    <div
                      class="border border-gray-200 rounded-lg p-4 bg-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div class="flex items-start justify-between w-full mb-3">
                        <div class="flex-1 flex flex-wrap">
                          <h4 class="font-medium text-gray-900 flex-1">{{ amostra.nomeAmostra }}</h4>
                          <div class="flex flex-col gap-2">
                            <span class="text-sm text-gray-600"><strong class="mr-2">Data da amostra: </strong>{{ amostra.dataAmostra | date : 'dd/MM/yyyy'}}</span>
                            @if (amostra.amostraTipo) {
                              <span class="text-sm text-gray-600"><strong class="mr-2">Tipo:</strong> {{ amostra.amostraTipo }}</span>
                            }
                          </div>
                        </div>
                      </div>

                      <!-- Ensaios Solicitados -->
                      @if (amostra.ensaiosSolicitados.length > 0) {
                        <div>
                          <h5 class="font-medium text-gray-700 text-sm mb-2">Ensaios Solicitados</h5>
                          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            @for (ensaio of amostra.ensaiosSolicitados; track $index) {
                              <div
                                class="bg-blue-50 px-3 py-2 rounded-md border border-blue-200"
                              >
                                <p class="font-medium text-blue-900 text-sm">{{ ensaio.tipo }}</p>
                                <p class="text-blue-700 text-xs">{{ ensaio.classe }}</p>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Botão de Impressão -->
              @if (botButton().label) {
                <div class="flex justify-end pt-4 border-t border-gray-200 print:hidden">
                  <button
                    (click)="botButton().action()"
                    class="flex items-center gap-2 px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <ng-icon name="heroPrinterMini" size="16"></ng-icon>
                    {{ botButton().label }}
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @media print {
      .print\\:hidden {
        display: none !important;
      }
      .print\\:block {
        display: block !important;
      }

      /* Otimizações para impressão */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .shadow-sm {
        box-shadow: none !important;
      }
      .border {
        border-color: #e5e7eb !important;
      }

      /* Quebras de página */
      .page-break {
        page-break-before: always;
      }

      /* Evitar quebra de elementos importantes */
      .bg-gray-50, .bg-blue-50, .bg-yellow-50 {
        page-break-inside: avoid;
      }
    }
  `]
})
export class OrdemServicoComponent {
  isVisible = model<boolean>(false);
  closeModal = output<void>();
  headerButton = model<ButtonAction>({label: '', action: () => null});
  botButton = model<ButtonAction>({label: '', action: () => null});
  @Input({required: true}) ordemServico!: IOrders;
  @Output() print = new EventEmitter<{ htmlContent: string, ordemServico: IOrders }>();

  // Signals para reatividade
  private _isExpanded = signal(true);

  // Computed para acessar o estado
  isExpanded = computed(() => this._isExpanded());

  Status = Status;

  toggleExpanded(): void {
    this._isExpanded.set(!this._isExpanded());
  }

  onBackdropClick(event: MouseEvent): void {
    console.log('backdrop click');
    event.stopPropagation();
    this.closeModal.emit();
  }

  private generatePrintableHTML(): string {
    return `
      <div class="p-6 space-y-6">
        <div class="text-center border-b pb-4 mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Ordem de Serviço</h1>
          <p class="text-gray-600">${this.ordemServico.numeroOs || this.ordemServico.id}</p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <span class="font-medium text-gray-700 text-sm">Número OS</span>
            <p class="text-gray-900 font-semibold">${this.ordemServico.numeroOs || 'N/A'}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <span class="font-medium text-gray-700 text-sm">Solicitante</span>
            <p class="text-gray-900 font-semibold">${this.ordemServico.solicitante?.name || 'N/A'}</p>
            <p class="text-gray-600 text-sm">${this.ordemServico.solicitante?.email || ''}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <span class="font-medium text-gray-700 text-sm">Status</span>
            <p class="text-gray-900 font-semibold">${this.ordemServico.status || Status.DEFAULT}</p>
          </div>
        </div>

        ${this.ordemServico.observacao ? `
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 class="font-medium text-gray-700 mb-2">Observações</h3>
          <p class="text-gray-900">${this.ordemServico.observacao}</p>
        </div>
        ` : ''}

        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900 text-lg">Amostras (${this.ordemServico.amostras.length})</h3>
          ${this.ordemServico.amostras.map(amostra => `
            <div class="border border-gray-200 rounded-lg p-4 bg-white">
              <h4 class="font-medium text-gray-900">${amostra.nomeAmostra}</h4>
              <p class="text-sm text-gray-600">ID: ${amostra.id} • Data: ${amostra.dataAmostra}</p>
              ${amostra.amostraTipo ? `<p class="text-sm text-gray-600">Tipo: ${amostra.amostraTipo}</p>` : ''}

              ${amostra.ensaiosSolicitados.length > 0 ? `
              <div class="mt-3">
                <h5 class="font-medium text-gray-700 text-sm mb-2">Ensaios Solicitados</h5>
                <div class="grid grid-cols-3 gap-2">
                  ${amostra.ensaiosSolicitados.map(ensaio => `
                    <div class="bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
                      <p class="font-medium text-blue-900 text-sm">${ensaio.tipo}</p>
                      <p class="text-blue-700 text-xs">${ensaio.classe}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private printViaBrowser(): void {
    window.print();
  }

  getStatusClass(status?: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case "AGUARDANDO":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case "AUTORIZADA":
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case "EXECUCAO":
        return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`;
      case "FINALIZADA":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case "CANCELADA":
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  }

  formatDate(date?: Date): string {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }


}

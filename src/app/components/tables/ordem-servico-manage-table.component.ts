import {Component, signal, computed, input, output, OutputEmitterRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronRight,
  heroMagnifyingGlass,
  heroFunnel,
  heroEye,
  heroCalendar,
  heroUser,
  heroClipboardDocumentList,
  heroBeaker,
  heroTag,
  heroInformationCircle,
  heroPrinter,
  heroTrash,
  heroClock
} from '@ng-icons/heroicons/outline';
import {IOrders} from '../../shared/interfaces/orders.interface';
import {keyOfStatus, mapStatus, Status} from '../../shared/enums/status.enum';
import {getPrazoInicioFim} from '../../shared/utils/get-prazo-inicio-fim';

interface IButtonOption {
  label: string,
  icon: 'heroPrinter' | 'heroTag' | 'heroTrash' | 'heroDocumentArrowDown'| 'heroClock'
  cssClass?:string
}

@Component({
  selector: 'app-ordem-servico-manager-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroChevronDown,
      heroChevronRight,
      heroMagnifyingGlass,
      heroFunnel,
      heroEye,
      heroCalendar,
      heroUser,
      heroClipboardDocumentList,
      heroBeaker,
      heroTag,
      heroInformationCircle,
      heroPrinter,
      heroTrash,
      heroClock
    })
  ],
  template: `
    <div class="h-full w-full bg-gradient-to-b from-blue-50/70 to-slate-50/50 p-0 rounded-sm flex flex-col">
      <div class="flex-1 flex flex-col min-h-0">
        <!-- Header com filtros -->
        <div class=" bg-white p-6 border-b border-slate-200/60">
          <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-700">{{ titulo() }}</h2>
              <p class="text-sm text-slate-600">{{ filteredOrdens().length }} ordem(ns) encontrada(s)</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <!-- Filtro de busca -->
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <ng-icon name="heroMagnifyingGlass" class="h-5 w-5 text-gray-400"/>
                </div>
                <input
                  [(ngModel)]="searchTerm"
                  type="text"
                  placeholder="Buscar por ID, solicitante..."
                  name="search"
                  id="search"
                  class="block w-full px-4 py-3 rounded-md border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700 transition-all duration-200"
                />
              </div>

              <!-- Filtro de status -->
              <div class="relative">
                <select
                  id="destino"
                  name="destino"
                  [(ngModel)]="statusFilter"
                  class="w-full px-4 py-3 rounded-md border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-700 transition-all duration-200"
                >
                  <option value="">Todos os status</option>
                  @for (status of selectOptions(); track $index) {
                    <option [value]="status">{{ status }}</option>
                  }

                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabela -->
        <div class="flex-1 overflow-auto bg-white">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th class="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <ng-icon name="heroClipboardDocumentList" class="w-4 h-4"></ng-icon>
                  ID / Ordem
                </div>
              </th>
              <th class="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <ng-icon name="heroCalendar" class="w-4 h-4"></ng-icon>
                  Data Criação
                </div>
              </th>
              <th class="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <ng-icon name="heroUser" class="w-4 h-4"></ng-icon>
                  Solicitante
                </div>
              </th>
              <th class="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <ng-icon name="heroTag" class="w-4 h-4"></ng-icon>
                  Status
                </div>
              </th>
              <th class="text-left py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <ng-icon name="heroClock" class="w-4 h-4"></ng-icon>
                  Periodo/Análise
                </div>
              </th>
              @if(actionButtonOption()){<th class="text-center py-4 px-6 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Ações
              </th>}
              <th class="w-16"></th>
            </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (ordem of filteredOrdens(); track ordem.id) {
                <ng-container>
                  <!-- Linha principal -->
                  <tr class="hover:bg-slate-50/50 transition-colors duration-200 group"
                      [class.bg-blue-50]="expandedRows().has(ordem.id!)">
                    <td class="py-4 px-6">
                      <div class="flex flex-col">
                        <span class="font-mono text-sm font-medium text-slate-900">#{{ ordem.id }}</span>
                        <span class="text-xs text-slate-500">{{ ordem.amostras.length || 0 }} amostra(s)</span>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-900">
            {{ ordem.createdAt | date:'dd/MM/yyyy' }}
            </span>
                        <span class="text-xs text-slate-500">
            {{ ordem.createdAt | date:'HH:mm' }}
            </span>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {{ getInitials(ordem.solicitante?.name || 'N/A') }}
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-medium text-slate-900">{{ ordem.solicitante?.name || 'N/A' }}</span>
                          <span
                            class="text-xs text-slate-500">{{ ordem.solicitante?.area || 'Área não informada' }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-6">
                  <span class="inline-flex px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getStatusClass(ordem.status)">
            {{ mapStatus(ordem.status!) || 'Sem Status' }}
            </span>
                    </td>
                    <td class="py-4 px-6">
                  <span [class]="'inline-flex px-3 py-1 rounded-md text-xs font-medium '+(ordem.prazoInicioFim!.length < 12 ? 'bg-gray-100 text-gray-800 border border-gray-200':'bg-green-100 text-green-800 border border-green-200')">
            {{ getPrazoInicioFim(ordem.prazoInicioFim!)}}
            </span>
                    </td>
                    @if(actionButtonOption()){<td class="py-4 px-6 text-center">
                      <button
                        (click)="alterarStatus(ordem); $event.stopPropagation()"
                        [class]="(actionButtonOption()?.cssClass ? actionButtonOption()?.cssClass! : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white' )"
                        class="inline-flex items-center px-3 py-1.5 text-xs cursor-pointer font-medium rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">

                        <ng-icon [name]="actionButtonOption()?.icon" class="w-3 h-3 mr-1"></ng-icon>
                    {{ actionButtonOption()?.label }}
                    </button>
                  </td>}
                    <td class="py-4 px-6 text-center">
                      <button
                        (click)="toggleExpand(ordem.id!)"
                        class="p-1 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors duration-200 group-hover:bg-slate-200">
                        <ng-icon
                          [name]="expandedRows().has(ordem.id!) ? 'heroChevronDown' : 'heroChevronRight'"
                          class="w-5 h-5 text-slate-400 transition-transform duration-200">
                        </ng-icon>
                      </button>
                    </td>
                  </tr>

                  <!-- Linha expandida -->
                  @if (expandedRows().has(ordem.id!)) {
                    <tr
                      class="bg-gradient-to-r from-blue-50/50 to-slate-50/50 border-l-4 border-blue-400">
                      <td colspan="6" class="py-6 px-6">
                        <div class="flex flex-col gap-6">
                          <!-- Informações gerais -->
                          <div class="flex-1">
                            <h4 class="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                              <ng-icon name="heroInformationCircle" class="w-4 h-4 text-blue-500"></ng-icon>
                              Informações Gerais
                            </h4>

                            <div class="flex gap-2">
                              <div class="bg-white flex-1 rounded-lg p-4 shadow-sm border border-slate-200/60">
                                <div class="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span class="font-medium text-slate-700">ID:</span>
                                    <span class="ml-2 font-mono text-slate-900">{{ ordem.id }}</span>
                                  </div>
                                  <div>
                                    <span class="font-medium text-slate-700">Status:</span>
                                    <span class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                                          [ngClass]="getStatusClass(ordem.status)">
              {{ ordem.status || 'Sem Status' }}
              </span>
                                  </div>
                                  <div>
                                    <span class="font-medium text-slate-700">Criado em:</span>
                                    <span
                                      class="ml-2 text-slate-900">{{ ordem.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                                  </div>
                                  @if (ordem.updatedAt) {
                                    <div>
                                      <span class="font-medium text-slate-700">Atualizado em:</span>
                                      <span
                                        class="ml-2 text-slate-900">{{ ordem.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                                    </div>
                                  }
                                </div>

                                @if (ordem.observacao) {
                                  <div class="mt-4 pt-3 border-t border-slate-200">
                                    <span class="font-medium text-slate-700 block mb-1">Observação:</span>
                                    <p class="text-slate-600 text-sm leading-relaxed">{{ ordem.observacao }}</p>
                                  </div>
                                }
                              </div>

                              <!-- Dados do solicitante -->
                              @if (ordem.solicitante) {
                                <div class="bg-white flex-1 rounded-lg p-4 shadow-sm border border-slate-200/60">
                                  <h5 class="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                    <ng-icon name="heroUser" class="w-4 h-4 text-blue-500"></ng-icon>
                                    Dados do Solicitante
                                  </h5>
                                  <div class="space-y-2 text-sm">
                                    <div><span class="font-medium text-slate-700">Nome:</span> <span class="ml-2">{{
                                        ordem.solicitante.name
                                      }}</span></div>
                                    <div><span class="font-medium text-slate-700">Email:</span> <span class="ml-2">{{
                                        ordem.solicitante.email
                                      }}</span></div>
                                    @if (ordem.solicitante.phone) {
                                      <div><span class="font-medium text-slate-700">Telefone:</span> <span class="ml-2">
                          {{ ordem.solicitante.phone }}</span></div>
                                    }
                                    @if (ordem.solicitante.area) {
                                      <div><span class="font-medium text-slate-700">Área:</span> <span class="ml-2">
                          {{ ordem.solicitante.area }}</span></div>
                                    }
                                    @if (ordem.solicitante.funcao) {
                                      <div><span class="font-medium text-slate-700">Função:</span> <span class="ml-2">
                          {{ ordem.solicitante.funcao }}</span></div>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          </div>

                          <!-- Amostras -->
                          <div class="flex-1">
                            <h4 class="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                              <ng-icon name="heroBeaker" class="w-4 h-4 text-green-500"></ng-icon>
                              Amostras ({{ ordem.amostras.length || 0 }})
                            </h4>

                            <div class="flex flex-wrap gap-2 max-h-96 overflow-y-auto custom-scrollbar">
                              @for (amostra of ordem.amostras; track amostra.id; let i = $index) {
                                <div
                                  [class]="(i == 0 || ordem.amostras.length == i + 1  ? 'basis-full': 'basis-[calc(50%-4px)]')"
                                  class="bg-white rounded-lg p-4 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow duration-200">
                                  <div class="flex items-start justify-between mb-3">
                                    <div>
                                      <h6 class="font-medium text-slate-900">{{ amostra.nomeAmostra }} </h6>
                                    </div>
                                    <span class="px-2 py-1 bg-blue-100 text-slate-700 rounded-md text-xs font-medium">
                         {{ amostra.dataAmostra | date:'dd/MM/yyyy' }}
                        </span>
                                  </div>


                                  @if (amostra.ensaiosSolicitados.length) {
                                    <div class="border-t border-slate-200 pt-3">
                                      <span
                                        class="font-medium text-slate-700 text-xs uppercase tracking-wide block mb-2">Ensaios Solicitados:</span>
                                      <div class="flex flex-wrap gap-1">
                                        @for (ensaio of amostra.ensaiosSolicitados; track $index) {
                                          <span
                                            class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                                            [title]="ensaio.classe">
                    {{ ensaio.tipo }}
                    </span>
                                        }
                                      </div>
                                    </div>
                                  }
                                </div>
                              }

                              @if (!ordem.amostras.length) {
                                <div
                                  class="text-center py-8 text-slate-500">
                                  <ng-icon name="heroBeaker" class="w-8 h-8 mx-auto mb-2 text-slate-400"></ng-icon>
                                  <p class="text-sm">Nenhuma amostra encontrada</p>
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

            <!-- Empty state -->
              @if (!filteredOrdens().length) {
                <tr>
                  <td colspan="6" class="py-12 text-center">
                    <div class="flex flex-col items-center justify-center text-slate-500">
                      <ng-icon name="heroClipboardDocumentList" class="w-12 h-12 mb-3 text-slate-400"></ng-icon>
                      <h3 class="text-lg font-medium text-slate-900 mb-1">Nenhuma ordem encontrada</h3>
                      <p class="text-sm">Tente ajustar os filtros ou criar uma nova ordem de serviço.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class OrdemServicoManagerTable {
  actionButtonOption = input<IButtonOption>()
  selectOptions = input.required<Status[]>();
  titulo = input.required<string>();
  searchTerm = signal('');
  statusFilter = signal('');
  expandedRows = signal(new Set<string>());
  getOrder: OutputEmitterRef<IOrders> = output<IOrders>()

  ordens = input.required<IOrders[]>();

  // Computed signals
  filteredOrdens = computed(() => {
    let filtered = this.ordens();

    const search = this.searchTerm().toLowerCase().trim();
    const status = keyOfStatus(this.statusFilter());

    if (search) {
      filtered = filtered.filter(ordem =>
        ordem.id!.toLowerCase().includes(search) ||
        ordem.solicitante?.name.toLowerCase().includes(search) ||
        ordem.solicitante?.email.toLowerCase().includes(search)
      );
    }

    if (status && status !== Status.DEFAULT) {
      filtered = filtered.filter(ordem => ordem.status === status);
    }

    return filtered.sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  });

  toggleExpand(ordemId: string) {
    const current = new Set(this.expandedRows());
    if (current.has(ordemId)) {
      current.delete(ordemId);
    } else {
      current.add(ordemId);
    }
    this.expandedRows.set(current);
  }

  alterarStatus(ordem: IOrders) {
    return this.getOrder.emit(ordem);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getStatusClass(status?: string): string {
    if (!status) return `bg-slate-100 text-slate-800 border border-slate-200`;
    const statusValues = mapStatus(status);
    const baseClasses = 'inline-flex px-3 py-1 rounded-full text-xs font-medium';

    switch (statusValues) {
      case Status.AGUARDANDO:
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case Status.AUTORIZADA:
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case Status.EXECUCAO:
        return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
      case Status.FINALIZADA:
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case Status.CANCELADA:
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-800 border border-slate-200`;
    }
  }

  protected readonly mapStatus = mapStatus;
  protected readonly getPrazoInicioFim = getPrazoInicioFim;
}

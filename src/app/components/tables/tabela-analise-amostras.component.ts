import {Component, inject, input, OnChanges, OnInit, output, OutputEmitterRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronRight,
  heroMagnifyingGlass,
  heroFunnel,
  heroPlusCircle,
  heroPencilSquare,
  heroClock,
  heroCheckCircle,
  heroXCircle,
  heroExclamationTriangle
} from '@ng-icons/heroicons/outline';
import {IAmostra} from '../../shared/interfaces/amostra.interface';
import {ITipoAnalise} from '../../shared/interfaces/analysis-type.interface';
import {mapStatus, Status} from '../../shared/enums/status.enum';
import {getPrazoInicioFim} from '../../shared/utils/get-prazo-inicio-fim';
@Component({
  selector: 'app-tabela-analise-amostras',
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders:[
    provideIcons({
      heroChevronDown,
      heroChevronRight,
      heroMagnifyingGlass,
      heroFunnel,
      heroPlusCircle,
      heroPencilSquare,
      heroClock,
      heroCheckCircle,
      heroXCircle,
      heroExclamationTriangle
    })
  ],
  template: `
    <div class="h-full w-full bg-gradient-to-b from-blue-50/70 to-slate-50/50 p-0 rounded-sm flex flex-col">
    <div class="flex-1 flex flex-col min-h-0">
     <!-- Header com filtros -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-semibold text-gray-900">Amostras</h2>
            <span class="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {{filteredAmostras.length}} itens
            </span>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <!-- Busca -->
            <div class="relative">
              <ng-icon name="heroMagnifyingGlass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"></ng-icon>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterAmostras()"
                placeholder="Buscar amostras..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64"
              />
            </div>

            <!-- Filtro de Status -->
            @if(selectFilter()){<div class="relative">
              <ng-icon name="heroFunnel" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"></ng-icon>
              <select
                [(ngModel)]="statusFilter"
                (change)="filterAmostras()"
                class="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
              >
                <option value="">Todos os Status</option>
                <option value="{{Status.AGUARDANDO}}">{{Status.AGUARDANDO}}</option>
                <option value="{{Status.AUTORIZADA}}">{{Status.AUTORIZADA}}</option>
                <option value="{{Status.EXECUCAO}}">{{Status.EXECUCAO}}</option>
                <option value="{{Status.FINALIZADA}}">{{Status.FINALIZADA}}</option>
                <option value="{{Status.CANCELADA}}">{{Status.CANCELADA}}</option>
              </select>
            </div>}
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="flex-1 overflow-auto bg-white">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amostra</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for(amostra of filteredAmostras; track amostra.id ;let i = $index){<ng-container>
              <!-- Linha principal -->
              <tr
                class="hover:bg-gray-50 cursor-pointer transition-colors"
                (click)="toggleExpansion(amostra.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <ng-icon
                    [name]="expandedRows.has(amostra.id) ? 'heroChevronDown' : 'heroChevronRight'"
                    class="w-4 h-4 text-gray-400 transition-transform"
                  ></ng-icon>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{amostra.numeroOs}}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{amostra.nomeAmostra}}</div>

                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="getStatusClass(amostra.status)"
                  >
                    <ng-icon [name]="getStatusIcon(amostra.status)" class="w-3 h-3 mr-1"></ng-icon>
                    {{amostra.status}}
                  </span>
                </td>
                    <td class="py-4 px-6">
                  <span [class]="'inline-flex px-3 py-1 rounded-md text-xs font-medium '+(amostra.prazoInicioFim!.length < 12 ? 'bg-gray-100 text-gray-800 border border-gray-200':'bg-green-100 text-green-800 border border-green-200')">
            {{ getPrazoInicioFim(amostra.prazoInicioFim!)}}
            </span>
                    </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        class="h-2 rounded-full transition-all duration-300"
                        [class]="getProgressClass(amostra.progresso)"
                        [style.width.%]="amostra.progresso"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-900 min-w-[3rem]">{{amostra.progresso}}%</span>
                  </div>
                </td>
              </tr>

              <!-- Linha expandida -->
              @if(expandedRows.has(amostra.id)){<tr class="bg-gray-50">
                <td colspan="6" class="px-6 py-6">
                  <div class="space-y-6">
                    <!-- Informações Gerais -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div class="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <ng-icon name="heroClock" class="w-4 h-4 mr-2 text-blue-500"></ng-icon>
                          Informações Gerais
                        </h4>
                        <div class="space-y-2 text-sm">
                          <div class="flex justify-between">
                            <span class="text-gray-600">Data Amostra:</span>
                            <span class="font-medium">{{amostra.dataAmostra | date:'dd/MM/yyyy'}}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Recepção:</span>
                            <span class="font-medium">{{amostra.dataRecepcao | date:'dd/MM/yyyy'}}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Solicitante:</span>
                            <span class="font-medium">{{amostra.user.name}}</span>
                          </div>
                        </div>
                      </div>

                      <div class="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <ng-icon name="heroCheckCircle" class="w-4 h-4 mr-2 text-green-500"></ng-icon>
                          Progresso
                        </h4>
                        <div class="space-y-3">
                          <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">Conclusão</span>
                            <span class="text-sm font-bold text-gray-900">{{amostra.progresso}}%</span>
                          </div>
                          <div class="w-full bg-gray-200 rounded-full h-3">
                            <div
                              class="h-3 rounded-full transition-all duration-500"
                              [class]="getProgressClass(amostra.progresso)"
                              [style.width.%]="amostra.progresso"
                            ></div>
                          </div>
                          <div class="text-xs text-gray-500">
                            {{getCompletedTests(amostra)}} de {{amostra.ensaiosSolicitados.length}} ensaios concluídos
                          </div>
                        </div>
                      </div>

                      <div class="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                          <ng-icon name="heroPencilSquare" class="w-4 h-4 mr-2 text-purple-500"></ng-icon>
                          Observações
                        </h4>
                        <div class="text-sm text-gray-600">
                          <p class="leading-relaxed">
                            Amostra em processamento conforme procedimentos padrão do laboratório.
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Ensaios Solicitados -->
                    <div class="bg-white rounded-lg border border-gray-200">
                      <div class="px-4 py-3 border-b border-gray-200">
                        <h4 class="text-sm font-semibold text-gray-900">Ensaios Solicitados</h4>
                      </div>
                      <div class="divide-y divide-gray-100">
                        @for(ensaio of amostra.ensaiosSolicitados; track $index){<div
                          class="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div class="flex items-center space-x-3">
                            <div class="flex-shrink-0">
                              <div
                                class="w-3 h-3 rounded-full"
                                [ngClass]="hasResult(amostra, ensaio) ? 'bg-green-400' : 'bg-gray-300'"
                              ></div>
                            </div>
                            <div>
                              <div class="text-sm font-medium text-gray-900">{{ensaio.tipo}}</div>
                              <div class="text-xs text-gray-500">{{ensaio.classe}}</div>
                            </div>
                          </div>
                          <button
                            (click)="$event.stopPropagation(); handleEnsaioAction(amostra, ensaio)"
                            class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md transition-colors"
                            [ngClass]="hasResult(amostra, ensaio) ?
                              'text-blue-700 bg-blue-100 hover:bg-blue-200' :
                              'text-green-700 bg-green-100 hover:bg-green-200'"
                          >
                            <ng-icon
                              [name]="hasResult(amostra, ensaio) ? 'heroPencilSquare' : 'heroPlusCircle'"
                              class="w-3 h-3 mr-1"
                            ></ng-icon>
                            {{hasResult(amostra, ensaio) ? 'Editar Análise' : 'Incluir Análise'}}
                          </button>
                        </div>}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>}
            </ng-container>}
          </tbody>
        </table>
      </div>

      <!-- Footer com informações -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span>Mostrando {{filteredAmostras.length}} de {{amostras().length}} amostras</span>
        </div>
      </div>
</div>

    </div>
  `,
})
export class TabelaAnaliseAmostrasComponent implements OnInit, OnChanges {
  amostras= input<IAmostra[]>([]);
  selectFilter= input<boolean>(true);
  incluirAnalise:OutputEmitterRef<{amostra: IAmostra, ensaio: ITipoAnalise}> = output<{amostra: IAmostra, ensaio: ITipoAnalise}>();
  editarAnalise:OutputEmitterRef<{amostra: IAmostra, ensaio: ITipoAnalise}> = output<{amostra: IAmostra, ensaio: ITipoAnalise}>();

  Status = Status;
  expandedRows = new Set<string>();
  searchTerm = '';
  statusFilter = '';
  filteredAmostras: IAmostra[] = [];

  ngOnInit() {
    this.filteredAmostras = [...this.amostras()];
  }

  ngOnChanges() {
    this.filterAmostras();
  }

  toggleExpansion(id: string) {
    if (this.expandedRows.has(id)) {
      this.expandedRows.delete(id);
    } else {
      this.expandedRows.add(id);
    }
  }

  filterAmostras() {
    let filtered = [...this.amostras()];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(amostra =>
        amostra.numeroOs.toLowerCase().includes(term) ||
        amostra.nomeAmostra.toLowerCase().includes(term) ||
        amostra.user.name.toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(amostra => amostra.status === this.statusFilter);
    }

    this.filteredAmostras = filtered;
  }

  getStatusClass(status: Status): string {
    const classes = {
      [Status.AGUARDANDO]: 'bg-yellow-100 text-yellow-800',
      [Status.AUTORIZADA]: 'bg-blue-100 text-blue-800',
      [Status.EXECUCAO]: 'bg-orange-100 text-orange-800',
      [Status.FINALIZADA]: 'bg-green-100 text-green-800',
      [Status.CANCELADA]: 'bg-red-100 text-red-800',
      [Status.DEFAULT]: 'bg-gray-100 text-gray-800'
    };
    return classes[mapStatus(status)] || classes[Status.DEFAULT];
  }

  getStatusIcon(status: Status): string {
    const icons = {
      [Status.AGUARDANDO]: 'heroClock',
      [Status.AUTORIZADA]: 'heroCheckCircle',
      [Status.EXECUCAO]: 'heroClock',
      [Status.FINALIZADA]: 'heroCheckCircle',
      [Status.CANCELADA]: 'heroXCircle',
      [Status.DEFAULT]: 'heroExclamationTriangle'
    };
    return icons[mapStatus(status)] || icons[Status.DEFAULT];
  }

  getProgressClass(progresso: number): string {
    if (progresso >= 100) return 'bg-green-500';
    if (progresso >= 75) return 'bg-blue-500';
    if (progresso >= 50) return 'bg-yellow-500';
    if (progresso >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  }

  hasResult(amostra: IAmostra, ensaio: ITipoAnalise): boolean {
    return amostra.resultados?.hasOwnProperty(ensaio.tipo);
  }

  getCompletedTests(amostra: IAmostra): number {
    return amostra.ensaiosSolicitados.filter(ensaio =>
      this.hasResult(amostra, ensaio)
    ).length;
  }

  handleEnsaioAction(amostra: IAmostra, ensaio: ITipoAnalise) {
    if (this.hasResult(amostra, ensaio)) {
      this.editarAnalise.emit({ amostra, ensaio });
    } else {
      this.incluirAnalise.emit({ amostra, ensaio });
    }
  }

  protected readonly getPrazoInicioFim = getPrazoInicioFim;
}

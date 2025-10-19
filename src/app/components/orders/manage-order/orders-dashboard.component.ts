import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  makeStateKey,
  PLATFORM_ID,
  TransferState
} from '@angular/core';
import {CommonModule, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {Subject, takeUntil} from 'rxjs';
import {
  heroClipboardDocumentList,
  heroClock,
  heroCheckCircle,
  heroArrowPath,
  heroXCircle,
  heroChartBar,
  heroCalendar,
  heroArrowTrendingUp,
  heroArrowTrendingDown,
  heroUser,
  heroBeaker
} from '@ng-icons/heroicons/outline';
import {OrderService} from '../../../services/order.service';
import {keyOfStatus, mapStatus, Status} from '../../../shared/enums/status.enum';
import {IOrders, IOrderStatistics} from '../../../shared/interfaces/orders.interface';
import {OrderViewService} from '../../../services/order-view.service';
import {RouterLink} from '@angular/router';
import {StatusModalComponent} from '../status-modal/status-modal.component';

const ALL_ORDERS_KEY = makeStateKey<IOrders[]>('all-orders');
const ESTATISTICAS_KEY = makeStateKey<IOrderStatistics>('estatisticas');


interface EstatisticasCard {
  titulo: string;
  valor: number;
  icone: string;
  cor: string;
  percentual?: number;
  tendencia?: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-orders-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent, RouterLink, StatusModalComponent],
  viewProviders: [
    provideIcons({
      heroClipboardDocumentList,
      heroClock,
      heroCheckCircle,
      heroArrowPath,
      heroXCircle,
      heroChartBar,
      heroCalendar,
      heroArrowTrendingUp,
      heroArrowTrendingDown,
      heroUser,
      heroBeaker
    })
  ],
  template: `
    <div class="flex w-full h-full overflow-hidden">
      <div class="flex-1 flex flex-col justify-start gap-2 ">

        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p class="text-slate-600 mt-1">Visão geral das ordens de serviço</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-500">Última atualização</p>
              <p class="text-sm font-medium text-slate-900">{{ ultimaAtualizacao() | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-2 overflow-y-auto">
          <!-- Cards de Estatísticas -->
          <div class="flex flex-1 gap-2">
            @for (card of cardsEstatisticas(); track $index) {
              <div
                class="bg-white flex-1 flex flex-col gap-2 rounded-xl shadow-sm border border-slate-200/60  hover:shadow-md transition-shadow duration-200">

                <div class=" w-full text-center rounded-t-md" [ngClass]="card.cor + '-bg'"><span
                  class="text-sm font-bold text-slate-600">{{ card.titulo }}</span></div>
                <div class="flex-1 flex justify-between px-4">
                  <div class="flex items-center justify-between mb-4">
                    <div class="p-2 rounded-lg" [ngClass]="card.cor + '-bg'">
                      <ng-icon [name]="card.icone" class="w-6 h-6" [ngClass]="card.cor + '-text'"/>
                    </div>
                  </div>

                  <div class="flex flex-col items-center justify-center">
                    <div class="flex gap-2">
                      <h3 class="text-2xl font-bold text-slate-900 mb-1">{{ card.valor | number }}</h3>

                    </div>
                  </div>
                  @if (card.tendencia) {
                    <div class="flex justify-end items-start gap-1 h-full">
                      <ng-icon
                        [name]="card.tendencia === 'up' ? 'heroArrowTrendingUp' : card.tendencia === 'down' ? 'heroArrowTrendingDown' : 'heroChartBar'"
                        class="w-4 h-4"
                        [ngClass]="getTendenciaClass(card.tendencia)">
                      </ng-icon>
                      <span class="text-xs font-medium" [ngClass]="getTendenciaClass(card.tendencia)">
            {{ card.percentual }}%
              </span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Gráficos e informações detalhadas -->
          <div class="flex flex-3 flex-1 gap-2">

            <!-- Distribuição por Status -->
            <div class="bg-white flex-1 rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-slate-900">Distribuição por Status</h3>
                <ng-icon name="heroChartBar" class="w-5 h-5 text-slate-400"/>
              </div>

              <div class="space-y-4">
                @for (item of distribuicaoStatus(); track $index) {
                  <a
                  [routerLink]="[(item.status == 'AUTORIZADA' || item.status == 'AGUARDANDO' ? '/manage-orders/waiting': '/')]"
                    class="flex items-center justify-between p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 rounded-lg"
                  >

                    <div class="flex items-center gap-3">
                      <div class="w-3 h-3 rounded-full" [style.background-color]="getStatusColor(item.status)"></div>
                      <span class="text-sm font-medium text-slate-900">{{ mapStatus(item.status).toUpperCase() }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-slate-900">{{ item.quantidade }}</span>
                      <div class="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all duration-300"
                          [style.width.%]="item.percentual"
                          [style.background-color]="getStatusColor(item.status)">
                        </div>
                      </div>
                    </div>
                  </a>
                }
              </div>
            </div>

            <!-- Ordens Recentes -->
            <div class="bg-white flex-1  rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-slate-900">Ordens Recentes</h3>
                <ng-icon name="heroClipboardDocumentList" class="w-5 h-5 text-slate-400"/>
              </div>

              <div class="space-y-3 max-h-80 overflow-y-auto">
                @for (ordem of ordensRecentes(); track ordem.id) {
                  <div
                    (click)="openDetails(ordem)"
                    class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors duration-200 cursor-pointer">
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {{ getInitials(ordem.solicitante?.name || 'N/A') }}
                    </div>

                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-900 truncate">{{ ordem.id }}</p>
                      <p class="text-xs text-slate-500 truncate">{{ ordem.solicitante?.name }}</p>
                    </div>

                    <div class="text-right">
                <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium"
                      [style.background-color]="getStatusColor(ordem.status) + '20'"
                      [style.color]="getStatusColor(ordem.status)">
            {{ ordem.status }}
            </span>
                      <p class="text-xs text-slate-500 mt-1">{{ ordem.createdAt | date:'dd/MM' }}</p>
                    </div>
                  </div>
                }

                @if (!ordensRecentes().length) {
                  <div class="text-center py-8 text-slate-500">
                    <ng-icon name="heroClipboardDocumentList" class="w-8 h-8 mx-auto mb-2 text-slate-400"/>
                    <p class="text-sm">Nenhuma ordem recente</p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Métricas Adicionais -->
          <div class="flex flex-2 gap-2">

            <!-- Produtividade -->
            <div class="bg-white flex-1 rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-green-100 rounded-lg">
                  <ng-icon name="heroArrowTrendingUp" class="w-5 h-5 text-green-600"/>
                </div>
                <h4 class="text-lg font-semibold text-slate-900">Produtividade</h4>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Ordens finalizadas hoje</span>
                  <span class="text-sm font-bold text-slate-900">{{ metricas().finalizadasHoje }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Tempo médio de execução</span>
                  <span class="text-sm font-bold text-slate-900">{{ metricas().tempoMedioExecucao }} dias</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Taxa de conclusão</span>
                  <span class="text-sm font-bold text-green-600">{{ metricas().taxaConclusao }}%</span>
                </div>
              </div>
            </div>

            <!-- Amostras -->
            <div class="bg-white flex-1 rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <ng-icon name="heroBeaker" class="w-5 h-5 text-purple-600"/>
                </div>
                <h4 class="text-lg font-semibold text-slate-900">Amostras</h4>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Total de amostras</span>
                  <span class="text-sm font-bold text-slate-900">{{ metricas().totalAmostras }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Em análise</span>
                  <span class="text-sm font-bold text-slate-900">{{ metricas().amostrasEmAnalise }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Amostras por ordem</span>
                  <span class="text-sm font-bold text-purple-600">{{ metricas().mediaAmostrasPorOrdem }}</span>
                </div>
              </div>
            </div>

            <!-- Solicitantes -->
            <div class="bg-white flex-1 rounded-xl shadow-sm border border-slate-200/60 p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-blue-100 rounded-lg">
                  <ng-icon name="heroUser" class="w-5 h-5 text-blue-600"/>
                </div>
                <h4 class="text-lg font-semibold text-slate-900">Solicitantes</h4>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Solicitantes ativos</span>
                  <span class="text-sm font-bold text-slate-900">{{ metricas().solicitantesAtivos }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Maior solicitante</span>
                  <span class="text-sm font-bold text-slate-900 truncate">{{ metricas().maiorSolicitante }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-slate-600">Ordens por solicitante</span>
                  <span class="text-sm font-bold text-blue-600">{{ metricas().mediaOrdensPorSolicitante }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <app-status-modal [selectOptions]="[Status.AUTORIZADA,Status.CANCELADA]" [isOpen]="isOpen()" [ordem]="selectedOrder()" />
  `,
})
export class OrdersDashboardComponent implements OnInit, OnDestroy {
  #platformId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  #orderView = inject(OrderViewService)
  private ordemService = inject(OrderService);
  private destroy$ = new Subject<void>();
  private ordens = signal<IOrders[]>([]);
  selectedOrder= signal<IOrders|null>(null);
  isOpen= signal<boolean>(false);

  // Signals
  ultimaAtualizacao = signal(new Date());
  estatisticas = signal<IOrderStatistics>({
    total: 0,
    porStatus: [],
    porMes: []
  });

  // Computed signals
  cardsEstatisticas = computed((): EstatisticasCard[] => {
    const stats = this.estatisticas();
    const ordens = this.ordemService.obterOrdensCache() || this.ordens();

    return [
      {
        titulo: 'Total de Ordens',
        valor: stats.total || ordens.length,
        icone: 'heroClipboardDocumentList',
        cor: 'bg-blue-100 text-blue-600',
        percentual: 12,
        tendencia: 'up'
      },
      {
        titulo: 'Em Execução',
        valor: stats.porStatus.find(item => item.status === keyOfStatus(Status.EXECUCAO))?.count || ordens.filter(o => o.status === Status.EXECUCAO).length,
        icone: 'heroArrowPath',
        cor: 'bg-purple-100 text-purple-600',
        percentual: 8,
        tendencia: 'up'
      },
      {
        titulo: 'Finalizadas',
        valor: stats.porStatus.find(item => item.status === keyOfStatus(Status.FINALIZADA))?.count || ordens.filter(o => o.status === Status.FINALIZADA).length,
        icone: 'heroCheckCircle',
        cor: 'bg-green-100 text-green-600',
        percentual: 15,
        tendencia: 'up'
      },
      {
        titulo: 'Aguardando',
        valor: stats.porStatus.find(item => item.status === keyOfStatus(Status.AGUARDANDO))?.count || ordens.filter(o => o.status === Status.AGUARDANDO).length,
        icone: 'heroClock',
        cor: 'bg-yellow-100 text-yellow-600',
        percentual: 5,
        tendencia: 'down'
      }
    ];
  });

  distribuicaoStatus = computed(() => {
    const ordens = this.ordemService.obterOrdensCache();
    const total = ordens.length;

    if (total === 0) return [];

    const statusCount = ordens.reduce((acc, ordem) => {
      const status = ordem.status || 'Sem Status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, quantidade]) => ({
      status,
      quantidade,
      percentual: (quantidade / total) * 100
    })).sort((a, b) => b.quantidade - a.quantidade);
  });

  ordensRecentes = computed(() => {
    const ordens = this.ordemService.obterOrdensCache();
    return ordens
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  });

  metricas = computed(() => {
    const ordens = this.ordemService.obterOrdensCache();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const finalizadasHoje = ordens.filter(o => {
      const dataFinalizacao = o.updatedAt || o.createdAt;
      if (!dataFinalizacao) return false;
      const data = new Date(dataFinalizacao);
      data.setHours(0, 0, 0, 0);
      return data.getTime() === hoje.getTime() && o.status === Status.FINALIZADA;
    }).length;

    const ordensFinalizadas = ordens.filter(o => o.status === Status.FINALIZADA);
    const tempoMedioExecucao = ordensFinalizadas.length > 0
      ? Math.round(ordensFinalizadas.reduce((acc, ordem) => {
        const inicio = new Date(ordem.createdAt || 0);
        const fim = new Date(ordem.updatedAt || ordem.createdAt || 0);
        const diffTime = fim.getTime() - inicio.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return acc + diffDays;
      }, 0) / ordensFinalizadas.length)
      : 0;

    const taxaConclusao = ordens.length > 0
      ? Math.round((ordensFinalizadas.length / ordens.length) * 100)
      : 0;

    const totalAmostras = ordens.reduce((acc, ordem) => acc + (ordem.amostras?.length || 0), 0);
    const amostrasEmAnalise = ordens
      .filter(o => o.status === Status.EXECUCAO)
      .reduce((acc, ordem) => acc + (ordem.amostras?.length || 0), 0);

    const mediaAmostrasPorOrdem = ordens.length > 0
      ? Math.round((totalAmostras / ordens.length) * 10) / 10
      : 0;

    const solicitantesUnicos = new Set(ordens.map(o => o.solicitante?.id).filter(Boolean));
    const solicitantesAtivos = solicitantesUnicos.size;

    const solicitanteCount = ordens.reduce((acc, ordem) => {
      const nome = ordem.solicitante?.name || 'Desconhecido';
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maiorSolicitante = Object.entries(solicitanteCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const mediaOrdensPorSolicitante = solicitantesAtivos > 0
      ? Math.round((ordens.length / solicitantesAtivos) * 10) / 10
      : 0;

    return {
      finalizadasHoje,
      tempoMedioExecucao,
      taxaConclusao,
      totalAmostras,
      amostrasEmAnalise,
      mediaAmostrasPorOrdem,
      solicitantesAtivos,
      maiorSolicitante,
      mediaOrdensPorSolicitante
    };
  });

  ngOnInit() {
    const estatisticas = this.#transferState.get(ESTATISTICAS_KEY, null);
    const ordens = this.#transferState.get(ALL_ORDERS_KEY, null);
    if (estatisticas && isPlatformBrowser(this.#platformId)) {
      this.estatisticas.set(estatisticas);
      this.ultimaAtualizacao.set(new Date());
      this.#transferState.remove(ESTATISTICAS_KEY);
    } else {
      this.carregarEstatisticas();
    }
    if (ordens && isPlatformBrowser(this.#platformId)) {
      this.ordens.set(ordens);
      this.#transferState.remove(ALL_ORDERS_KEY);
    } else {
      this.carregarOrdens();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

   openDetails(ordem: IOrders) {
    const headerButton = {
      label: 'Alterar Status',
      action:()=>{
        console.log('Alterar Status')
      }
    }
    this.#orderView.open({data:ordem,headerButton}).then(result => {
    });
  }

  private carregarOrdens() {
    this.ordemService.findAll().subscribe((res) => {
      if (res) {
        this.ordens.set(res);
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(ALL_ORDERS_KEY, res)
        }
      }
    })
  }

  private carregarEstatisticas() {
    this.ordemService.buscarEstatisticas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.estatisticas.set(stats);
          this.ultimaAtualizacao.set(new Date());
          if (isPlatformServer(this.#platformId)) {
            this.#transferState.set(ESTATISTICAS_KEY, stats);
          }
        },
        error: (error) => {
          console.error('Erro ao carregar estatísticas:', error);
        }
      });
  }

  getStatusColor(status?: string): string {
    if (!status) return '#64748b';
    const statuskey = mapStatus(status);
    switch (statuskey) {
      case Status.AGUARDANDO:
        return '#ca8a04'; // yellow-600
      case Status.AUTORIZADA:
        return '#2563eb'; // blue-600
      case Status.EXECUCAO:
        return '#9333ea'; // purple-600
      case Status.FINALIZADA:
        return '#16a34a'; // green-600
      case Status.CANCELADA:
        return '#dc2626'; // red-600
      default:
        return '#64748b'; // slate-500
    }
  }

  getTendenciaClass(tendencia: 'up' | 'down' | 'neutral'): string {
    switch (tendencia) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }


  protected readonly mapStatus = mapStatus;
  protected readonly Status = Status;
}

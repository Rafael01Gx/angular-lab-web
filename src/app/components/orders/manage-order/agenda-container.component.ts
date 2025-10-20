import { Component, computed, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroViewColumns, heroCalendar, heroChartBar ,heroArrowDownTray} from '@ng-icons/heroicons/outline';
import { AgendaCalendarComponent } from './agenda-calendar.component';
import { AgendaDashboardComponent } from './agenda-dashboard.component';
import { AnalyticsComponent } from "./analytics.component";
import { ExportService } from '../../../services/export.service';
import { FormatoExportacao, ExportModalComponent } from '../../modal/export-modal/export-modal.component';
import { AgendamentoSemanal, AgendaService } from '../../../services/agenda.service';

const AGENDA_KEY = makeStateKey<AgendamentoSemanal[]>('agenda-semanal-dashboard');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AgendaDashboardComponent,
    AgendaCalendarComponent,
    NgIconComponent,
    AnalyticsComponent,
    ExportModalComponent
  ],
  viewProviders: [provideIcons({ heroViewColumns, heroCalendar, heroChartBar,heroArrowDownTray })],
  template: `
    <div class="w-full h-full flex flex-col min-h-full bg-gradient-to-br from-slate-50 to-slate-100">
      <!-- Navegação -->
      <div class="bg-white shadow-sm border-b border-slate-200">
        <div class=" px-6 py-4">
          <div class="flex items-center justify-between">
             <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ng-icon [name]="titleSubtitleAndIcons().icon" size="28" class="text-blue-600"></ng-icon>
          {{ titleSubtitleAndIcons().title }}
        </h2>
            
            <div class="flex gap-2 bg-slate-100 rounded-lg p-1">
              <button
                (click)="visualizacao.set('dashboard')"
                [class.bg-white]="visualizacao() === 'dashboard'"
                [class.shadow-sm]="visualizacao() === 'dashboard'"
                class="flex items-center gap-2 px-4 py-2 rounded-md transition-all">
                <ng-icon name="heroViewColumns" size="20"></ng-icon>
                <span>Dashboard</span>
              </button>
              
              <button
                (click)="visualizacao.set('calendario')"
                [class.bg-white]="visualizacao() === 'calendario'"
                [class.shadow-sm]="visualizacao() === 'calendario'"
                class="flex items-center gap-2 px-4 py-2 rounded-md transition-all">
                <ng-icon name="heroCalendar" size="20"></ng-icon>
                <span>Calendário</span>
              </button>
              
              <button
                (click)="visualizacao.set('analytics')"
                [class.bg-white]="visualizacao() === 'analytics'"
                [class.shadow-sm]="visualizacao() === 'analytics'"
                class="flex items-center gap-2 px-4 py-2 rounded-md transition-all">
                <ng-icon name="heroChartBar" size="20"></ng-icon>
                <span>Analytics</span>
              </button>
                  <button
      (click)="mostrarModalExportacao.set(true)"
      class="flex items-center gap-2 px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700 transition-colors">
      <ng-icon name="heroArrowDownTray" size="20"></ng-icon>
      Exportar
    </button>
            </div>
          </div>
        </div>
    </div>

      <!-- Conteúdo -->
      <div class="flex flex-1 min-h-0">
        @if (visualizacao() === 'dashboard') {
          <app-agenda-dashboard [agendamentos]="agendamentos()" [error]="error()" [loading]="loading()" (onErrorRetry)="carregarAgendamentos()" class="flex-1" />
        }
        
        @if (visualizacao() === 'calendario') {
          <app-agenda-calendar [agendamentos]="agendamentos()" class="flex-1" />
        }
        
        @if (visualizacao() === 'analytics') {
          <app-analytics [agendamentos]="agendamentos()" class="flex-1" />
        }
      </div>
    </div>
        <!-- Modal de Exportação -->
    @if (mostrarModalExportacao()) {
      <app-export-modal
        (exportar)="exportar($event)"
        (cancelar)="mostrarModalExportacao.set(false)" />
    }
  `
})
export class AppComponent implements OnInit {
  #exportService = inject(ExportService);
  #agendaService = inject(AgendaService);
  #platformId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  visualizacao = signal<'dashboard' | 'calendario' | 'analytics'>('dashboard');
  mostrarModalExportacao = signal(false);
  error = signal<string | null>(null);
  loading = signal(false);
  agendamentos = signal<AgendamentoSemanal[]>([]);

  titleSubtitleAndIcons = computed(() => {
    switch (this.visualizacao()) {
      case 'dashboard':
        return {
          title: 'Dashboard de Agendamentos',
          subtitle: 'Visão geral dos agendamentos de ensaios',
          icon: 'heroViewColumns'
        };
      case 'calendario':
        return {
          title: 'Calendário de Agendamentos',
          subtitle: 'Visualize os agendamentos em formato de calendário',
          icon: 'heroCalendar'
        };
      case 'analytics':
        return {
          title: 'Análises de Agendamentos',
          subtitle: 'Estatísticas e insights dos agendamentos',
          icon: 'heroChartBar'
        };
    }
  });

  ngOnInit(): void {
    const dadosTransferidos = this.#transferState.get(AGENDA_KEY, null);
    if (dadosTransferidos && isPlatformBrowser(this.#platformId)) {
      this.agendamentos.set(dadosTransferidos);
      this.#transferState.remove(AGENDA_KEY);
    } else {
      this.carregarAgendamentos();
    }
  }

  exportar(formato: FormatoExportacao) {
    const dados = this.agendamentos();

    switch (formato) {
      case 'csv':
        this.#exportService.exportarCSV(dados);
        break;
      case 'json':
        this.#exportService.exportarJSON(dados);
        break;
      case 'excel':
        this.#exportService.exportarExcel(dados);
        break;
      case 'html':
        this.#exportService.exportarHTML(dados);
        break;
    }
  }

  carregarAgendamentos() {
    this.#agendaService.getAgendamentoSemanal().subscribe({
      next: (data) => {
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(AGENDA_KEY, data);
        }
        this.agendamentos.set(data);
        console.log('Agendamentos carregados:', data);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Erro ao carregar os agendamentos. Tente novamente mais tarde.');
        this.loading.set(false);
      },
    })
  }

}
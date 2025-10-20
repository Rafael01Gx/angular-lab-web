import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
  heroChevronRight,
  heroCalendar,
  heroBeaker,
} from '@ng-icons/heroicons/outline';
import { AgendamentoSemanal, AgendaService } from '../../../services/agenda.service';


interface DiaCalendario {
  data: Date;
  dia: number;
  mesAtual: boolean;
  agendamentos: AgendamentoSemanal[];
  totalAmostras: number;
}

@Component({
  selector: 'app-agenda-calendar',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroChevronLeft,
      heroChevronRight,
      heroCalendar,
      heroBeaker,
    }),
  ],
  template: `
    <div class="w-full h-full bg-white rounded-sm shadow-lg p-4 overflow-hidden flex flex-col">
      <!-- Header do Calendário -->
      <div class="flex items-center justify-end mb-6">
       
        
        <div class="flex items-center gap-4">
          <button
            (click)="mesAnterior()"
            class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ng-icon name="heroChevronLeft" size="24" class="text-slate-600"></ng-icon>
          </button>
          
          <div class="text-center min-w-[200px]">
            <div class="text-xl font-bold text-slate-800">{{ mesAnoAtual() }}</div>
            <div class="text-sm text-slate-600">{{ anoAtual() }}</div>
          </div>
          
          <button
            (click)="proximoMes()"
            class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ng-icon name="heroChevronRight" size="24" class="text-slate-600"></ng-icon>
          </button>
          
          <button
            (click)="voltarHoje()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Hoje
          </button>
        </div>
      </div>
       <!-- Dias da Semana -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        @for (dia of diasSemana; track dia) {
          <div class="text-center text-sm font-semibold text-slate-600 py-2">
            {{ dia }}
          </div>
        }
      </div>
     <div class="flex-1 overflow-y-auto p-4">


      <!-- Grade do Calendário -->
      <div class="grid grid-cols-7 gap-2">
        @for (dia of diasCalendario(); track dia.data.getTime()) {
          <div
            [class.opacity-40]="!dia.mesAtual"
            [class.bg-blue-50]="isHoje(dia.data)"
            [class.ring-2]="isHoje(dia.data)"
            [class.ring-blue-500]="isHoje(dia.data)"
            class="min-h-[120px] p-3 border border-slate-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
            (click)="selecionarDia(dia)">
            
            <div class="flex items-center justify-between mb-2">
              <span
                [class.font-bold]="isHoje(dia.data)"
                [class.text-blue-600]="isHoje(dia.data)"
                class="text-lg text-slate-700">
                {{ dia.dia }}
              </span>
              
              @if (dia.totalAmostras > 0) {
                <span class="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  <ng-icon name="heroBeaker" size="12"></ng-icon>
                  {{ dia.totalAmostras }}
                </span>
              }
            </div>

            @if (dia.agendamentos.length > 0) {
              <div class="space-y-1">
                @for (agendamento of dia.agendamentos.slice(0, 2); track agendamento.semana) {
                  <div class="text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2 py-1 rounded truncate">
                    {{ agendamento.totalAmostras }} ensaios
                  </div>
                }
                @if (dia.agendamentos.length > 2) {
                  <div class="text-xs text-slate-500 font-medium">
                    +{{ dia.agendamentos.length - 2 }} mais
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Modal de Detalhes do Dia -->
      @if (diaSelecionado()) {
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          (click)="fecharModal()">
          <div
            class="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            (click)="$event.stopPropagation()">
            
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-slate-800">
                {{ formatarData(diaSelecionado()!.data) }}
              </h3>
              <button
                (click)="fecharModal()"
                class="text-slate-500 hover:text-slate-700">
                ✕
              </button>
            </div>

            @if (diaSelecionado()!.agendamentos.length > 0) {
              <div class="space-y-4">
                @for (agendamento of diaSelecionado()!.agendamentos; track agendamento.semana) {
                  <div class="border border-slate-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-semibold text-slate-800">{{ agendamento.semana }}</h4>
                      <span class="text-sm text-slate-600">
                        {{ agendamento.totalAmostras }} amostras
                      </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2">
                      @for (tipo of agendamento.tiposAnalise; track tipo.tipo) {
                        <div class="bg-slate-50 rounded-lg p-3">
                          <div class="font-medium text-sm text-slate-800">{{ tipo.tipo }}</div>
                          <div class="text-xs text-slate-600">{{ tipo.classe }}</div>
                          <div class="text-lg font-bold text-blue-600 mt-1">
                            {{ tipo.quantidade }}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-8 text-slate-500">
                <ng-icon name="heroCalendar" size="48" class="mx-auto mb-2 opacity-50"></ng-icon>
                <p>Nenhum agendamento para este dia</p>
              </div>
            }
          </div>
        </div>
      }
     </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AgendaCalendarComponent {
  mesAtual = signal(new Date().getMonth());
  anoAtual = signal(new Date().getFullYear());
  agendamentos = input<AgendamentoSemanal[]>([]);
  diaSelecionado = signal<DiaCalendario | null>(null);

  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  mesesAno = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Computed
  mesAnoAtual = computed(() => this.mesesAno[this.mesAtual()]);

  diasCalendario = computed(() => {
    const mes = this.mesAtual();
    const ano = this.anoAtual();
    
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias: DiaCalendario[] = [];

    // Dias do mês anterior
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const data = new Date(ano, mes - 1, ultimoDiaMesAnterior - i);
      dias.push({
        data,
        dia: ultimoDiaMesAnterior - i,
        mesAtual: false,
        agendamentos: this.getAgendamentosParaDia(data),
        totalAmostras: this.getTotalAmostrasParaDia(data),
      });
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = new Date(ano, mes, dia);
      dias.push({
        data,
        dia,
        mesAtual: true,
        agendamentos: this.getAgendamentosParaDia(data),
        totalAmostras: this.getTotalAmostrasParaDia(data),
      });
    }

    // Dias do próximo mês
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const data = new Date(ano, mes + 1, dia);
      dias.push({
        data,
        dia,
        mesAtual: false,
        agendamentos: this.getAgendamentosParaDia(data),
        totalAmostras: this.getTotalAmostrasParaDia(data),
      });
    }

    return dias;
  });


  getAgendamentosParaDia(data: Date): AgendamentoSemanal[] {
    return this.agendamentos().filter((ag) => {
      const inicio = new Date(ag.dataInicio);
      const fim = new Date(ag.dataFim);
      return data >= inicio && data <= fim;
    });
  }

  getTotalAmostrasParaDia(data: Date): number {
    return this.getAgendamentosParaDia(data).reduce(
      (acc, ag) => acc + ag.totalAmostras,
      0
    );
  }

  isHoje(data: Date): boolean {
    const hoje = new Date();
    return (
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    );
  }

  mesAnterior() {
    if (this.mesAtual() === 0) {
      this.mesAtual.set(11);
      this.anoAtual.set(this.anoAtual() - 1);
    } else {
      this.mesAtual.set(this.mesAtual() - 1);
    }
  }

  proximoMes() {
    if (this.mesAtual() === 11) {
      this.mesAtual.set(0);
      this.anoAtual.set(this.anoAtual() + 1);
    } else {
      this.mesAtual.set(this.mesAtual() + 1);
    }
  }

  voltarHoje() {
    const hoje = new Date();
    this.mesAtual.set(hoje.getMonth());
    this.anoAtual.set(hoje.getFullYear());
  }

  selecionarDia(dia: DiaCalendario) {
    this.diaSelecionado.set(dia);
  }

  fecharModal() {
    this.diaSelecionado.set(null);
  }

  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
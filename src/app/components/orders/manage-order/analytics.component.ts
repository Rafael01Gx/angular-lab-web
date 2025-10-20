// analytics.component.ts
import { Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendamentoSemanal, AgendaService } from '../../../services/agenda.service';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col min-h-0 w-full h-full space-y-4 p-2 overflow-hidden">
      <!-- KPIs -->
      <div class="flex gap-4">
        <div class=" flex-1 bg-white rounded-xl p-6 shadow-sm">
          <div class="text-slate-600 text-sm mb-1">Taxa de Conclusão</div>
          <div class="text-3xl font-bold text-green-600">{{ taxaConclusao() }}%</div>
        </div>
        
        <div class="flex-1 bg-white rounded-xl p-6 shadow-sm">
          <div class="text-slate-600 text-sm mb-1">Média por Semana</div>
          <div class="text-3xl font-bold text-blue-600">{{ mediaPorSemana() }}</div>
        </div>
        
        <div class="flex-1 bg-white rounded-xl p-6 shadow-sm">
          <div class="text-slate-600 text-sm mb-1">Tipo Mais Comum</div>
          <div class="text-xl font-bold text-purple-600">{{ tipoMaisComum() }}</div>
        </div>
        
        <div class="flex-1 bg-white rounded-xl p-6 shadow-sm">
          <div class="text-slate-600 text-sm mb-1">Tendência</div>
          <div class="text-3xl font-bold" [class.text-green-600]="tendencia() > 0" [class.text-red-600]="tendencia() < 0">
            {{ tendencia() > 0 ? '↑' : '↓' }} {{ Math.abs(tendencia()) }}%
          </div>
        </div>
      </div>
        <div class="flex-1 flex gap-4">
          <!-- Gráfico de Barras Simples -->
      <div class="flex-1 bg-white rounded-xl p-6 shadow-sm">
        <h3 class="text-xl font-bold text-slate-800 mb-4">Distribuição por Semana</h3>
        <div class="space-y-3">
          @for (item of distribuicao(); track item.semana) {
            <div>
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="text-slate-600">{{ item.semana }}</span>
                <span class="font-semibold text-slate-800">{{ item.total }} amostras</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                  [style.width.%]="(item.total / maxAmostras()) * 100">
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Top Tipos de Análise -->
      <div class=" flex-1 bg-white rounded-xl p-6 shadow-sm ">
        <h3 class="text-xl font-bold text-slate-800 mb-4">Top 5 Tipos de Análise</h3>
        <div class="space-y-2">
          @for (tipo of topTipos(); track tipo.nome; let i = $index) {
            <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div class="text-2xl font-bold text-slate-400 w-8">{{ i + 1 }}</div>
              <div class="flex-1">
                <div class="font-semibold text-slate-800">{{ tipo.nome }}</div>
                <div class="text-sm text-slate-600">{{ tipo.classe }}</div>
              </div>
              <div class="text-2xl font-bold text-blue-600">{{ tipo.quantidade }}</div>
            </div>
          }
        </div>
      </div>
    </div>

    </div>
  `
})
export class AnalyticsComponent {
    agendamentos = input<AgendamentoSemanal[]>([]);
    Math = Math;

    taxaConclusao = computed(() => {
        const total = this.agendamentos().reduce((acc, sem) => acc + sem.totalAmostras, 0);
        // Simulação - você implementaria a lógica real aqui
        return total > 0 ? 85 : 0;
    });

    mediaPorSemana = computed(() => {
        const total = this.agendamentos().reduce((acc, sem) => acc + sem.totalAmostras, 0);
        const semanas = this.agendamentos().length;
        return semanas > 0 ? Math.round(total / semanas) : 0;
    });

    tipoMaisComum = computed(() => {
        const tipos = new Map<string, number>();
        this.agendamentos().forEach(sem => {
            sem.tiposAnalise.forEach(tipo => {
                tipos.set(tipo.tipo, (tipos.get(tipo.tipo) || 0) + tipo.quantidade);
            });
        });

        let max = 0;
        let tipoMax = 'N/A';
        tipos.forEach((qtd, tipo) => {
            if (qtd > max) {
                max = qtd;
                tipoMax = tipo;
            }
        });

        return tipoMax;
    });

    tendencia = computed(() => {
        // compara últimas 2 semanas
        const semanas = this.agendamentos();
        if (semanas.length < 2) return 0;

        const ultima = semanas[semanas.length - 1].totalAmostras;
        const penultima = semanas[semanas.length - 2].totalAmostras;

        if (penultima === 0) return 0;
        return Math.round(((ultima - penultima) / penultima) * 100);
    });

    distribuicao = computed(() => {
        return this.agendamentos().map(sem => ({
            semana: sem.semana,
            total: sem.totalAmostras
        }));
    });

    maxAmostras = computed(() => {
        return Math.max(...this.agendamentos().map(sem => sem.totalAmostras), 1);
    });

    topTipos = computed(() => {
        const tipos = new Map<string, { nome: string; classe: string; quantidade: number }>();

        this.agendamentos().forEach(sem => {
            sem.tiposAnalise.forEach(tipo => {
                const chave = `${tipo.tipo}|${tipo.classe}`;
                if (tipos.has(chave)) {
                    tipos.get(chave)!.quantidade += tipo.quantidade;
                } else {
                    tipos.set(chave, {
                        nome: tipo.tipo,
                        classe: tipo.classe,
                        quantidade: tipo.quantidade
                    });
                }
            });
        });

        return Array.from(tipos.values())
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5);
    });
}
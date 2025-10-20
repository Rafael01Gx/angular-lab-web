import { Component, Input, Output, EventEmitter, inject, input, OutputEmitterRef, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
    heroXMark,
    heroBeaker,
    heroCalendar,
    heroUser,
    heroEnvelope,
    heroPhone,
    heroCheckCircle,
    heroClipboardDocumentList
} from '@ng-icons/heroicons/outline';
import { IAmostra } from '../../../shared/interfaces/amostra.interface';
import { getPrazoInicioFim } from '../../../shared/utils/get-prazo-inicio-fim';

@Component({
    selector: 'app-amostra-details-modal',
    standalone: true,
    imports: [CommonModule, NgIconComponent],
    viewProviders: [
        provideIcons({
            heroXMark,
            heroBeaker,
            heroCalendar,
            heroUser,
            heroEnvelope,
            heroPhone,
            heroCheckCircle,
            heroClipboardDocumentList
        })
    ],
    template: `
    @if (isOpen() && amostra()) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md rounded-sm animate-fade-in"
        (click)="closeModal()">
        
        <div 
          class="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden animate-scale-in"
          (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-slate-900">Laudo de Análise</h2>
                <p class="text-sm text-slate-500 mt-0.5">Detalhes da Amostra</p>
              </div>
              <button 
                (click)="closeModal()"
                class="p-1.5 hover:bg-slate-100 rounded-md transition-colors">
                <ng-icon name="heroXMark" class="text-slate-400" size="20"></ng-icon>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
            
            <!-- Área Solicitante -->
            <div class="border border-slate-200 rounded-md">
              <div class="bg-blue-100  px-4 py-2 border-b border-slate-200">
                <h3 class="text-sm font-medium text-slate-700 uppercase tracking-wide">Área Solicitante</h3>
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Área</label>
                  <p class="mt-1 text-sm text-slate-900">GAPSI</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Requerente</label>
                  <p class="mt-1 text-sm text-slate-900">{{ amostra()!.user.name || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Prazo</label>
                  <p class="mt-1 text-sm text-slate-900">{{ getPrazoInicioFim(amostra()!.prazoInicioFim) }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">E-mail</label>
                  <p class="mt-1 text-sm text-slate-900 truncate">{{ amostra()!.user.email || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Contato</label>
                  <p class="mt-1 text-sm text-slate-900">{{ amostra()!.user.phone || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Identificação da Amostra -->
            <div class="border border-slate-200 rounded-md">
              <div class="bg-blue-100  px-4 py-2 border-b border-slate-200">
                <h3 class="text-sm font-medium text-slate-700 uppercase tracking-wide">Identificação da Amostra</h3>
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Nome da Amostra</label>
                  <p class="mt-1 text-sm text-slate-900 font-medium">{{ amostra()!.nomeAmostra }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Tipo de Amostra</label>
                  <p class="mt-1 text-sm text-slate-900">{{ amostra()!.amostraTipo || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Data da Amostra</label>
                  <p class="mt-1 text-sm text-slate-900">{{ formatDate(amostra()!.dataAmostra) }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-slate-500 uppercase">Data da Recepção</label>
                  <p class="mt-1 text-sm text-slate-900">{{ formatDate(amostra()!.dataRecepcao) }}</p>
                </div>
              </div>
            </div>

            <!-- Ensaios Solicitados -->
            <div class="border border-slate-200 rounded-md">
              <div class="bg-blue-100  px-4 py-2 border-b border-slate-200">
                <h3 class="text-sm font-medium text-slate-700 uppercase tracking-wide">Ensaios Solicitados</h3>
              </div>
              <div class="p-4">
                <div class="flex flex-wrap gap-2">
                  @for (ensaio of amostra()!.ensaiosSolicitados; track ensaio.id) {
                    <span class="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200 uppercase">
                      {{ ensaio.tipo }}
                    </span>
                  }
                </div>
              </div>
            </div>

            <!-- Resultados -->
            @if (amostra()!.resultados && hasResultados()) {
              <div class="space-y-4">
                @for (resultado of getResultadosArray(); track resultado.key) {
                  <div class="border border-slate-200 rounded-md">
                    <div class="bg-blue-100  px-4 py-2 border-b border-slate-200">
                      <h3 class="text-sm font-medium text-slate-700 uppercase tracking-wide">{{ resultado.key }}</h3>
                    </div>
                    <div class="p-4">
                      <div class="overflow-x-auto">
                        @if (isSpecialCase(resultado.key)) {
                          <div class="flex items-center justify-center flex-col gap-1">
                            @for (param of getParametros(resultado.value); track $index) {
                              <div class="flex items-stretch border border-slate-200 rounded overflow-hidden text-sm">
                                <div class="bg-blue-50 text-slate-700 px-3 py-2 font-medium flex-grow min-w-[200px]">
                                  {{ param.descricao }} {{ param.subDescricao || '' }}
                                </div>
                                <div class="bg-white px-3 py-2 text-center font-semibold text-slate-900 min-w-[100px] border-l border-slate-200">
                                  {{ formatResultado(param.valor, param.casasDecimais) }}
                                </div>
                                <div class="bg-blue-50  px-3 py-2 text-center text-slate-600 min-w-[80px] border-l border-slate-200">
                                  {{ param.unidadeResultado }}
                                </div>
                              </div>
                            }
                          </div>
                        } @else {
                          <div class="flex items-center justify-center gap-1">
                            @for (param of getParametros(resultado.value); track $index) {
                              <div class="flex flex-col items-center border border-slate-200 rounded overflow-hidden text-center text-sm">
                                <div class="bg-blue-50 text-slate-700 px-3 py-2 font-medium flex-grow w-full">
                                  {{ param.descricao }} {{ param.subDescricao || '' }}
                                </div>
                                <div class="bg-white px-3 py-2 text-center font-semibold text-slate-900 min-w-[100px] w-full">
                                  {{ formatResultado(param.valor, param.casasDecimais) }}
                                </div>
                                <div class="bg-blue-50  px-3 py-2 text-center text-slate-600 min-w-[80px] w-full">
                                  {{ param.unidadeResultado }}
                                </div>
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Elaboração & Aprovação -->
            <div class="border border-slate-200 rounded-md">
              <div class="bg-blue-100  px-4 py-2 border-b border-slate-200">
                <h3 class="text-sm font-medium text-slate-700 uppercase tracking-wide">Elaboração & Aprovação</h3>
              </div>
              <div class="p-4">
                <div class="flex flex-wrap gap-4">
                  @for (analista of amostra()!.analistas; track analista.id) {
                    <div class="inline-flex flex-col items-center border border-slate-300 rounded px-4 py-3 bg-white  min-w-[180px]">
                      <div class="text-xs font-medium text-slate-900 uppercase text-center">{{ analista.name }}</div>
                      <div class="text-[10px] text-slate-600 mt-0.5 bg-slate-200 px-2 py-0.5 rounded">{{ analista.funcao || 'Analista' }}</div>
                      <div class="text-[10px] font-semibold text-slate-700 mt-1 italic">{{ analista.area || '' }}</div>
                    </div>
                  }
                  
                  @if (amostra()!.revisor) {
                    <div class="inline-flex flex-col items-center border-2 border-emerald-400 rounded px-4 py-3 bg-emerald-50 min-w-[180px]">
                      <div class="text-xs font-medium text-slate-900 uppercase text-center">{{ amostra()!.revisor.name }}</div>
                      <div class="text-[10px] text-emerald-800 mt-0.5 bg-emerald-200 px-2 py-0.5 rounded font-medium">{{ amostra()!.revisor.funcao || 'Revisor' }}</div>
                      <div class="text-[10px] font-semibold text-slate-700 mt-1 italic">{{ amostra()!.revisor.area || '' }}</div>
                    </div>
                  }
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 font-medium">Status:</span>
                  <span class="px-2 py-1 rounded text-[10px] font-semibold uppercase bg-green-100 text-green-700">
                    {{ amostra()!.status }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-slate-500 font-medium">Progresso:</span>
                  <span class="text-slate-900 font-semibold">{{ amostra()!.progresso }}%</span>
                </div>
              </div>
              <div class="flex gap-3">
                <button 
                  (click)="closeModal()"
                  class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-blue-100  transition-colors">
                  Fechar
                </button>
                <button
                  (click)="revisar()"
                  class="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <ng-icon name="heroCheckCircle" size="16"></ng-icon>
                  Revisar
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    }`
})
export class AmostraDetailsModalComponent {
    amostra = input.required<IAmostra|null>();
    isOpen = input<boolean>(false);
    close: OutputEmitterRef<void> = output<void>();
    onRevisar: OutputEmitterRef<IAmostra> = output<IAmostra>();

    closeModal(): void {
        this.close.emit();
    }

    revisar(): void {
        if (this.amostra()) {
            this.onRevisar.emit(this.amostra()!);
        }
    }

    formatDate(date: any): string {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('pt-BR');
    }


    getInitials(name?: string): string {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }

    hasResultados(): boolean {
        return !!(this.amostra()?.resultados && Object.keys(this.amostra()!.resultados).length > 0);
    }

    getResultadosArray(): Array<{ key: string, value: any }> {
        if (!this.amostra()!.resultados) return [];
        return Object.entries(this.amostra()!.resultados).map(([key, value]) => ({ key, value }));
    }

    getParametros(value: any): any[] {
        return Object.values(value);
    }

    isSpecialCase(key: string): boolean {
        return key.length > 10;
    }

    formatResultado(valor: any, casasDecimais?: number): string {
        if (valor === null || valor === undefined) return 'N/A';
        if (typeof valor === 'number' && casasDecimais !== undefined) {
            return valor.toFixed(casasDecimais);
        }
        return String(valor);
    }

    protected readonly getPrazoInicioFim = getPrazoInicioFim
}

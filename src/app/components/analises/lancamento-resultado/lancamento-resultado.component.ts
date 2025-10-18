import {Component, computed, effect, inject, signal} from '@angular/core';
import {AnaliseForm, ParametrosForm} from '../../../shared/interfaces/form-analise.interface';
import {
  LancamentoResultadoFormComponent
} from '../../forms/lancamento-resultado-form/lancamento-resultado-form.component';
import {ActivatedRoute, Router} from '@angular/router';
import {IAnalysisSettings} from '../../../shared/interfaces/analysis-settings.interface';
import {toSignal} from '@angular/core/rxjs-interop';
import {IAmostra} from '../../../shared/interfaces/amostra.interface';
import {CommonModule, DatePipe, Location} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroArrowSmallLeft} from '@ng-icons/heroicons/outline';
import {AmostrasService} from '../../../services/amostras.service';
import {ToastrService} from '../../../services/toastr.service';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import { keyOfStatus, Status } from '../../../shared/enums/status.enum';

@Component({
  selector: 'app-lancamento-resultado',
  standalone: true,
  imports: [
    LancamentoResultadoFormComponent,
    CommonModule,
    FormsModule, DatePipe, NgIcon
  ],
  viewProviders: [provideIcons({heroArrowSmallLeft})],
  template: `
    <div class="w-full h-full flex gap-6 p-6 bg-gray-50">

      <!-- Header com botão voltar -->
      @if (amostra() && configuracoes()) {

        <!-- Coluna Esquerda: Informações e Seleção -->
        <div class="w-80 flex flex-col gap-4">

          <div class="bg-white rounded-md shadow-sm border border-gray-200 p-2">
            <button
              (click)="voltar()"
              class="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm"
            >
              <ng-icon name="heroArrowSmallLeft" size="18" class="mr-2"/>
              Voltar
            </button>
          </div>

          <!-- Card: Informações da Amostra -->
          <div class="bg-white rounded-md shadow-sm border border-gray-200 p-5">

            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-50 rounded-md">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">Informações</h3>
            </div>

            <div class="space-y-3">
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">OS</p>
                <p class="text-sm font-medium text-gray-900">{{ amostra().numeroOs }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Amostra</p>
                <p class="text-sm font-medium text-gray-900">{{ amostra().nomeAmostra }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Data</p>
                <p class="text-sm font-medium text-gray-900">{{ amostra().dataAmostra | date: 'dd-MM-yyyy' }}</p>
              </div>
            </div>
          </div>


          <!-- Card: Status do Resultado -->
          @if (resultadoExiste()) {
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-md border border-amber-200 p-5">
              <div class="flex items-start gap-3 mb-4">
                <div class="p-2 bg-white rounded-md shadow-sm">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-amber-900 mb-1">Resultado Existente</h4>
                  <p class="text-xs text-amber-700 leading-relaxed">
                    Já existe um resultado para <span class="font-medium">"{{ analiseTipo() }}"</span>.
                    Para alterar a configuração , exclua o resultado atual.
                  </p>
                </div>
              </div>

              <button
                (click)="excluirResultado()"
                class="w-full px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 font-medium text-sm rounded-md border border-red-200 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Remover Resultado
              </button>
            </div>
          } @else {
            <!-- Card: Seleção de Análise -->
            <div class="bg-white rounded-md shadow-sm border border-gray-200 p-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 bg-purple-50 rounded-md">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
                <h3 class="font-semibold text-gray-900">Configuração</h3>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-2">
                    Tipo de Análise
                  </label>
                  <select
                    #selectedConfigId
                    (change)="onConfigChange(selectedConfigId.value)"
                    [disabled]="resultadoExiste()"
                    class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
                  >
                    <option [value]="null">Selecione...</option>
                    @for (config of configuracoes(); track config.id) {
                      <option [value]="config.id">
                        {{ config.nomeDescricao }}
                      </option>
                    }
                  </select>
                </div>

                @if (currentAnalise()) {
                  <div class="pt-3 border-t border-gray-100">
                    <div class="flex items-start gap-2">
                      <svg class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-gray-500 mb-0.5">Tipo</p>
                        <p class="text-sm text-gray-900 truncate">{{ analiseTipo() }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        </div>

        <!-- Coluna Direita: Formulário -->
        <div class="flex-1 flex flex-col">
          @if (currentAnalise()) {
            <!-- Modo Inclusão -->
            <div class="flex-1 flex flex-col bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-50 rounded-md">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">{{resultadoExiste() ? "Editar Resultado" :"Incluir Resultado" }}</h2>
                    <p class="text-sm text-gray-600">{{ currentAnalise()?.nomeDescricao }}</p>
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-auto">
                <app-lancamento-resultado-form
                  [parametrosConfig]="currentAnalise()"
                  (formSaved)="onFormSaved($event)"
                  [editar]="resultadoExiste()"
                />
              </div>
            </div>
          } @else {
            <!-- Estado Vazio -->
            <div
              class="flex-1 flex items-center justify-center bg-white rounded-md border-2 border-dashed border-gray-300">
              <div class="text-center p-12">
                <div class="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma Configuração
                </h3>
                <p class="text-sm text-gray-500 max-w-sm mx-auto">
                  Escolha uma configuração de análise no painel lateral para começar a lançar resultados
                </p>
              </div>
            </div>
          }
        </div>

      } @else {
        <!-- Loading -->
        <div class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="inline-flex p-4 bg-blue-50 rounded-full mb-4">
              <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
            <p class="text-sm font-medium text-gray-900 mb-1">Carregando dados</p>
            <p class="text-xs text-gray-500">Aguarde um momento...</p>
          </div>
        </div>
      }
    </div>
  `
})
export class LancamentoResultadoComponent {
  #route = inject(ActivatedRoute);
  #location = inject(Location);
  #amostrasService = inject(AmostrasService);
  #confirmModal = inject(ConfirmationModalService);
  #toast = inject(ToastrService);
  currentAnalise = signal<AnaliseForm | Record<string, ParametrosForm> | null>(null);
  data = toSignal(this.#route.data);

  analiseTipo = computed(() => {
    const configs = this.data()?.['configssettings'] as IAnalysisSettings[];
    return configs?.[0]?.tipoAnalise?.tipo as string;
  });
  amostraRota = computed(() => this.data()?.['amostra'] as IAmostra)
  amostra = signal<IAmostra>(this.amostraRota());


  configuracoes = computed(() => this.data()?.['configssettings'] as IAnalysisSettings[]
  );

  // Verifica se já existe resultado para o tipo de análise atual
  resultadoExiste = computed(() => {
    const tipo = this.analiseTipo();
    const amostra = this.amostra();
    return !!(tipo && amostra?.resultados && amostra.resultados.hasOwnProperty(tipo));
  });

  constructor() {
    effect(() => {
      if (this.resultadoExiste())
        this.currentAnalise.set(this.amostra().resultados[this.analiseTipo()]);
    });
  }

  // Chamado quando uma configuração é selecionada
  onConfigChange(configId: string | null) {
    if (!configId) {
      this.currentAnalise.set(null);
      return;
    }

    const config = this.configuracoes()?.find(c => c.id === parseInt(configId));
    if (config) {
      this.currentAnalise.set(config as AnaliseForm);
    }
  }

  clearAnalise() {
    this.currentAnalise.set(null);
  }

  onFormSaved(data: any) {
    const tipo = this.analiseTipo();

    if (!tipo) {
      console.error('Tipo de análise não encontrado');
      return;
    }

    const updateAmostra = this.amostra();
    updateAmostra.status = keyOfStatus(Status.EXECUCAO) as Status;
    if (!updateAmostra.resultados) {
      updateAmostra.resultados = {};
    }
    updateAmostra.resultados[tipo] = {...data};
    this.atualizarAmostra(updateAmostra).subscribe((res) => {
      if (res) {
        this.#toast.success("Análise salva com sucesso!");
        setTimeout(() => {
          this.#location.back();
        })
      }
    });


    this.clearAnalise();
  }

  atualizarAmostra(data: IAmostra) {
    return this.#amostrasService.update(this.amostra().id, data);
  }


  excluirResultado() {
    const tipo = this.analiseTipo();

    this.#confirmModal.confirmDelete(tipo, "Remover resultados?").then((confirm) => {
      if (confirm) {
        const updateAmostra = this.amostra();
        delete updateAmostra.resultados[tipo]
        this.atualizarAmostra(updateAmostra).subscribe((res) => {
          if (res) {
            this.#toast.info("Análise removida com sucesso!");
            this.currentAnalise.set(null)
            this.amostra.update(v => res);
          }
        });
      }
    })
  }

  voltar() {
    this.#location.back();

  }
}

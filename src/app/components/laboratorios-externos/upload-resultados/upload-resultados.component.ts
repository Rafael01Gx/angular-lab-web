import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroArrowUpTray,
  heroCog6Tooth,
  heroXMark,
  heroCheck,
  heroChevronDown,
  heroChevronUp,
  heroDocumentText,
  heroChevronLeft
} from '@ng-icons/heroicons/outline';
import { UploadConfig } from '../../../shared/interfaces/upload-resultados.interface';
import { AmostraLabExternoFullUpload } from '../../../shared/interfaces/laboratorios-externos.interfaces';
import { DEFAULT_UPLOAD_CONFIG, UploadResultadoService } from '../../../services/upload-resultado.service';

@Component({
  selector: 'app-upload-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroArrowUpTray,
      heroCog6Tooth,
      heroXMark,
      heroCheck,
      heroChevronDown,
      heroChevronUp,
      heroDocumentText,
      heroChevronLeft
    })
  ],
  template: `
    <div class="h-full w-full gap-1 bg-white p-0 rounded-sm flex flex-col overflow-hidden">
       
          <!-- Header -->
          <div class="relative flex items-center gap-2 bg-gradient-to-r from-blue-600/90 to-blue-700/90 p-6 text-white">
            <div class="absolute top-0 left-0 h-full flex items-center shadow-lg rounded-l-md hover:cursor-pointer">
            <ng-icon name="heroChevronLeft" class="text-slate-400  hover:scale-107 " size="24"/>
            </div>
            <h2 class="text-xl font-semibold ml-4">Incluir Resultados de Analíses</h2>
          </div>

      <div class="flex-1 flex-col overflow-y-auto" >
  <!-- Upload Section -->
      <div class="p-6 flex flex-col ">
  <div class="flex gap-4 items-start min-h-0">
    <!-- Área principal de upload -->
    <div class="flex-1">
      <div
        (click)="fileInput.click()"
        class="border-2 border-dashed border-slate-300 rounded-md p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
      >
        <input
          #fileInput
          type="file"
          accept=".xls,.xlsx,.csv"
          (change)="onFileChange($event)"
          class="hidden"
        />
        <ng-icon name="heroDocumentText" class="mx-auto h-12 w-12 text-slate-400 mb-3" size="48"></ng-icon>

        @if (selectedFile()) {
          <div class="flex items-center justify-center gap-2">
            <ng-icon name="heroCheck" class="h-5 w-5 text-green-600"></ng-icon>
            <span class="text-slate-700 font-medium">{{ selectedFile()?.name }}</span>
            <button
              (click)="removeFile($event)"
              class="ml-2 text-red-500 hover:text-red-700"
            >
              <ng-icon name="heroXMark" class="h-4 w-4"></ng-icon>
            </button>
          </div>
        } @else {
          <p class="text-slate-600 font-medium mb-1">Clique para selecionar arquivo de resultados de análises</p>
          <p class="text-sm text-slate-500">Excel (.xls, .xlsx) ou CSV</p>
        }
      </div>

      @if (selectedFile()) {
        <button
          (click)="handleUpload()"
          [disabled]="isUploading()"
          class="mt-4 w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          @if (isUploading()) {
            <div class="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processando...</span>
          } @else {
            <ng-icon name="heroArrowUpTray" class="h-5 w-5"></ng-icon>
            <span>Enviar Arquivo</span>
          }
        </button>
      }
    </div>

    <!-- Botão de configuração -->
    <button
    [disabled]="selectedFile() || amostras().length > 0"
      (click)="toggleConfig()"
      class="p-3 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors flex-shrink-0 disabled:bg-gray-400 disabled:bg-gray-400"
      title="Configurações"
    >
      <ng-icon 
        name="heroCog6Tooth" 
        class="h-6 w-6 text-gray-700"
        [class.animate-spin]="showConfig() && !selectedFile() && !(amostras().length > 0)"
      ></ng-icon>
    </button>
  </div>
        </div>

          <!-- Painel de configuração -->
  @if (showConfig() && !selectedFile() && !(amostras().length > 0)) {
    <div class="flex-1 flex flex-col mt-6 bg-slate-50 rounded-md p-6 border border-slate-200 overflow-hidden">
      <h3 class="text-lg font-semibold text-slate-800 mb-4 flex-shrink-0">
        Configurações de Importação
      </h3>

      <div class="flex-1 min-h-0 overflow-y-auto pr-1">
        <div class="flex flex-wrap gap-4 pb-6">

          <!-- Cabeçalho -->
          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Coluna de busca do cabeçalho
              <span class="text-xs text-slate-500 block font-normal">Índice da coluna onde está o valor "Type"</span>
            </label>
            <input
              type="number"
              [(ngModel)]="config().headerSearch.columnIndex"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Valor do cabeçalho
              <span class="text-xs text-slate-500 block font-normal">Texto esperado na célula de cabeçalho</span>
            </label>
            <input
              type="text"
              [(ngModel)]="config().headerSearch.value"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Offsets -->
          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Offset da linha de elementos
              <span class="text-xs text-slate-500 block font-normal">Linhas após cabeçalho onde ficam nomes dos elementos</span>
            </label>
            <input
              type="number"
              [(ngModel)]="config().elementosRowOffset"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Offset da linha de unidades
              <span class="text-xs text-slate-500 block font-normal">Linhas após elementos onde ficam as unidades</span>
            </label>
            <input
              type="number"
              [(ngModel)]="config().unidadesRowOffset"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Colunas -->
          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Coluna inicial dos elementos
              <span class="text-xs text-slate-500 block font-normal">Primeira coluna onde começam os elementos químicos</span>
            </label>
            <input
              type="number"
              [(ngModel)]="config().elementosStartColumn"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Tipo de amostra esperado
              <span class="text-xs text-slate-500 block font-normal">Valor que identifica linha como amostra (ex: SMP)</span>
            </label>
            <input
              type="text"
              [(ngModel)]="config().sampleTypeValue"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Offsets de identificação -->
          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Offset da coluna Sample ID
              <span class="text-xs text-slate-500 block font-normal">Distância da coluna Sample ID em relação ao cabeçalho</span>
            </label>
            <input
              type="text"
              [(ngModel)]="config().sampleIdColumnOffset"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Ignorar valores -->
          <div class="flex-[calc(50%-0.5rem)]">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Ignorar valores
              <span class="text-xs text-slate-500 block font-normal">
                Valores de identificação a ignorar (separados por vírgula)
              </span>
            </label>
            <input
              type="text"
              [(ngModel)]="config().hasValuesConfig"            
              placeholder="ex: texto 1, texto 2, texto 3"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Checkbox -->
          <div class="flex-[calc(50%-0.5rem)] flex items-center">
            <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                [(ngModel)]="config().hasDateConfig"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Verificar configuração de data
              <span class="text-xs text-slate-500 font-normal">(ativa validação de datas)</span>
            </label>
          </div>

        </div>
      </div>
    </div>
  }

          <!-- Results Section -->
          @if (amostras().length > 0) {
            <div class="p-6 overflow-y-auto">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-md font-bold text-slate-800">
                  Amostras Importadas ({{ amostras().length }})
                </h3>
              </div>

              <div class="space-y-4">
                @for (amostra of amostras(); track amostra.id) {
                  <div class="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
                    <div class="flex items-center gap-4 p-4 bg-slate-50">
                      <input
                        type="checkbox"
                        [checked]="selectedAmostras().has(amostra.id)"
                        (change)="toggleAmostraSelection(amostra.id)"
                        class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1">
                        <div class="flex items-center gap-3">
                          <span class="text-sm font-semibold text-slate-500">ID: {{ amostra.id }}</span>
                          <h3 class="text-md font-semibold text-slate-800">
                            {{ amostra.amostraName }}
                            @if (amostra.subIdentificacao) {
                              <span> {{ amostra.subIdentificacao }}</span>
                            }
                          </h3>
                        </div>
                        <p class="text-sm text-slate-600 mt-1">
                          📅 {{ formatDate(amostra.dataInicio, amostra.dataFim) }}
                        </p>
                      </div>
                      <button
                        (click)="toggleAmostraExpansion(amostra.id)"
                        class="p-2 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        @if (expandedAmostras().has(amostra.id)) {
                          <ng-icon name="heroChevronUp" class="h-5 w-5 text-slate-600"></ng-icon>
                        } @else {
                          <ng-icon name="heroChevronDown" class="h-5 w-5 text-slate-600"></ng-icon>
                        }
                      </button>
                    </div>

                    @if (expandedAmostras().has(amostra.id)) {
                      <div class="p-4 border-t border-slate-200">
                        <h4 class="font-semibold text-slate-700 mb-3">Elementos Analisados</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          @for (elemento of amostra.elementosAnalisados; track $index) {
                            <div class="flex flex-col">
                              <label class="text-xs font-medium text-slate-600 mb-1">
                                {{ elemento.elemento }}
                              </label>
                              <div class="flex items-center gap-2">
                                <input
                                  type="text"
                                  [(ngModel)]="elemento.valor"
                                  class="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <span class="text-sm font-medium text-slate-600 min-w-[50px]">
                                  {{ elemento.unidade }}
                                </span>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

          }

      </div>
                     @if (amostras().toString().length > 0) {
                  <div class="w-full p-4 flex justify-end shadow-sm gap-4">
                    <button
                    (click)="handleClean()"
                    class="max-w-[400px] button-gradient-orange px-6 py-2 gap-2"
                  >
                    <ng-icon name="heroXMark" class="h-5 w-5"></ng-icon>
                    Limpar
                  </button>


                    @if(selectedAmostras().size > 0){<button
                    (click)="handleSubmitSelected()"
                    class="max-w-[400px] button-gradient-blue px-6 py-2 gap-2"
                  >
                    <ng-icon name="heroCheck" class="h-5 w-5"></ng-icon>
                    Salvar Selecionadas ({{ selectedAmostras().size }})
                  </button>}
                  </div>
                }
      </div>
  `,
  host: {
    class: 'w-full h-full'
  }
})
export class UploadResultadoComponent {
  #uploadService = inject(UploadResultadoService);
  
  config = signal<Required<UploadConfig>>(DEFAULT_UPLOAD_CONFIG);
  showConfig = signal(false);
  selectedFile = signal<File | null>(null);
  amostras = signal<AmostraLabExternoFullUpload[]>([]);
  selectedAmostras = signal<Set<number>>(new Set());
  expandedAmostras = signal<Set<number>>(new Set());
  isUploading = signal(false);

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];

      if (validTypes.includes(file.type) ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.csv')) {
        this.selectedFile.set(file);
      } else {
        alert('Por favor, selecione um arquivo Excel (.xls, .xlsx) ou CSV');
        input.value = '';
      }
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
  }

  toggleConfig(): void {
    this.showConfig.update(value => !value);
  }

  handleUpload(): void {
    if (!this.selectedFile()) return;

    this.isUploading.set(true);

    if(this.config().hasValuesConfig.length > 0){
      this.config().hasValuesConfig =  (this.config().hasValuesConfig as string)?.split(',').map(item => item.trim())
    }

     this.#uploadService.upload(this.selectedFile()!, this.config()).subscribe({
      next:(result)=> {
      this.amostras.set(result);
      this.isUploading.set(false);
      this.selectedFile.set(null);
      },
      error:(err)=>{
      this.isUploading.set(false);
      }
     })
  }

  toggleAmostraSelection(id: number): void {
    const newSelected = new Set(this.selectedAmostras());
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    this.selectedAmostras.set(newSelected);
  }

  toggleAmostraExpansion(id: number): void {
    const newExpanded = new Set(this.expandedAmostras());
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    this.expandedAmostras.set(newExpanded);
  }

  handleSubmitSelected(): void {
    const selectedData = this.amostras().filter(a =>
      this.selectedAmostras().has(a.id)
    );

    // Substitua com seu service
    // this.sampleService.submitSamples(selectedData).subscribe(...)
    console.log('Enviando para backend:', selectedData);
    alert(`${selectedData.length} amostra(s) seriam enviadas para o backend`);
  }

  handleClean(){
    this.amostras.set([])
    this.selectedAmostras.set(new Set())
  }

  formatDate(inicio: string, fim: string): string {
    const inicioDate = new Date(inicio).toLocaleDateString('pt-BR');
    const fimDate = new Date(fim).toLocaleDateString('pt-BR');
    return inicio === fim ? inicioDate : `${inicioDate} à ${fimDate}`;
  }

}
import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroDocumentText,
  heroTableCells,
  heroCodeBracket,
  heroDocument,
  heroXMark,
  heroArrowDownTray,
} from '@ng-icons/heroicons/outline';

export type FormatoExportacao = 'csv' | 'json' | 'excel' | 'html';

interface OpcaoExportacao {
  formato: FormatoExportacao;
  titulo: string;
  descricao: string;
  icon: string;
  cor: string;
}

@Component({
  selector: 'app-export-modal',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroDocumentText,
      heroTableCells,
      heroCodeBracket,
      heroDocument,
      heroXMark,
      heroArrowDownTray,
    }),
  ],
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      (click)="fechar()">
      
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-slide-up"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 rounded-full p-2">
              <ng-icon name="heroArrowDownTray" size="24" class="text-blue-600"></ng-icon>
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800">Exportar Dados</h3>
              <p class="text-sm text-slate-600">Escolha o formato de exportação</p>
            </div>
          </div>
          
          <button
            (click)="fechar()"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors group">
            <ng-icon 
              name="heroXMark" 
              size="24" 
              class="text-slate-400 group-hover:text-slate-600">
            </ng-icon>
          </button>
        </div>

        <!-- Opções  -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (opcao of opcoes; track opcao.formato) {
              <button
                (click)="selecionarFormato(opcao.formato)"
                [class]="'group relative overflow-hidden rounded-xl p-6 border-2 transition-all hover:scale-105 hover:shadow-lg ' + 
                  (formatoSelecionado() === opcao.formato 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-slate-200 hover:border-blue-300 bg-white')">
                <div 
                  [class]="'mb-4 rounded-full p-3 transition-all ' + opcao.cor">
                  <ng-icon [name]="opcao.icon" size="32" class="text-white"></ng-icon>
                </div>

                <div class="text-left">
                  <h4 class="font-bold text-lg text-slate-800 mb-1">
                    {{ opcao.titulo }}
                  </h4>
                  <p class="text-sm text-slate-600">
                    {{ opcao.descricao }}
                  </p>
                </div>

                <!-- Indicador de Seleção -->
                @if (formatoSelecionado() === opcao.formato) {
                  <div class="absolute top-3 right-3">
                    <div class="bg-blue-600 rounded-full p-1">
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                }
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none"></div>
              </button>
            }
          </div>

          <!-- Info -->
          @if (formatoSelecionado()) {
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <div class="flex items-start gap-3">
                <div class="bg-blue-100 rounded-full p-1 mt-0.5">
                  <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-blue-800 font-medium">
                    {{ getInfoFormato(formatoSelecionado()!) }}
                  </p>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            (click)="fechar()"
            class="px-5 py-2.5 rounded-lg font-medium text-slate-700 hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          
          <button
            (click)="confirmarExportacao()"
            [disabled]="!formatoSelecionado()"
            [class.opacity-50]="!formatoSelecionado()"
            [class.cursor-not-allowed]="!formatoSelecionado()"
            class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:hover:from-blue-600 disabled:hover:to-blue-700 flex items-center gap-2">
            <ng-icon name="heroArrowDownTray" size="20"></ng-icon>
            Exportar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }

    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
  `]
})
export class ExportModalComponent {
  formatoSelecionado = signal<FormatoExportacao | null>(null);
  
  exportar = output<FormatoExportacao>();
  cancelar = output<void>();

  opcoes: OpcaoExportacao[] = [
    {
      formato: 'csv',
      titulo: 'CSV',
      descricao: 'Planilha compatível com Excel e outras ferramentas',
      icon: 'heroTableCells',
      cor: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      formato: 'excel',
      titulo: 'Excel',
      descricao: 'Formato nativo do Microsoft Excel com formatação',
      icon: 'heroDocumentText',
      cor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    // {
    //   formato: 'json',
    //   titulo: 'JSON',
    //   descricao: 'Formato estruturado para integração com APIs',
    //   icon: 'heroCodeBracket',
    //   cor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    // },
    // {
    //   formato: 'html',
    //   titulo: 'HTML',
    //   descricao: 'Relatório visual para impressão ou visualização',
    //   icon: 'heroDocument',
    //   cor: 'bg-gradient-to-br from-orange-500 to-orange-600',
    // },
  ];

  selecionarFormato(formato: FormatoExportacao) {
    this.formatoSelecionado.set(formato);
  }

  confirmarExportacao() {
    const formato = this.formatoSelecionado();
    if (formato) {
      this.exportar.emit(formato);
      this.fechar();
    }
  }

  fechar() {
    this.cancelar.emit();
  }

  getInfoFormato(formato: FormatoExportacao): string {
    const infos: Record<FormatoExportacao, string> = {
      csv: 'Arquivo .csv - Ideal para abrir no Excel, Google Sheets ou importar em outros sistemas.',
      excel: 'Arquivo .xlsx - Inclui formatação e é otimizado para Microsoft Excel.',
      json: 'Arquivo .json - Perfeito para desenvolvedores e integrações com sistemas.',
      html: 'Arquivo .html - Relatório visual e formatado, pronto para impressão.',
    };
    return infos[formato];
  }
}
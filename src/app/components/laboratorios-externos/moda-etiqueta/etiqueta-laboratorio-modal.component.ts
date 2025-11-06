import { Component, inject, signal, effect, OnInit, input, OutputEmitterRef, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPrinter, heroBeaker } from '@ng-icons/heroicons/outline';
import { EtiquetasService } from '../../../services/impressao-de-etiquetas.service';
import { IUser } from '../../../shared/interfaces/user.interface';
import { EtiquetaLaboratorio, Laboratorio } from '../../../shared/interfaces/laboratorios-externos.interfaces';
import { UserService } from '../../../services/user.service';


interface EtiquetaForm {
  descricao: string;
  subdescricao: string;
  descricaoRodape: string;
  rodape: string;
  userId: string;
}

@Component({
  selector: 'app-etiqueta-lab-modal',
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({ heroXMark, heroPrinter, heroBeaker })
  ],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-100 flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
      <div class="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <ng-icon name="heroBeaker" class="text-blue-600" size="24"></ng-icon>
            <h2 class="text-xl font-semibold text-gray-900">
              Configurar Etiqueta de Laboratório
            </h2>
          </div>
          <button
            type="button"
            (click)="fecharModal()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ng-icon name="heroXMark" size="24"></ng-icon>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-6">
          <!-- Laboratório -->

          <!-- Dados da Etiqueta -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Dados da Etiqueta</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData().descricao"
                  (ngModelChange)="updateFormData('descricao', $event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição principal"
                />
              </div> 

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Subdescrição
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData().subdescricao"
                  (ngModelChange)="updateFormData('subdescricao', $event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Subdescrição"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Descrição do Rodapé
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData().descricaoRodape"
                  (ngModelChange)="updateFormData('descricaoRodape', $event)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição do rodapé"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Rodapé
                </label>
                <textarea
                  [(ngModel)]="formData().rodape"
                  (ngModelChange)="updateFormData('rodape', $event)"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Texto do rodapé"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Usuário -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Usuário Responsável</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Selecionar Usuário *
              </label>
              <select
                [(ngModel)]="formData().userId"
                (ngModelChange)="updateFormData('userId', $event)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione um usuário</option>
                @for (user of usuarios(); track user.email) {
                  <option [value]="user.email">
                    {{ user.name }} - {{ user.area || 'N/A' }}
                  </option>
                }
              </select>
            </div>

            @if (usuarioSelecionado(); as user) {
              <div class="p-4 bg-gray-50 rounded-md border border-gray-200">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Nome:</span>
                    <span class="ml-2 text-gray-900">{{ user.name }}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Email:</span>
                    <span class="ml-2 text-gray-900">{{ user.email }}</span>
                  </div>
                  @if (user.phone) {
                    <div>
                      <span class="font-medium text-gray-700">Telefone:</span>
                      <span class="ml-2 text-gray-900">{{ user.phone }}</span>
                    </div>
                  }
                  @if (user.funcao) {
                    <div>
                      <span class="font-medium text-gray-700">Função:</span>
                      <span class="ml-2 text-gray-900">{{ user.funcao }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            (click)="fecharModal()"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            (click)="imprimirEtiqueta()"
            [disabled]="!isFormValid() || isImprimindo()"
            class="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isImprimindo()) {
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Imprimindo...</span>
            } @else {
              <ng-icon name="heroPrinter" size="18"></ng-icon>
              <span>Imprimir Etiqueta</span>
            }
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class EtiquetaLaboratorioModalComponent implements OnInit {
  private etiquetaService = inject(EtiquetasService);
  private userService = inject(UserService);

  usuarios = signal<IUser[]>([]);
  isImprimindo = signal(false);
  laboratorio = input<Laboratorio | null>(null);
  isOpen = input<boolean>(false);
  close: OutputEmitterRef<boolean> = output<boolean>();

  private readonly STORAGE_KEY = 'etiqueta_laboratorio_config';

  // Signal para o formulário
  formData = signal<EtiquetaForm>({
    descricao: '',
    subdescricao: '',
    descricaoRodape: '',
    rodape: '',
    userId: ''
  });

  // Computed signal para validação do formulário
  isFormValid = computed(() => {
    const data = this.formData();
    const hasRequiredFields = !!(data.descricao && data.userId);


    return hasRequiredFields;
  });

  // Computed signal para usuário selecionado
  usuarioSelecionado = computed(() => {
    const userId = this.formData().userId;
    if (!userId) return null;
    return this.usuarios().find(u => u.email === userId) || null;
  });

  constructor() {
    // Effect para carregar dados do laboratório quando o input mudar
    effect(() => {
      const lab = this.laboratorio();
      if (lab) {
        console.log(lab)
        this.formData.update(current => ({
          ...current,
          laboratorioNome: lab.nome || '',
          laboratorioTelefone: lab.telefone || '',
          laboratorioEmail: lab.email || ''
        }));
      }
    });
  }

  ngOnInit() {
    this.carregarUsuarios();
    this.carregarConfiguracao();
  }

  // Método para atualizar o signal do formulário
  updateFormData(field: keyof EtiquetaForm, value: string) {
    this.formData.update(current => ({
      ...current,
      [field]: value
    }));
  }


  fecharModal() {
    this.close.emit(true);
  }

  carregarUsuarios() {
    this.userService.findAllAdmins().subscribe({
      next: (user:IUser[]) => {
        if (user) {
          this.usuarios.set(user);
        }
      }
    })


  }

  carregarConfiguracao() {
    try {
      const configSalva = localStorage.getItem(this.STORAGE_KEY);
      if (configSalva) {
        const config = JSON.parse(configSalva);
        this.formData.set({
          ...this.formData(),
          ...config
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  }

  salvarConfiguracao() {
    try {
      const config = this.formData();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async imprimirEtiqueta() {
    if (!this.isFormValid()) {
      return;
    }

    this.isImprimindo.set(true);

    try {
      this.salvarConfiguracao();

      const formValue = this.formData();
      const user = this.usuarioSelecionado();

      if (!user) {
        throw new Error('Usuário não selecionado');
      }

      const etiquetaData: EtiquetaLaboratorio = {
        laboratorio: { ...this.laboratorio() },
        dados: {
          descricao: formValue.descricao,
          subdescricao: formValue.subdescricao,
          descricaoRodape: formValue.descricaoRodape,
          rodape: formValue.rodape
        },
        user: user
      };

      this.etiquetaService.imprimirEtiquetaLaboratorioBrowser(etiquetaData);

      this.fecharModal();

    } catch (error) {
      console.error('Erro ao imprimir etiqueta:', error);
      alert('Erro ao imprimir etiqueta. Tente novamente.');
    } finally {
      this.isImprimindo.set(false);
    }
  }
}
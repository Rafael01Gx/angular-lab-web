// status-modal.component.ts
import {
  Component,
  OnInit,
  inject,
  input,
  OutputEmitterRef,
  output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroXMark,
  heroTag,
  heroCheckCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroArrowPath,heroClock
} from '@ng-icons/heroicons/outline';
import {keyOfStatus, Status} from '../../../shared/enums/status.enum';
import {OrderService} from '../../../services/order.service';
import {AtualizarStatus, IOrders} from '../../../shared/interfaces/orders.interface';
import {ToastrService} from '../../../services/toastr.service';


@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      heroXMark,
      heroTag,
      heroCheckCircle,
      heroExclamationTriangle,
      heroInformationCircle,
      heroArrowPath,
      heroClock
    })
  ],
  template: `
    <!-- Backdrop -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        (click)="fecharModal()">

        <!-- Modal -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 rounded-lg">
                <ng-icon name="heroTag" class="w-5 h-5 text-blue-600"></ng-icon>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">Alterar Status</h3>
                <p class="text-sm text-slate-500">Ordem: {{ ordem()?.id }}</p>
              </div>
            </div>
            <button
              (click)="fecharModal()"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200">
              <ng-icon name="heroXMark" class="w-5 h-5 text-slate-400"></ng-icon>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Status atual -->
            <div class="bg-slate-50 flex justify-end items-center rounded-lg p-4">
              <span class="text-sm font-medium text-slate-700 block mb-2 mr-auto">Status Atual</span>
              <div class="flex items-center gap-2">
    <span class="px-3 py-1 rounded-full text-sm font-medium"
          [ngClass]="getStatusClass(ordem()?.status)">
    {{ ordem()?.status || 'Sem Status' }}
    </span>
                <ng-icon
                  [name]="getStatusIcon(ordem()?.status)"
                  class="w-4 h-4"
                  [ngClass]="getStatusIconClass(ordem()?.status)">
                </ng-icon>
              </div>
            </div>

            <!-- Novo status -->
            <div>
              <label for="novoStatus" class="text-sm font-medium text-slate-700 block mb-2">
                Novo Status *
              </label>
              <select
                id="novoStatus"
                [(ngModel)]="novoStatus"
                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                <option value="">Selecione um status</option>
                @for (status of selectOptions(); track $index) {
                  <option [value]="status"
                          [disabled]="status === ordem()?.status">
                    {{ status }}
                  </option>
                }
              </select>
            </div>

            <!-- Observação -->
            <div>
              <label for="observacao" class="text-sm font-medium text-slate-700 block mb-2">
                Observação
                <span class="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="observacao"
                [(ngModel)]="observacao"
                rows="3"
                placeholder="Adicione uma observação sobre a alteração do status..."
                class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none">
    </textarea>
              <div class="text-xs text-slate-500 mt-1">
                {{ observacao.length || 0 }}/500 caracteres
              </div>
            </div>

            <!-- Preview do novo status -->
            @if (novoStatus) {
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <ng-icon name="heroInformationCircle" class="w-5 h-5 text-blue-600 mt-0.5"></ng-icon>
                  <div>
                    <h4 class="text-sm font-medium text-blue-900 mb-1">Prévia da Alteração</h4>
                    <p class="text-sm text-blue-700">
                      O status será alterado de
                      <strong>{{ ordem()?.status || 'Sem Status' }}</strong>
                      para
                      <strong>{{ novoStatus }}</strong>
                    </p>
                    @if (getStatusDescription(novoStatus)) {
                      <p class="text-xs text-blue-600 mt-2">
                        {{ getStatusDescription(novoStatus) }}
                      </p>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Validações -->
            @if (erro) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <ng-icon name="heroExclamationTriangle" class="w-5 h-5 text-red-600 mt-0.5"></ng-icon>
                  <div>
                    <h4 class="text-sm font-medium text-red-900">Erro</h4>
                    <p class="text-sm text-red-700">{{ erro }}</p>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="flex gap-3 p-6 border-t border-slate-200">
            <button
              (click)="fecharModal()"
              class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 transition-all duration-200">
              Cancelar
            </button>
            <button
              (click)="confirmarAlteracao()"
              [disabled]="!podeConfirmar() || isLoading"
              class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center gap-2">
              <ng-icon
                name="heroArrowPath"
                class="w-4 h-4"
                [class.animate-spin]="isLoading">
              </ng-icon>
              {{ isLoading ? 'Alterando...' : 'Confirmar Alteração' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Animações do modal */
    @keyframes modalEnter {
      from {
        opacity: 0;
        transform: scale(0.95) translate(-50%, -50%);
      }
      to {
        opacity: 1;
        transform: scale(1) translate(-50%, -50%);
      }
    }

    .modal-enter {
      animation: modalEnter 0.2s ease-out;
    }
  `]
})
export class StatusModalComponent implements OnInit {
  #toastr= inject(ToastrService);
  selectOptions = input.required<Status[]>();
  isOpen = input(false);
  ordem = input.required<IOrders | null>();
  statusAlterado: OutputEmitterRef<IOrders> = output<IOrders>();
  modalFechado: OutputEmitterRef<boolean> = output<boolean>();

  private ordemService = inject(OrderService);

  novoStatus: Status | '' = '';
  observacao = '';
  erro = '';
  isLoading = false;


  ngOnInit() {
    if (this.isOpen()) {
      this.observacao = this.ordem()?.observacao || '';
    }
  }

  resetForm() {
    this.novoStatus = '';
    this.observacao = '';
    this.erro = '';
    this.isLoading = false;
  }

  fecharModal() {
    if (!this.isLoading) {
      this.resetForm();
      this.modalFechado.emit(true);
    }
  }

  podeConfirmar(): boolean {
    return !!this.novoStatus && this.novoStatus !== this.ordem()?.status;
  }

  async confirmarAlteracao() {
    if (!this.podeConfirmar() || !this.ordem) return;
    const statusKey =keyOfStatus(this.novoStatus)
    if (this.ordem()?.status === statusKey){
      this.#toastr.info(`${statusKey} já é o Status atual da Ordem de Serviço !`,'Status não foi Alterado')
      return;
    }

    this.isLoading = true;
    this.erro = '';
    try {
      const dados: AtualizarStatus = {
        status:statusKey,
        observacao: this.observacao.trim() || undefined
      };

      this.ordemService.update(this.ordem()?.id!, dados).subscribe((ordem) => {
        if (ordem) {
          this.fecharModal();
          this.#toastr.success('Status alterado com sucesso!');
          this.statusAlterado.emit(ordem);
        }
      });


    } catch (error: any) {
      this.erro = error?.message || 'Erro ao alterar status. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'AGUARDANDO':
        return 'heroClock';
      case 'AUTORIZADA':
        return 'heroCheckCircle';
      case 'EXECUCAO':
        return 'heroArrowPath';
      case 'FINALIZADA':
        return 'heroCheckCircle';
      case 'CANCELADA':
        return 'heroXCircle';
      default:
        return 'heroExclamationTriangle';
    }
  }

  getStatusIconClass(status?: string): string {
    switch (status) {
      case 'AGUARDANDO':
        return 'text-yellow-600';
      case 'AUTORIZADA':
        return 'text-blue-600';
      case 'EXECUCAO':
        return 'text-purple-600';
      case 'FINALIZADA':
        return 'text-green-600';
      case 'CANCELADA':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'AGUARDANDO':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'AUTORIZADA':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'EXECUCAO':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'FINALIZADA':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  }

  getStatusDescription(status: string): string {
    const statusKey =keyOfStatus(status)
    switch (statusKey) {
      case 'AGUARDANDO':
        return 'A ordem ficará pendente de autorização para prosseguir.';
      case 'AUTORIZADA':
        return 'A ordem estará autorizada e pronta para execução.';
      case 'EXECUCAO':
        return 'A ordem entrará em processo de execução das análises.';
      case 'FINALIZADA':
        return 'A ordem será marcada como concluída.';
      case 'CANCELADA':
        return 'A ordem será cancelada e não poderá ser processada.';
      default:
        return '';
    }
  }
}

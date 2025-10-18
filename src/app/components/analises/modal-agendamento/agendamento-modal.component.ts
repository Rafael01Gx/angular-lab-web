import {
  Component,
  OnInit,
  OutputEmitterRef,
  output,
  model,
  signal, AfterViewInit, inject,
} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroXMark, heroCalendarDays, heroCheckCircle, heroExclamationTriangle} from '@ng-icons/heroicons/outline';
import {IOrders} from '../../../shared/interfaces/orders.interface';
import {OrderService} from '../../../services/order.service';
import {ToastrService} from '../../../services/toastr.service';


interface AmostraPrazo {
  id: string;
  nomeAmostra: string;
  dataInicio: string;
  dataFim: string;
  valid: boolean;
}

@Component({
  selector: 'app-agendamento-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, DatePipe],
  viewProviders: [provideIcons({
    heroXMark,
    heroCalendarDays,
    heroCheckCircle,
    heroExclamationTriangle
  })],
  template: `
    <!-- Backdrop -->
    @if (isVisible()) {
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-999 p-4"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Container -->
        <div
          class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95lvh] overflow-hidden transform transition-all duration-300 scale-100"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div
            class="bg-gray-800 px-6 py-4 flex items-center justify-between text-white">
            <div class="flex items-center space-x-3">
              <ng-icon name="heroCalendarDays" class="text-2xl"/>
              <div>
                <h2 class="text-xl font-semibold">Agendamento de Prazos</h2>
                <div class="flex gap-4">
                  <p class="text-blue-100 text-sm">OS: {{ ordemServico()?.id }}</p>
                  <p class="text-blue-100 text-sm"> | {{ ordemServico()?.solicitante?.name!.toUpperCase() || '' }}</p>
                </div>
              </div>
            </div>
            <button
              (click)="closeModal()"
              class="p-1 hover:bg-blue-800 rounded-lg transition-colors duration-200"
            >
              <ng-icon name="heroXMark" class="text-2xl"></ng-icon>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <!-- OS Info -->
            <div class=" bg-white rounded-md border-l-4 border-1 border-blue-500 p-4 mb-6">
              <!-- Prazo Calculado da OS -->
              <div class="mt-4 p-3">
                <div class="flex items-center space-x-2 mb-2">
                  <ng-icon name="heroCalendarDays" class="text-blue-600"></ng-icon>
                  <span class="font-semibold text-gray-900">Prazo da Ordem de Serviço</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span class="text-sm text-gray-600">Início:</span>
                    <p
                      class="font-medium text-gray-900">{{ prazoCalculado.inicio ? (prazoCalculado.inicio | date: 'dd/MM/yyyy') : 'Não definido' }}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600">Fim:</span>
                    <p
                      class="font-medium text-gray-900">{{ prazoCalculado.fim ? (prazoCalculado.fim| date: 'dd/MM/yyyy') : 'Não definido' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Data de Recepção *
                    </label>
                    <input
                      type="date"
                      #dtRecepcao
                      (change)="onDataRecepcaoChange(dtRecepcao.value)"
                      [max]="minDate"
                      [value]="dataRecepcao()"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>


            <!-- Amostras -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Prazos das Amostras ({{ amostrasPrazos.length }})
              </h3>

              @for (amostra of amostrasPrazos; track amostra.id) {
                <div
                  class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  [class]="!amostra.valid ? 'border-red-300 bg-red-50': 'border-blue-300 bg-blue-50'"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <ng-icon
                        [name]="amostra.valid ? 'heroCheckCircle' : 'heroExclamationTriangle'"
                        [class]="amostra.valid ? 'text-green-500' : 'text-red-500'"
                      ></ng-icon>
                      <h4 class="font-medium text-gray-900">{{ amostra.nomeAmostra }}</h4>
                    </div>
                    <span class="text-sm text-gray-500">ID: {{ amostra.id }}</span>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Data de Início *
                      </label>
                      <input
                        type="date"
                        [(ngModel)]="amostra.dataInicio"
                        [min]="minDate"
                        (ngModelChange)="onPrazoChange()"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        [class.border-red-500]="!amostra.valid && (!amostra.dataInicio || !amostra.dataFim)"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Data de Fim *
                      </label>
                      <input
                        type="date"
                        min="amostra.dataInicio"
                        [(ngModel)]="amostra.dataFim"
                        (ngModelChange)="onPrazoChange()"
                        [min]="amostra.dataInicio"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        [class.border-red-500]="!amostra.valid && (!amostra.dataInicio || !amostra.dataFim)"
                      />
                    </div>
                  </div>

                  @if (!amostra.valid) {
                    <div class="mt-2 text-sm text-red-600 flex items-center space-x-1">
                      <ng-icon name="heroExclamationTriangle" class="text-sm"></ng-icon>
                      <span>
    @if (!amostra.dataInicio || !amostra.dataFim) {
      <span>Preencha ambas as datas.</span>
    }
                        @if (amostra.dataInicio && amostra.dataFim && amostra.dataInicio > amostra.dataFim) {
                          <span>
    A data de início deve ser anterior à data de fim.
    </span>
                        }
    </span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
            <div class="text-sm text-gray-600">
              @if (!allValid) {
                <span class="text-red-600">
              {{ invalidCount }} amostra(s) com prazos inválidos
    </span>
              }
              @if (allValid) {
                <span class="text-green-600">
    Todos os prazos são válidos
    </span>
              }
            </div>

            <div class="flex space-x-3">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 button-gradient-orange"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveAgendamento()"
                [disabled]="!allValid"
                class="px-6 py-2 button-gradient-purple"
              >
                Salvar Agendamento
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AgendamentoModalComponent implements OnInit, AfterViewInit {
  #ordemService = inject(OrderService);
  #toastr = inject(ToastrService);
  isVisible = model<boolean>(false);
  ordemServico = model<IOrders | null>(null);
  close: OutputEmitterRef<any> = output<any>();
  save: OutputEmitterRef<IOrders> = output<IOrders>();
  minDate = '';
  dataRecepcao = signal<string>('');
  amostrasPrazos: AmostraPrazo[] = [];
  prazoCalculado = {inicio: '', fim: ''};


  ngOnInit() {
    this.initializeAmostrasPrazos();
  }

  ngAfterViewInit() {
    const dateNow = new Date().toISOString().split('T')[0];
    this.minDate = dateNow;
    this.dataRecepcao.set(dateNow);
  }


  onDataRecepcaoChange(dataRecepcao
                       :
                       string
  ) {
    this.dataRecepcao.set(dataRecepcao);
  }

  initializeAmostrasPrazos() {
    if (!this.ordemServico()?.amostras) return;

    this.amostrasPrazos = this.ordemServico()?.amostras.map(amostra => ({
      id: amostra.id,
      nomeAmostra: amostra.nomeAmostra,
      dataInicio: this.extractDataInicio(amostra.prazoInicioFim),
      dataFim: this.extractDataFim(amostra.prazoInicioFim),
      valid: true
    }))!;

    this.onPrazoChange();
  }

  extractDataInicio(prazoInicioFim ?: string):string {
    if (!prazoInicioFim) return '';
    const parts = prazoInicioFim.split(' - ');
    return parts[0] || '';
  }

  extractDataFim(prazoInicioFim ?: string)
    :
    string {
    if (!prazoInicioFim) return '';
    const parts = prazoInicioFim.split(' - ');
    return parts[1] || '';
  }

  onPrazoChange() {
    this.amostrasPrazos.forEach(amostra => {
      amostra.valid = this.isAmostraValid(amostra);
    });
    this.calculatePrazoOS();
  }

  isAmostraValid(amostra
                 :
                 AmostraPrazo
  ):
    boolean {
    if (!amostra.dataInicio || !amostra.dataFim) {
      return false;
    }
    return amostra.dataInicio <= amostra.dataFim;
  }

  calculatePrazoOS() {
    const validAmostras = this.amostrasPrazos.filter(a => a.valid && a.dataInicio && a.dataFim);

    if (validAmostras.length === 0) {
      this.prazoCalculado = {inicio: '', fim: ''};
      return;
    }

    // Menor data de início
    const inicios = validAmostras.map(a => a.dataInicio);
    const menorInicio = inicios.sort()[0];

    // Maior data de fim
    const fins = validAmostras.map(a => a.dataFim);
    const maiorFim = fins.sort().reverse()[0];

    this.prazoCalculado = {
      inicio: menorInicio,
      fim: maiorFim
    };
  }

  get allValid()
    :
    boolean {
    return this.amostrasPrazos.every(a => a.valid) && this.dataRecepcao().length > 6;
  }

  get invalidCount()
    :
    number {
    return this.amostrasPrazos.filter(a => !a.valid).length;
  }

  onBackdropClick(event: MouseEvent) {
    this.closeModal();
  }

  closeModal() {
    this.isVisible.set(false);
    this.close.emit(true);
  }

  saveAgendamento() {
    if (!this.allValid || !this.ordemServico) return;

    // Atualizar a ordem de serviço com os novos prazos
    const updatedOS: IOrders = {
      ...this.ordemServico(),
      dataRecepcao: this.dataRecepcao(),
      prazoInicioFim: `${this.prazoCalculado.inicio} - ${this.prazoCalculado.fim}`,
      amostras: this.ordemServico()?.amostras.map(amostra => {
        const amostraPrazo = this.amostrasPrazos.find(ap => ap.id === amostra.id);
        if (amostraPrazo) {
          return {
            ...amostra,
            prazoInicioFim: `${amostraPrazo.dataInicio} - ${amostraPrazo.dataFim}`
          };
        }
        return amostra;
      })!
    };
    const id = this.ordemServico()?.id;
    if (!id) return;
    this.#ordemService.updateRecepcaoAgendamento(id, updatedOS).subscribe((res) => {
      if (res) {
        this.#toastr.success('Prazos definidos com sucesso!');
        this.save.emit(res)
      }
    })

    this.isVisible.set(false);
  }


  protected readonly Date = Date;
}
